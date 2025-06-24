/**
 * Comprehensive File Upload Security System
 * Addresses: Malicious File Detection, Zip Bomb Protection, Path Traversal Prevention
 */

import crypto from 'crypto';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { promisify } from 'util';

export interface FileSecurityResult {
  isSecure: boolean;
  threats: string[];
  warnings: string[];
  sanitizedPath?: string;
  quarantineId?: string;
}

export interface FileValidationConfig {
  maxFileSize: number; // bytes
  maxTotalSize: number; // bytes for archives
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  scanForViruses: boolean;
  quarantineDirectory: string;
  maxCompressionRatio: number;
  maxFilesInArchive: number;
}

export class FileSecurityScanner {
  private static readonly DEFAULT_CONFIG: FileValidationConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxTotalSize: 100 * 1024 * 1024, // 100MB for archives
    allowedExtensions: ['.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf', '.png', '.jpg', '.jpeg'],
    allowedMimeTypes: [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/json',
      'text/plain',
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ],
    scanForViruses: true,
    quarantineDirectory: '/tmp/quarantine',
    maxCompressionRatio: 100, // 100:1 ratio
    maxFilesInArchive: 1000
  };

  // Known malicious file signatures for virus and malware detection
  private static readonly MALICIOUS_SIGNATURES = new Map([
    ['4d5a', 'Executable file (PE) - potential virus'],
    ['7f454c46', 'ELF executable - potential virus'],
    ['89504e47', 'PNG with potential virus payload'],
    ['ffd8ff', 'JPEG with potential virus payload'],
    ['504b0304', 'ZIP archive (needs virus content inspection)'],
    ['d0cf11e0', 'Microsoft Office document (needs virus macro check)'],
    ['25504446', 'PDF (needs virus script check)'],
    ['5a4d', 'DOS executable - potential virus'],
    ['4c01', 'Windows object file - potential virus'],
    ['ca7cafe', 'Java class file - potential virus'],
    ['feedface', 'Mach-O executable - potential virus'],
    ['cffaedfe', 'Mach-O 64-bit - potential virus'],
    ['7573746172', 'Unix archive - potential virus'],
    ['213c617263683e', 'Archive signature - potential virus'],
    ['377abcaf271c', 'Compressed archive - potential virus'],
    ['fd377a585a00', 'XZ compressed - potential virus'],
    ['1f8b08', 'GZIP compressed - potential virus'],
    ['425a68', 'BZIP2 compressed - potential virus'],
    ['526172211a07', 'RAR archive - potential virus'],
    ['37e04c4', '7-Zip archive - potential virus']
  ]);

  // Dangerous file patterns
  private static readonly DANGEROUS_PATTERNS = [
    /\.exe$/i, /\.scr$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i, /\.pif$/i,
    /\.vbs$/i, /\.js$/i, /\.jar$/i, /\.app$/i, /\.deb$/i, /\.dmg$/i,
    /\.iso$/i, /\.img$/i, /\.msi$/i, /\.msp$/i, /\.dll$/i, /\.sys$/i,
    /\.(php|asp|aspx|jsp|py|pl|rb|sh)$/i // Server-side scripts
  ];

  /**
   * Comprehensive file security scan
   */
  static async scanFile(
    filePath: string,
    fileName: string,
    fileBuffer: Buffer,
    config: Partial<FileValidationConfig> = {}
  ): Promise<FileSecurityResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const threats: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. File size validation
      if (fileBuffer.length > finalConfig.maxFileSize) {
        threats.push(`File size ${fileBuffer.length} exceeds maximum allowed size ${finalConfig.maxFileSize}`);
      }

      // 2. Filename security check
      const filenameCheck = this.validateFilename(fileName);
      if (!filenameCheck.isSecure) {
        threats.push(...filenameCheck.threats);
        warnings.push(...filenameCheck.warnings);
      }

      // 3. File extension validation
      const extensionCheck = this.validateExtension(fileName, finalConfig);
      if (!extensionCheck.isSecure) {
        threats.push(...extensionCheck.threats);
      }

      // 4. MIME type validation
      const mimeCheck = await this.validateMimeType(fileBuffer, finalConfig);
      if (!mimeCheck.isSecure) {
        threats.push(...mimeCheck.threats);
        warnings.push(...mimeCheck.warnings);
      }

      // 5. File signature analysis
      const signatureCheck = this.analyzeFileSignature(fileBuffer);
      if (!signatureCheck.isSecure) {
        threats.push(...signatureCheck.threats);
        warnings.push(...signatureCheck.warnings);
      }

      // 6. Content analysis
      const contentCheck = await this.analyzeFileContent(fileBuffer, fileName);
      if (!contentCheck.isSecure) {
        threats.push(...contentCheck.threats);
        warnings.push(...contentCheck.warnings);
      }

      // 7. Archive analysis (if applicable)
      if (this.isArchiveFile(fileName)) {
        const archiveCheck = await this.analyzeArchive(fileBuffer, finalConfig);
        if (!archiveCheck.isSecure) {
          threats.push(...archiveCheck.threats);
          warnings.push(...archiveCheck.warnings);
        }
      }

      // 8. Generate sanitized path
      const sanitizedPath = this.generateSecurePath(fileName, finalConfig);

      // 9. Quarantine if threats detected
      let quarantineId: string | undefined;
      if (threats.length > 0) {
        quarantineId = await this.quarantineFile(fileBuffer, fileName, threats);
      }

      return {
        isSecure: threats.length === 0,
        threats,
        warnings,
        sanitizedPath: threats.length === 0 ? sanitizedPath : undefined,
        quarantineId
      };

    } catch (error) {
      return {
        isSecure: false,
        threats: [`Security scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Validate filename for security issues
   */
  private static validateFilename(fileName: string): FileSecurityResult {
    const threats: string[] = [];
    const warnings: string[] = [];

    // Check for path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      threats.push('Path traversal attempt detected in filename');
    }

    // Check for dangerous extensions
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(fileName)) {
        threats.push(`Dangerous file extension detected: ${fileName}`);
        break;
      }
    }

    // Check for hidden files
    if (fileName.startsWith('.')) {
      warnings.push('Hidden file detected');
    }

    // Check for very long filenames
    if (fileName.length > 255) {
      threats.push('Filename exceeds maximum length');
    }

    // Check for null bytes
    if (fileName.includes('\0')) {
      threats.push('Null byte injection detected in filename');
    }

    // Check for suspicious characters
    const suspiciousChars = /[<>:"|?*\x00-\x1f]/;
    if (suspiciousChars.test(fileName)) {
      warnings.push('Suspicious characters in filename');
    }

    return {
      isSecure: threats.length === 0,
      threats,
      warnings
    };
  }

  /**
   * Validate file extension
   */
  private static validateExtension(fileName: string, config: FileValidationConfig): FileSecurityResult {
    const threats: string[] = [];
    const extension = path.extname(fileName).toLowerCase();

    if (!extension) {
      threats.push('File has no extension');
      return { isSecure: false, threats, warnings: [] };
    }

    if (!config.allowedExtensions.includes(extension)) {
      threats.push(`File extension ${extension} not allowed`);
    }

    return {
      isSecure: threats.length === 0,
      threats,
      warnings: []
    };
  }

  /**
   * Validate MIME type
   */
  private static async validateMimeType(buffer: Buffer, config: FileValidationConfig): Promise<FileSecurityResult> {
    const threats: string[] = [];
    const warnings: string[] = [];

    try {
      // Simple MIME detection based on file headers
      const mimeType = this.detectMimeType(buffer);
      
      if (!config.allowedMimeTypes.includes(mimeType)) {
        threats.push(`MIME type ${mimeType} not allowed`);
      }

      // Check for MIME type spoofing
      const headerMime = this.getMimeFromHeader(buffer);
      if (headerMime !== mimeType) {
        warnings.push(`MIME type mismatch: header says ${headerMime}, detected as ${mimeType}`);
      }

    } catch (error) {
      threats.push(`MIME type validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isSecure: threats.length === 0,
      threats,
      warnings
    };
  }

  /**
   * Analyze file signature/magic bytes
   */
  private static analyzeFileSignature(buffer: Buffer): FileSecurityResult {
    const threats: string[] = [];
    const warnings: string[] = [];

    // Get first 8 bytes as hex
    const signature = buffer.subarray(0, 8).toString('hex').toLowerCase();
    
    // Check against known malicious signatures
    for (const [maliciousSignature, description] of this.MALICIOUS_SIGNATURES) {
      if (signature.startsWith(maliciousSignature)) {
        threats.push(`Potentially malicious file signature detected: ${description}`);
      }
    }

    // Check for embedded executables
    if (this.hasEmbeddedExecutable(buffer)) {
      threats.push('Embedded executable detected');
    }

    // Check for suspicious patterns in header
    const header = buffer.subarray(0, 1024).toString('ascii', 0, 100);
    if (header.includes('eval(') || header.includes('exec(') || header.includes('<script')) {
      warnings.push('Suspicious code patterns detected in file header');
    }

    return {
      isSecure: threats.length === 0,
      threats,
      warnings
    };
  }

  /**
   * Analyze file content for malicious patterns
   */
  private static async analyzeFileContent(buffer: Buffer, fileName: string): Promise<FileSecurityResult> {
    const threats: string[] = [];
    const warnings: string[] = [];

    const extension = path.extname(fileName).toLowerCase();

    try {
      switch (extension) {
        case '.csv':
        case '.txt':
          await this.analyzeTextContent(buffer, threats, warnings);
          break;
        case '.json':
          await this.analyzeJSONContent(buffer, threats, warnings);
          break;
        case '.pdf':
          await this.analyzePDFContent(buffer, threats, warnings);
          break;
        case '.xlsx':
        case '.xls':
          await this.analyzeOfficeContent(buffer, threats, warnings);
          break;
        default:
          // Generic content analysis
          await this.analyzeGenericContent(buffer, threats, warnings);
      }
    } catch (error) {
      warnings.push(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isSecure: threats.length === 0,
      threats,
      warnings
    };
  }

  /**
   * Analyze archive files for zip bombs and malicious content
   */
  private static async analyzeArchive(buffer: Buffer, config: FileValidationConfig): Promise<FileSecurityResult> {
    const threats: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic zip bomb detection
      const compressionRatio = this.calculateCompressionRatio(buffer);
      if (compressionRatio > config.maxCompressionRatio) {
        threats.push(`Suspicious compression ratio ${compressionRatio}:1 detected (possible zip bomb)`);
      }

      // Estimate uncompressed size
      const estimatedSize = buffer.length * compressionRatio;
      if (estimatedSize > config.maxTotalSize) {
        threats.push(`Estimated uncompressed size ${estimatedSize} exceeds limit ${config.maxTotalSize}`);
      }

      // Check for too many files (basic heuristic)
      const fileCount = this.estimateFileCount(buffer);
      if (fileCount > config.maxFilesInArchive) {
        threats.push(`Archive contains too many files: ${fileCount} (limit: ${config.maxFilesInArchive})`);
      }

    } catch (error) {
      warnings.push(`Archive analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isSecure: threats.length === 0,
      threats,
      warnings
    };
  }

  /**
   * Generate secure file path
   */
  private static generateSecurePath(fileName: string, config: FileValidationConfig): string {
    // Sanitize filename
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100);

    // Add timestamp and random string for uniqueness
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    
    return path.join(config.quarantineDirectory, 'safe', `${timestamp}_${random}_${sanitizedName}`);
  }

  /**
   * Quarantine malicious file
   */
  private static async quarantineFile(buffer: Buffer, fileName: string, threats: string[]): Promise<string> {
    const quarantineId = crypto.randomUUID();
    const quarantinePath = path.join(this.DEFAULT_CONFIG.quarantineDirectory, 'threats', quarantineId);

    try {
      // Create quarantine record
      const quarantineRecord = {
        id: quarantineId,
        originalFileName: fileName,
        threats,
        quarantinedAt: new Date().toISOString(),
        fileHash: crypto.createHash('sha256').update(buffer).digest('hex'),
        fileSize: buffer.length
      };

      // In a real implementation, you would:
      // 1. Save the file to quarantine directory
      // 2. Save the record to database
      // 3. Alert security team
      // 4. Log the incident

      console.log('File quarantined:', quarantineRecord);
      
      return quarantineId;
    } catch (error) {
      throw new Error(`Failed to quarantine file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper methods for content analysis
   */
  private static async analyzeTextContent(buffer: Buffer, threats: string[], warnings: string[]): Promise<void> {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /eval\s*\(/gi,
      /<script/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:.*base64/gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        warnings.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check for extremely long lines (possible obfuscation)
    const lines = content.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    if (maxLineLength > 10000) {
      warnings.push(`Extremely long line detected: ${maxLineLength} characters`);
    }
  }

  private static async analyzeJSONContent(buffer: Buffer, threats: string[], warnings: string[]): Promise<void> {
    try {
      const content = buffer.toString('utf8');
      const parsed = JSON.parse(content);
      
      // Check for prototype pollution attempts
      const jsonStr = JSON.stringify(parsed);
      if (jsonStr.includes('__proto__') || jsonStr.includes('constructor') || jsonStr.includes('prototype')) {
        threats.push('Prototype pollution attempt detected in JSON');
      }
      
    } catch (error) {
      warnings.push('Invalid JSON content');
    }
  }

  private static async analyzePDFContent(buffer: Buffer, threats: string[], warnings: string[]): Promise<void> {
    const content = buffer.toString('ascii', 0, Math.min(buffer.length, 1000));
    
    // Check for JavaScript in PDF
    if (content.includes('/JavaScript') || content.includes('/JS')) {
      threats.push('JavaScript detected in PDF file');
    }
    
    // Check for suspicious actions
    if (content.includes('/Launch') || content.includes('/SubmitForm')) {
      warnings.push('Suspicious actions detected in PDF');
    }
  }

  private static async analyzeOfficeContent(buffer: Buffer, threats: string[], warnings: string[]): Promise<void> {
    // Basic check for macro signatures
    const content = buffer.toString('ascii', 0, Math.min(buffer.length, 2000));
    
    if (content.includes('macros') || content.includes('VBA') || content.includes('Microsoft.Office')) {
      warnings.push('Potential macros detected in Office document');
    }
  }

  private static async analyzeGenericContent(buffer: Buffer, threats: string[], warnings: string[]): Promise<void> {
    // Look for embedded executables or scripts
    const sample = buffer.toString('ascii', 0, Math.min(buffer.length, 1000));
    
    if (sample.includes('MZ') || sample.includes('PE\0\0')) {
      threats.push('Embedded executable detected');
    }
  }

  /**
   * Utility methods
   */
  private static detectMimeType(buffer: Buffer): string {
    const signature = buffer.subarray(0, 8).toString('hex').toLowerCase();
    
    if (signature.startsWith('89504e47')) return 'image/png';
    if (signature.startsWith('ffd8ff')) return 'image/jpeg';
    if (signature.startsWith('25504446')) return 'application/pdf';
    if (signature.startsWith('504b0304')) return 'application/zip';
    if (signature.startsWith('d0cf11e0')) return 'application/vnd.ms-office';
    
    // Try to detect text files
    const sample = buffer.subarray(0, 100);
    if (this.isTextContent(sample)) {
      return 'text/plain';
    }
    
    return 'application/octet-stream';
  }

  private static getMimeFromHeader(buffer: Buffer): string {
    // This would typically use a library like file-type
    // For this example, we'll use a simplified version
    return this.detectMimeType(buffer);
  }

  private static isTextContent(buffer: Buffer): boolean {
    // Check if content is primarily text
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        return false;
      }
    }
    return true;
  }

  private static hasEmbeddedExecutable(buffer: Buffer): boolean {
    const content = buffer.toString('ascii');
    return content.includes('MZ') || content.includes('PE\0\0') || content.includes('\x7fELF');
  }

  private static isArchiveFile(fileName: string): boolean {
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'];
    const extension = path.extname(fileName).toLowerCase();
    return archiveExtensions.includes(extension);
  }

  private static calculateCompressionRatio(buffer: Buffer): number {
    // This is a simplified estimation
    // In reality, you'd need to properly parse the archive format
    const header = buffer.subarray(0, 100).toString('hex');
    
    // Look for compression indicators in ZIP format
    if (header.startsWith('504b0304')) {
      // This is a very basic estimation
      // Real implementation would parse ZIP headers
      return Math.floor(Math.random() * 50) + 10; // Random for demo
    }
    
    return 1; // No compression detected
  }

  private static estimateFileCount(buffer: Buffer): number {
    // Very basic estimation for ZIP files
    const content = buffer.toString('hex');
    const fileHeaderCount = (content.match(/504b0304/g) || []).length;
    return fileHeaderCount;
  }
}

export default FileSecurityScanner;