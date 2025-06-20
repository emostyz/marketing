import { NextRequest, NextResponse } from 'next/server';
import { DataAnalyzer } from '@/lib/data/analyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload CSV or Excel files.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    // Analyze the file
    const analyzer = new DataAnalyzer();
    const analysis = await analyzer.analyzeFile(file);
    
    // Return analysis results
    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        // Don't send the full dataset back to save bandwidth
        data: analysis.data.slice(0, 100), // First 100 rows for preview
        totalRows: analysis.data.length
      }
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Data analysis endpoint. POST a file to analyze.',
    supportedFormats: ['CSV', 'Excel (.xlsx, .xls)'],
    maxFileSize: '10MB'
  });
}