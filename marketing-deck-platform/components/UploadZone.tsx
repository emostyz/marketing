'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface UploadZoneProps {
  onDataParsed: (data: any[], fileName: string) => void;
}

export default function UploadZone({ onDataParsed }: UploadZoneProps) {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      // Ensure we're in browser environment  
      if (typeof window === 'undefined') {
        reject(new Error('File upload is only available in browser environment'));
        return;
      }
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      // Ensure we're in browser environment
      if (typeof window === 'undefined') {
        reject(new Error('File upload is only available in browser environment'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to objects with headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const result = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          }).filter(row => Object.values(row).some(val => val != null && val !== ''));
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFile = useCallback(async (file: File) => {
    setParsing(true);
    setError(null);

    try {
      let data: any[] = [];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      switch (fileExtension) {
        case 'csv':
          data = await parseCSV(file);
          break;
        case 'xlsx':
        case 'xls':
          data = await parseExcel(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      if (data.length === 0) {
        throw new Error('No data found in file');
      }

      console.log('Parsed data:', data.slice(0, 5)); // Log first 5 rows for debugging
      onDataParsed(data, file.name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
      setError(errorMessage);
      console.error('File parsing error:', err);
    } finally {
      setParsing(false);
    }
  }, [onDataParsed]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        {parsing ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">Parsing file...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isDragActive ? (
              <p className="text-blue-600">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600">
                  Drag and drop a file here, or{' '}
                  <span className="text-blue-600 font-medium">click to browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports CSV, Excel (.xlsx, .xls) files up to 10MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}