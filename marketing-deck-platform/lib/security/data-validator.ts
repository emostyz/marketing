/**
 * Comprehensive Data Validation and Sanitization Pipeline
 * Addresses: Large Data Volume Handling, Input Sanitization, Unicode Handling
 */

import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  sanitizedData?: any;
  errors: string[];
  warnings: string[];
}

export interface ValidationLimits {
  maxStringLength: number;
  maxArrayLength: number;
  maxObjectDepth: number;
  maxFileSize: number; // in bytes
  allowedTypes: string[];
}

export class DataValidator {
  private static readonly DEFAULT_CONFIG: ValidationLimits = {
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectDepth: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['string', 'number', 'boolean', 'object', 'array']
  };

  // Dangerous patterns that could indicate attacks
  private static readonly DANGEROUS_PATTERNS = [
    /(\$\{|\#\{|<%=)/g, // Template injection
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript URLs
    /data:(?!image\/)/gi, // Data URLs (except images)
    /vbscript:/gi, // VBScript URLs
    /on\w+\s*=/gi, // Event handlers
    /(\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F)/g, // Control characters
    /(\.\.|\/\.\.|\\\.\.)/g, // Path traversal
    /(union\s+select|drop\s+table|delete\s+from|insert\s+into)/gi, // SQL injection patterns
    /(or\s+1\s*=\s*1|and\s+1\s*=\s*1|'.*or.*'.*=.*')/gi, // SQL injection
    /(exec\s*\(|eval\s*\(|system\s*\()/gi, // Code execution
    /__proto__|constructor|prototype/gi, // Prototype pollution
    /\${.*?}/g, // Template literal injection
    /<\w+.*?>/gi, // HTML tags for XSS prevention
  ];

  // Unicode normalization and filtering
  private static readonly UNICODE_BLOCKS_ALLOWED = [
    /[\u0020-\u007E]/, // Basic Latin
    /[\u00A0-\u00FF]/, // Latin-1 Supplement
    /[\u0100-\u017F]/, // Latin Extended-A
    /[\u0180-\u024F]/, // Latin Extended-B
    /[\u2000-\u206F]/, // General Punctuation
    /[\u20A0-\u20CF]/, // Currency Symbols
    /[\u2100-\u214F]/, // Letterlike Symbols
    /[\u1F600-\u1F64F]/, // Emoticons
    /[\u1F300-\u1F5FF]/, // Miscellaneous Symbols
    /[\u1F680-\u1F6FF]/, // Transport and Map Symbols
    /[\u1F700-\u1F77F]/, // Alchemical Symbols
  ];

  /**
   * Comprehensive validation and sanitization
   */
  static async validateAndSanitize(
    data: any, 
    limits: Partial<ValidationLimits> = {},
    context: string = 'general'
  ): Promise<ValidationResult> {
    const finalLimits = { ...this.DEFAULT_CONFIG, ...limits };
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check data size first
      const sizeCheck = this.checkDataSize(data, finalLimits);
      if (!sizeCheck.isValid) {
        return {
          isValid: false,
          errors: [`Data exceeds size limits: ${sizeCheck.reason}`],
          warnings: []
        };
      }

      // Sanitize based on data type
      let sanitizedData: any;
      
      if (typeof data === 'string') {
        sanitizedData = this.sanitizeString(data, finalLimits, context);
      } else if (Array.isArray(data)) {
        const result = await this.sanitizeArray(data, finalLimits, context);
        sanitizedData = result.data;
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } else if (typeof data === 'object' && data !== null) {
        const result = await this.sanitizeObject(data, finalLimits, context);
        sanitizedData = result.data;
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } else {
        sanitizedData = data;
      }

      // Security validation
      const securityCheck = this.performSecurityValidation(sanitizedData);
      if (!securityCheck.isValid) {
        errors.push(...securityCheck.errors);
      }
      warnings.push(...securityCheck.warnings);

      return {
        isValid: errors.length === 0,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined,
        errors,
        warnings
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Check if data size is within acceptable limits
   */
  private static checkDataSize(data: any, limits: ValidationLimits): { isValid: boolean; reason?: string } {
    try {
      const jsonString = JSON.stringify(data);
      const sizeInBytes = new Blob([jsonString]).size;
      
      if (sizeInBytes > limits.maxFileSize) {
        return {
          isValid: false,
          reason: `Data size ${sizeInBytes} bytes exceeds limit of ${limits.maxFileSize} bytes`
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        reason: 'Failed to calculate data size'
      };
    }
  }

  /**
   * Sanitize string data
   */
  private static sanitizeString(str: string, limits: ValidationLimits, context: string): string {
    let sanitized = str;

    // Length check
    if (sanitized.length > limits.maxStringLength) {
      sanitized = sanitized.substring(0, limits.maxStringLength);
    }

    // Unicode normalization
    sanitized = sanitized.normalize('NFKC');

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Context-specific sanitization
    switch (context) {
      case 'html':
        sanitized = DOMPurify.sanitize(sanitized);
        break;
      case 'filename':
        sanitized = this.sanitizeFilename(sanitized);
        break;
      case 'sql':
        sanitized = this.escapeSQLString(sanitized);
        break;
      case 'url':
        sanitized = this.sanitizeURL(sanitized);
        break;
      default:
        // General sanitization
        sanitized = this.sanitizeGeneral(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize array data
   */
  private static async sanitizeArray(
    arr: any[], 
    limits: ValidationLimits, 
    context: string
  ): Promise<{ data: any[]; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (arr.length > limits.maxArrayLength) {
      warnings.push(`Array length ${arr.length} exceeds limit ${limits.maxArrayLength}, truncating`);
      arr = arr.slice(0, limits.maxArrayLength);
    }

    const sanitizedArray: any[] = [];
    
    for (let i = 0; i < arr.length; i++) {
      const result = await this.validateAndSanitize(arr[i], limits, context);
      if (result.isValid && result.sanitizedData !== undefined) {
        sanitizedArray.push(result.sanitizedData);
      } else {
        errors.push(`Array item ${i}: ${result.errors.join(', ')}`);
      }
      warnings.push(...result.warnings);
    }

    return {
      data: sanitizedArray,
      errors,
      warnings
    };
  }

  /**
   * Sanitize object data
   */
  private static async sanitizeObject(
    obj: Record<string, any>, 
    limits: ValidationLimits, 
    context: string,
    depth: number = 0
  ): Promise<{ data: Record<string, any>; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (depth > limits.maxObjectDepth) {
      return {
        data: {},
        errors: [`Object depth ${depth} exceeds limit ${limits.maxObjectDepth}`],
        warnings: []
      };
    }

    const sanitizedObject: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = this.sanitizeString(key, limits, 'general');
      
      // Check for dangerous keys
      if (this.isDangerousKey(sanitizedKey)) {
        warnings.push(`Skipping dangerous key: ${key}`);
        continue;
      }

      // Sanitize value
      let sanitizedValue;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const result = await this.sanitizeObject(value, limits, context, depth + 1);
        sanitizedValue = result.data;
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } else {
        const result = await this.validateAndSanitize(value, limits, context);
        if (result.isValid && result.sanitizedData !== undefined) {
          sanitizedValue = result.sanitizedData;
        } else {
          errors.push(`Object key '${key}': ${result.errors.join(', ')}`);
          continue;
        }
        warnings.push(...result.warnings);
      }

      sanitizedObject[sanitizedKey] = sanitizedValue;
    }

    return {
      data: sanitizedObject,
      errors,
      warnings
    };
  }

  /**
   * Perform security validation
   */
  private static performSecurityValidation(data: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for prototype pollution attempts
    if (this.hasPrototypePollution(data)) {
      errors.push('Prototype pollution attempt detected');
    }

    // Check for suspicious patterns in strings
    const strings = this.extractAllStrings(data);
    for (const str of strings) {
      const suspiciousPatterns = this.findSuspiciousPatterns(str);
      if (suspiciousPatterns.length > 0) {
        warnings.push(`Suspicious patterns detected: ${suspiciousPatterns.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Utility methods for specific sanitization contexts
   */
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/^\.+/, '')
      .substring(0, 255);
  }

  private static escapeSQLString(str: string): string {
    // Basic SQL injection prevention - always use parameterized queries in production
    // This method provides basic escaping but parameterized queries are the secure solution
    return str.replace(/'/g, "''").replace(/;/g, '');
  }

  private static sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  private static sanitizeGeneral(str: string): string {
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }

  private static isDangerousKey(key: string): boolean {
    const dangerousKeys = ['__proto__', 'constructor', 'prototype', 'eval', 'function'];
    return dangerousKeys.some(dangerous => key.toLowerCase().includes(dangerous));
  }

  private static hasPrototypePollution(obj: any): boolean {
    const jsonStr = JSON.stringify(obj);
    return /__proto__|constructor\.prototype|Object\.prototype/.test(jsonStr);
  }

  private static extractAllStrings(obj: any): string[] {
    const strings: string[] = [];
    
    function extract(value: any): void {
      if (typeof value === 'string') {
        strings.push(value);
      } else if (Array.isArray(value)) {
        value.forEach(extract);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(extract);
      }
    }
    
    extract(obj);
    return strings;
  }

  private static findSuspiciousPatterns(str: string): string[] {
    const found: string[] = [];
    
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(str)) {
        found.push(pattern.source);
      }
    }
    
    return found;
  }

  /**
   * Schema-based validation using Zod
   */
  static createSchemaValidator<T>(schema: z.ZodSchema<T>) {
    return async (data: unknown): Promise<ValidationResult> => {
      try {
        const parsed = schema.parse(data);
        return {
          isValid: true,
          sanitizedData: parsed,
          errors: [],
          warnings: []
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            isValid: false,
            errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
            warnings: []
          };
        }
        return {
          isValid: false,
          errors: [`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: []
        };
      }
    };
  }

  /**
   * Rate limiting data for large volumes
   */
  static async validateLargeDataset(
    data: any[], 
    batchSize: number = 100,
    limits: Partial<ValidationLimits> = {}
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => this.validateAndSanitize(item, limits))
      );
      results.push(...batchResults);
      
      // Small delay to prevent overwhelming the system
      if (i + batchSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  userProfile: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    industry: z.string().max(100).optional(),
    targetAudience: z.string().max(500).optional(),
    businessContext: z.string().max(1000).optional()
  }),

  presentationData: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    slides: z.array(z.object({
      id: z.string(),
      title: z.string().max(200),
      content: z.string().max(5000)
    })).max(100),
    metadata: z.object({
      industry: z.string().max(100).optional(),
      createdAt: z.string().datetime().optional(),
      tags: z.array(z.string().max(50)).max(20).optional()
    }).optional()
  }),

  fileUpload: z.object({
    name: z.string().min(1).max(255),
    type: z.string().max(100),
    size: z.number().positive().max(50 * 1024 * 1024), // 50MB
    content: z.string().optional()
  }),

  apiRequest: z.object({
    userId: z.string().uuid(),
    action: z.string().max(100),
    data: z.any().optional(),
    timestamp: z.string().datetime().optional()
  })
};

export default DataValidator;