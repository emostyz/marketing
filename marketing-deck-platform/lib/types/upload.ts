import { FileWithPath } from 'react-dropzone'

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  fileObject?: FileWithPath;
  url?: string;
  storagePath?: string;
  status: 'added' | 'uploading' | 'success' | 'error';
  parsedData?: {
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
  };
  error?: string;
}