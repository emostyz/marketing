// Advanced Python Analysis Engine
// Executes sophisticated analyses based on OpenAI's strategic direction

import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

export interface PythonAnalysisRequest {
  code: string
  data: any[]
  businessContext: any
  analysisType: 'statistical' | 'ml' | 'visualization' | 'comprehensive'
  iterationNumber: number
  previousResults?: any
}

export interface PythonAnalysisResult {
  success: boolean
  results?: any
  error?: string
  executionTime: number
  confidence: number
  insights: string[]
  recommendations: string[]
  visualizations: string[]
  metrics: Record<string, any>
}

export class AdvancedAnalysisEngine {
  private tempDir: string
  private pythonEnv: string

  constructor() {
    this.tempDir = '/tmp/analysis_engine'
    this.pythonEnv = process.env.PYTHON_PATH || 'python3'
  }

  /**
   * Execute comprehensive Python analysis
   */
  async executeAnalysis(request: PythonAnalysisRequest): Promise<PythonAnalysisResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🐍 Executing Python analysis (iteration ${request.iterationNumber})...`)
      
      // Ensure temp directory exists
      await this.ensureTempDirectory()
      
      // Generate Python script based on request type
      const pythonScript = await this.generatePythonScript(request)
      
      // Write data and script files
      const { dataFile, scriptFile } = await this.writeAnalysisFiles(request.data, pythonScript)
      
      // Execute Python analysis
      const results = await this.executePythonScript(scriptFile, dataFile, request.businessContext)
      
      // Clean up files
      await this.cleanupFiles([dataFile, scriptFile])
      
      const executionTime = Date.now() - startTime
      console.log(`✅ Python analysis completed in ${executionTime}ms`)
      
      return {
        success: true,
        results: results.output,
        executionTime,
        confidence: results.confidence || 70,
        insights: results.insights || [],
        recommendations: results.recommendations || [],
        visualizations: results.visualizations || [],
        metrics: results.metrics || {}
      }
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('❌ Python analysis failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        confidence: 0,
        insights: [],
        recommendations: [],
        visualizations: [],
        metrics: {}
      }
    }
  }

  /**
   * Generate Python script based on analysis type
   */
  private async generatePythonScript(request: PythonAnalysisRequest): Promise<string> {
    return `import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def comprehensive_analysis(data_file, business_context):
    """Perform comprehensive data analysis"""
    
    try:
        df = pd.read_json(data_file)
    except Exception as e:
        return {"error": "Failed to load data: " + str(e)}
    
    results = {
        "insights": [],
        "recommendations": [],
        "metrics": {},
        "visualizations": [],
        "confidence": 60
    }
    
    # Basic data info
    results["metrics"]["total_rows"] = len(df)
    results["metrics"]["total_columns"] = len(df.columns)
    results["metrics"]["missing_values"] = df.isnull().sum().sum()
    results["metrics"]["missing_percentage"] = (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
    
    # Get column types
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    results["metrics"]["numeric_columns"] = len(numeric_cols)
    results["metrics"]["categorical_columns"] = len(categorical_cols)
    
    # Statistical analysis for numeric columns
    if numeric_cols:
        for col in numeric_cols[:3]:
            try:
                desc = df[col].describe()
                results["insights"].append(col + ": Mean=" + str(round(desc['mean'], 2)) + ", Range=[" + str(round(desc['min'], 2)) + ", " + str(round(desc['max'], 2)) + "]")
            except Exception as e:
                pass
    
    # Set confidence based on data quality
    confidence = 60
    if results["metrics"]["missing_percentage"] < 5:
        confidence += 10
    if len(numeric_cols) >= 3:
        confidence += 10
    if len(df) > 100:
        confidence += 10
    
    results["confidence"] = min(confidence, 95)
    
    # Add basic recommendations
    if results["metrics"]["missing_percentage"] > 10:
        results["recommendations"].append("Address missing data issues")
    
    return results

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python script.py <data_file> <business_context>"}))
        sys.exit(1)
    
    data_file = sys.argv[1]
    business_context = sys.argv[2]
    
    try:
        results = comprehensive_analysis(data_file, business_context)
        print(json.dumps(results, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
`
  }

  /**
   * Write analysis files to disk
   */
  private async writeAnalysisFiles(data: any[], pythonScript: string): Promise<{dataFile: string, scriptFile: string}> {
    const timestamp = Date.now()
    const dataFile = path.join(this.tempDir, `data_${timestamp}.json`)
    const scriptFile = path.join(this.tempDir, `analysis_${timestamp}.py`)
    
    // Write data file
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
    
    // Write script file
    await fs.writeFile(scriptFile, pythonScript)
    
    return { dataFile, scriptFile }
  }

  /**
   * Execute Python script
   */
  private async executePythonScript(scriptFile: string, dataFile: string, businessContext: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const contextString = JSON.stringify(businessContext || {})
      const python = spawn(this.pythonEnv, [scriptFile, dataFile, contextString])
      
      let stdout = ''
      let stderr = ''
      
      python.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      python.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            const results = JSON.parse(stdout)
            resolve(results)
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${stdout}`))
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`))
        }
      })
      
      python.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * Ensure temp directory exists
   */
  private async ensureTempDirectory(): Promise<void> {
    try {
      await fs.access(this.tempDir)
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true })
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanupFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

export default AdvancedAnalysisEngine