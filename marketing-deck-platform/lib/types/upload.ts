import { FileWithPath } from 'react-dropzone'

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  fileObject?: FileWithPath;
  url?: string;
  storagePath?: string;
  datasetId?: string; // ID of the stored dataset in database
  status: 'added' | 'uploading' | 'success' | 'error';
  parsedData?: {
    data: any[]; // The actual row data  
    rows: any[];
    columns: Array<{ name: string; type: string }>;
    rowCount: number;
    insights: {
      timeSeriesDetected: boolean;
      dataQuality: any;
      potentialMetrics: string[];
      potentialDimensions: string[];
    };
    summary: any;
    statistics?: any; // Column statistics
  };
  error?: string;
}