import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ProcessedColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  statistics?: {
    min?: number;
    max?: number;
    avg?: number;
    uniqueCount: number;
    nullCount: number;
  };
}

export interface ProcessedDataset {
  fileName: string;
  fileType: string;
  fileSize: number;
  columns: ProcessedColumn[];
  data: Record<string, any>[];
  rowCount: number;
  metadata: {
    processingTime: number;
    encoding?: string;
    worksheetName?: string;
  };
}

/**
 * Detect data type from sample values
 */
function detectDataType(values: any[]): 'string' | 'number' | 'date' | 'boolean' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';
  
  // Check for boolean
  const booleanValues = nonNullValues.filter(v => 
    v === true || v === false || 
    (typeof v === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toLowerCase()))
  );
  if (booleanValues.length / nonNullValues.length > 0.8) return 'boolean';
  
  // Check for numbers
  const numberValues = nonNullValues.filter(v => !isNaN(Number(v)) && v !== '');
  if (numberValues.length / nonNullValues.length > 0.8) return 'number';
  
  // Check for dates
  const dateValues = nonNullValues.filter(v => {
    if (typeof v === 'string') {
      const date = new Date(v);
      return !isNaN(date.getTime()) && v.match(/\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/);
    }
    return false;
  });
  if (dateValues.length / nonNullValues.length > 0.6) return 'date';
  
  return 'string';
}

/**
 * Calculate statistics for a column
 */
function calculateColumnStats(values: any[], dataType: string) {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const uniqueValues = [...new Set(nonNullValues)];
  
  const baseStats = {
    uniqueCount: uniqueValues.length,
    nullCount: values.length - nonNullValues.length
  };
  
  if (dataType === 'number') {
    const numbers = nonNullValues.map(v => Number(v)).filter(n => !isNaN(n));
    if (numbers.length > 0) {
      return {
        ...baseStats,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        avg: numbers.reduce((sum, n) => sum + n, 0) / numbers.length
      };
    }
  }
  
  return baseStats;
}

/**
 * Process CSV file with Papa Parse
 */
export async function processCSVFile(file: File): Promise<ProcessedDataset> {
  const startTime = Date.now();
  
  try {
    // Convert file to text for server-side processing
    const text = await file.text();
    
    return new Promise((resolve, reject) => {
      console.log('📄 CSV text length:', text.length);
      console.log('📄 CSV preview:', text.substring(0, 200));
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
        try {
          console.log('📊 Papa.parse results:', {
            dataLength: results.data.length,
            errors: results.errors,
            meta: results.meta
          });
          
          const data = results.data as Record<string, any>[];
          const headers = Object.keys(data[0] || {});
          
          // Process columns
          const columns: ProcessedColumn[] = headers.map(header => {
            const columnValues = data.map(row => row[header]);
            const dataType = detectDataType(columnValues);
            const sampleValues = [...new Set(columnValues)].slice(0, 10);
            const statistics = calculateColumnStats(columnValues, dataType);
            
            return {
              name: header,
              type: dataType,
              sampleValues,
              statistics
            };
          });
          
          resolve({
            fileName: file.name,
            fileType: 'csv',
            fileSize: file.size,
            columns,
            data,
            rowCount: data.length,
            metadata: {
              processingTime: Date.now() - startTime,
              encoding: 'UTF-8'
            }
          });
        } catch (error) {
          reject(new Error(`CSV processing error: ${error}`));
        }
      },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`CSV file reading error: ${error}`);
  }
}

/**
 * Process Excel file with SheetJS
 */
export async function processExcelFile(file: File): Promise<ProcessedDataset> {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Use first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null 
        }) as any[][];
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        // Extract headers and data
        const headers = jsonData[0].map((h: any) => String(h || '').trim()).filter(h => h);
        const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));
        
        // Convert to objects
        const excelData = dataRows.map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] ?? null;
          });
          return obj;
        });
        
        // Process columns
        const columns: ProcessedColumn[] = headers.map(header => {
          const columnValues = excelData.map(row => row[header]);
          const dataType = detectDataType(columnValues);
          const sampleValues = [...new Set(columnValues)].slice(0, 10);
          const statistics = calculateColumnStats(columnValues, dataType);
          
          return {
            name: header,
            type: dataType,
            sampleValues,
            statistics
          };
        });
        
        resolve({
          fileName: file.name,
          fileType: 'excel',
          fileSize: file.size,
          columns,
          data: excelData,
          rowCount: excelData.length,
          metadata: {
            processingTime: Date.now() - startTime,
            worksheetName
          }
        });
      } catch (error) {
        reject(new Error(`Excel processing error: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process JSON file
 */
export async function processJSONFile(file: File): Promise<ProcessedDataset> {
  const startTime = Date.now();
  
  try {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    
    let data: Record<string, any>[];
    
    if (Array.isArray(jsonData)) {
      data = jsonData;
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      data = [jsonData];
    } else {
      throw new Error('JSON must be an object or array of objects');
    }
    
    if (data.length === 0) {
      throw new Error('JSON file contains no data');
    }
    
    // Get all possible keys from all objects
    const allKeys = new Set<string>();
    data.forEach(obj => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => allKeys.add(key));
      }
    });
    
    const headers = Array.from(allKeys);
    
    // Process columns
    const columns: ProcessedColumn[] = headers.map(header => {
      const columnValues = data.map(row => row[header]);
      const dataType = detectDataType(columnValues);
      const sampleValues = [...new Set(columnValues)].slice(0, 10);
      const statistics = calculateColumnStats(columnValues, dataType);
      
      return {
        name: header,
        type: dataType,
        sampleValues,
        statistics
      };
    });
    
    return {
      fileName: file.name,
      fileType: 'json',
      fileSize: file.size,
      columns,
      data,
      rowCount: data.length,
      metadata: {
        processingTime: Date.now() - startTime,
        encoding: 'UTF-8'
      }
    };
  } catch (error) {
    throw new Error(`JSON processing error: ${error}`);
  }
}

/**
 * Main function to process any supported file type
 */
export async function processDataFile(file: File): Promise<ProcessedDataset> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    return processCSVFile(file);
  } else if (
    fileType.includes('spreadsheet') || 
    fileName.endsWith('.xlsx') || 
    fileName.endsWith('.xls')
  ) {
    return processExcelFile(file);
  } else if (fileType === 'application/json' || fileName.endsWith('.json')) {
    return processJSONFile(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Please upload CSV, Excel, or JSON files.`);
  }
}