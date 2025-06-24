/**
 * Database Transaction Safety Manager
 * Addresses: Concurrent Transaction Safety, Connection Pool Management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  transactionId: string;
  duration: number;
  retryCount: number;
}

export interface TransactionConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  isolationLevel: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  enableDeadlockDetection: boolean;
  enableAutoRollback: boolean;
}

export interface ConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  connectionRetryDelay: number;
  healthCheckInterval: number;
}

export interface DatabaseOperation {
  query: string;
  params?: any[];
  retryable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class TransactionManager extends EventEmitter {
  private supabase: SupabaseClient;
  private activeTransactions: Map<string, TransactionContext> = new Map();
  private connectionPool: ConnectionPool;
  private config: TransactionConfig;
  
  private static readonly DEFAULT_CONFIG: TransactionConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    isolationLevel: 'READ_COMMITTED',
    enableDeadlockDetection: true,
    enableAutoRollback: true
  };

  private static readonly DEFAULT_POOL_CONFIG: ConnectionPoolConfig = {
    maxConnections: 20,
    minConnections: 2,
    acquireTimeout: 10000,
    idleTimeout: 300000,
    connectionRetryDelay: 1000,
    healthCheckInterval: 30000
  };

  constructor(
    config: Partial<TransactionConfig> = {},
    poolConfig: Partial<ConnectionPoolConfig> = {}
  ) {
    super();
    
    this.config = { ...TransactionManager.DEFAULT_CONFIG, ...config };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.connectionPool = new ConnectionPool({
      ...TransactionManager.DEFAULT_POOL_CONFIG,
      ...poolConfig
    });

    this.setupEventHandlers();
    this.startHealthMonitoring();
  }

  /**
   * Execute a transaction with automatic retry and rollback
   */
  async executeTransaction<T>(
    operations: DatabaseOperation[],
    config: Partial<TransactionConfig> = {}
  ): Promise<TransactionResult<T>> {
    const transactionId = this.generateTransactionId();
    const startTime = Date.now();
    const finalConfig = { ...this.config, ...config };
    let retryCount = 0;

    const context: TransactionContext = {
      id: transactionId,
      operations,
      config: finalConfig,
      startTime,
      status: 'pending',
      connection: null,
      savepoints: []
    };

    this.activeTransactions.set(transactionId, context);

    try {
      return await this.attemptTransaction<T>(context, retryCount);
    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Execute transaction with optimistic locking
   */
  async executeWithOptimisticLock<T>(
    tableName: string,
    recordId: string,
    versionColumn: string,
    expectedVersion: number,
    updateOperation: (currentData: any) => Promise<any>
  ): Promise<TransactionResult<T>> {
    const transactionId = this.generateTransactionId();
    const startTime = Date.now();

    try {
      // 1. Read current record with version
      const { data: currentRecord, error: readError } = await this.supabase
        .from(tableName)
        .select('*')
        .eq('id', recordId)
        .single();

      if (readError) {
        throw new Error(`Failed to read record: ${readError.message}`);
      }

      // 2. Check version
      if (currentRecord[versionColumn] !== expectedVersion) {
        throw new Error(`Optimistic lock failure: expected version ${expectedVersion}, got ${currentRecord[versionColumn]}`);
      }

      // 3. Perform update operation
      const updatedData = await updateOperation(currentRecord);
      updatedData[versionColumn] = expectedVersion + 1;

      // 4. Update with version check
      const { data: result, error: updateError } = await this.supabase
        .from(tableName)
        .update(updatedData)
        .eq('id', recordId)
        .eq(versionColumn, expectedVersion)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update record: ${updateError.message}`);
      }

      return {
        success: true,
        data: result,
        transactionId,
        duration: Date.now() - startTime,
        retryCount: 0
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        duration: Date.now() - startTime,
        retryCount: 0
      };
    }
  }

  /**
   * Execute transaction with distributed lock
   */
  async executeWithDistributedLock<T>(
    lockKey: string,
    lockTimeout: number,
    operation: () => Promise<T>
  ): Promise<TransactionResult<T>> {
    const transactionId = this.generateTransactionId();
    const startTime = Date.now();

    try {
      // Acquire distributed lock
      const lockAcquired = await this.acquireDistributedLock(lockKey, lockTimeout);
      if (!lockAcquired) {
        throw new Error(`Failed to acquire lock for key: ${lockKey}`);
      }

      try {
        const result = await operation();
        
        return {
          success: true,
          data: result,
          transactionId,
          duration: Date.now() - startTime,
          retryCount: 0
        };

      } finally {
        await this.releaseDistributedLock(lockKey);
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        duration: Date.now() - startTime,
        retryCount: 0
      };
    }
  }

  /**
   * Batch operations with automatic chunking
   */
  async executeBatch<T>(
    operations: DatabaseOperation[],
    batchSize: number = 100
  ): Promise<TransactionResult<T[]>> {
    const transactionId = this.generateTransactionId();
    const startTime = Date.now();
    const results: any[] = [];

    try {
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const batchResult = await this.executeTransaction(batch);
        
        if (!batchResult.success) {
          throw new Error(`Batch failed at index ${i}: ${batchResult.error}`);
        }
        
        results.push(...(batchResult.data || []));
        
        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < operations.length) {
          await this.sleep(10);
        }
      }

      return {
        success: true,
        data: results,
        transactionId,
        duration: Date.now() - startTime,
        retryCount: 0
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        duration: Date.now() - startTime,
        retryCount: 0
      };
    }
  }

  /**
   * Private implementation methods
   */
  private async attemptTransaction<T>(
    context: TransactionContext,
    retryCount: number
  ): Promise<TransactionResult<T>> {
    try {
      // Acquire connection from pool
      context.connection = await this.connectionPool.acquire();
      context.status = 'active';

      // Begin transaction
      await this.beginTransaction(context);

      // Execute operations
      const results: any[] = [];
      for (const operation of context.operations) {
        const result = await this.executeOperation(context, operation);
        results.push(result);
      }

      // Commit transaction
      await this.commitTransaction(context);
      context.status = 'committed';

      this.emit('transactionCompleted', {
        transactionId: context.id,
        duration: Date.now() - context.startTime,
        operationCount: context.operations.length
      });

      return {
        success: true,
        data: results,
        transactionId: context.id,
        duration: Date.now() - context.startTime,
        retryCount
      };

    } catch (error) {
      await this.handleTransactionError(context, error as Error);

      // Determine if we should retry
      if (retryCount < context.config.maxRetries && this.isRetryableError(error as Error)) {
        await this.sleep(context.config.retryDelay * Math.pow(2, retryCount));
        return this.attemptTransaction<T>(context, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId: context.id,
        duration: Date.now() - context.startTime,
        retryCount
      };

    } finally {
      if (context.connection) {
        await this.connectionPool.release(context.connection);
      }
    }
  }

  private async beginTransaction(context: TransactionContext): Promise<void> {
    // In Supabase/PostgreSQL, we use the RPC function to begin transaction
    const { error } = await this.supabase.rpc('begin_transaction', {
      isolation_level: context.config.isolationLevel
    });

    if (error) {
      throw new Error(`Failed to begin transaction: ${error.message}`);
    }
  }

  private async executeOperation(context: TransactionContext, operation: DatabaseOperation): Promise<any> {
    try {
      // Execute the database operation
      // This is simplified - in a real implementation you'd parse the query and use appropriate Supabase methods
      const { data, error } = await this.supabase.rpc('execute_sql', {
        sql_query: operation.query,
        sql_params: operation.params || []
      });

      if (error) {
        throw new Error(`Operation failed: ${error.message}`);
      }

      return data;

    } catch (error) {
      if (context.config.enableDeadlockDetection && this.isDeadlockError(error as Error)) {
        this.emit('deadlockDetected', {
          transactionId: context.id,
          operation: operation.query
        });
      }

      throw error;
    }
  }

  private async commitTransaction(context: TransactionContext): Promise<void> {
    const { error } = await this.supabase.rpc('commit_transaction');
    
    if (error) {
      throw new Error(`Failed to commit transaction: ${error.message}`);
    }
  }

  private async rollbackTransaction(context: TransactionContext): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('rollback_transaction');
      
      if (error) {
        console.error('Rollback failed:', error);
      }

      context.status = 'rolled_back';
      
      this.emit('transactionRolledBack', {
        transactionId: context.id,
        duration: Date.now() - context.startTime
      });

    } catch (error) {
      console.error('Rollback error:', error);
    }
  }

  private async handleTransactionError(context: TransactionContext, error: Error): Promise<void> {
    context.status = 'error';
    
    if (context.config.enableAutoRollback) {
      await this.rollbackTransaction(context);
    }

    this.emit('transactionError', {
      transactionId: context.id,
      error: error.message,
      duration: Date.now() - context.startTime
    });
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'connection timeout',
      'deadlock detected',
      'serialization failure',
      'connection lost',
      'temporary failure'
    ];

    return retryableErrors.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }

  private isDeadlockError(error: Error): boolean {
    return error.message.toLowerCase().includes('deadlock') ||
           error.message.includes('40P01'); // PostgreSQL deadlock error code
  }

  private async acquireDistributedLock(lockKey: string, timeout: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('acquire_advisory_lock', {
        lock_key: lockKey,
        timeout_ms: timeout
      });

      return !error && data === true;

    } catch (error) {
      console.error('Lock acquisition error:', error);
      return false;
    }
  }

  private async releaseDistributedLock(lockKey: string): Promise<void> {
    try {
      await this.supabase.rpc('release_advisory_lock', {
        lock_key: lockKey
      });

    } catch (error) {
      console.error('Lock release error:', error);
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventHandlers(): void {
    this.on('deadlockDetected', (data) => {
      console.warn('Deadlock detected:', data);
    });

    this.on('transactionError', (data) => {
      console.error('Transaction error:', data);
    });

    this.on('connectionPoolExhausted', () => {
      console.error('Connection pool exhausted - consider increasing pool size');
    });
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.checkTransactionHealth();
    }, 30000); // Check every 30 seconds
  }

  private checkTransactionHealth(): void {
    const now = Date.now();
    const staleTransactions = Array.from(this.activeTransactions.values())
      .filter(tx => now - tx.startTime > tx.config.timeout);

    for (const staleTx of staleTransactions) {
      console.warn(`Stale transaction detected: ${staleTx.id}`);
      this.handleTransactionError(staleTx, new Error('Transaction timeout'));
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get transaction statistics
   */
  getStatistics(): TransactionStatistics {
    return {
      activeTransactions: this.activeTransactions.size,
      connectionPoolStats: this.connectionPool.getStatistics(),
      totalTransactions: this.listenerCount('transactionCompleted'),
      failedTransactions: this.listenerCount('transactionError'),
      deadlocks: this.listenerCount('deadlockDetected')
    };
  }
}

/**
 * Connection Pool Manager
 */
class ConnectionPool {
  private config: ConnectionPoolConfig;
  private availableConnections: PooledConnection[] = [];
  private busyConnections: Set<PooledConnection> = new Set();
  private waitingQueue: (() => void)[] = [];
  private isInitialized = false;

  constructor(config: ConnectionPoolConfig) {
    this.config = config;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create minimum connections
    for (let i = 0; i < this.config.minConnections; i++) {
      try {
        const connection = await this.createConnection();
        this.availableConnections.push(connection);
      } catch (error) {
        console.error('Failed to create initial connection:', error);
      }
    }

    this.isInitialized = true;
    this.startHealthCheck();
  }

  async acquire(): Promise<PooledConnection> {
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.pop()!;
      this.busyConnections.add(connection);
      connection.lastUsed = new Date();
      return connection;
    }

    if (this.busyConnections.size < this.config.maxConnections) {
      const connection = await this.createConnection();
      this.busyConnections.add(connection);
      return connection;
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection acquisition timeout'));
      }, this.config.acquireTimeout);

      this.waitingQueue.push(() => {
        clearTimeout(timeout);
        this.acquire().then(resolve).catch(reject);
      });
    });
  }

  async release(connection: PooledConnection): Promise<void> {
    this.busyConnections.delete(connection);
    
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      this.busyConnections.add(connection);
      waiter();
    } else {
      this.availableConnections.push(connection);
    }
  }

  private async createConnection(): Promise<PooledConnection> {
    const connection: PooledConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client: createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ),
      createdAt: new Date(),
      lastUsed: new Date(),
      isHealthy: true
    };

    return connection;
  }

  private startHealthCheck(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    const now = new Date();
    
    // Remove idle connections
    this.availableConnections = this.availableConnections.filter(conn => {
      const idleTime = now.getTime() - conn.lastUsed.getTime();
      return idleTime < this.config.idleTimeout;
    });

    // Ensure minimum connections
    while (this.availableConnections.length < this.config.minConnections) {
      try {
        const connection = await this.createConnection();
        this.availableConnections.push(connection);
      } catch (error) {
        console.error('Failed to create health check connection:', error);
        break;
      }
    }
  }

  getStatistics(): PoolStatistics {
    return {
      available: this.availableConnections.length,
      busy: this.busyConnections.size,
      waiting: this.waitingQueue.length,
      total: this.availableConnections.length + this.busyConnections.size
    };
  }
}

/**
 * Interfaces
 */
interface TransactionContext {
  id: string;
  operations: DatabaseOperation[];
  config: TransactionConfig;
  startTime: number;
  status: 'pending' | 'active' | 'committed' | 'rolled_back' | 'error';
  connection: PooledConnection | null;
  savepoints: string[];
}

interface PooledConnection {
  id: string;
  client: SupabaseClient;
  createdAt: Date;
  lastUsed: Date;
  isHealthy: boolean;
}

interface TransactionStatistics {
  activeTransactions: number;
  connectionPoolStats: PoolStatistics;
  totalTransactions: number;
  failedTransactions: number;
  deadlocks: number;
}

interface PoolStatistics {
  available: number;
  busy: number;
  waiting: number;
  total: number;
}

export default TransactionManager;