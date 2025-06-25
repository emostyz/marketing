import { spawn, ChildProcess } from 'child_process'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface PythonAnalysisResult {
  success: boolean
  output?: any
  error?: string
  executionTime: number
  code: string
}

export class PythonExecutor {
  private static tempDir = path.join(process.cwd(), 'temp', 'python')
  
  static {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  static async executeAnalysis(pythonCode: string, data: any[]): Promise<PythonAnalysisResult> {
    const startTime = Date.now()
    const sessionId = crypto.randomUUID()
    
    try {
      // Create data file
      const dataFile = path.join(this.tempDir, `data_${sessionId}.json`)
      fs.writeFileSync(dataFile, JSON.stringify(data))
      
      // Create Python script with data loading and analysis
      const analysisScript = this.buildAnalysisScript(pythonCode, dataFile)
      const scriptFile = path.join(this.tempDir, `analysis_${sessionId}.py`)
      fs.writeFileSync(scriptFile, analysisScript)
      
      // Execute Python script
      const result = await this.runPythonScript(scriptFile)
      
      // Cleanup
      this.cleanup([dataFile, scriptFile])
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: Date.now() - startTime,
        code: pythonCode
      }
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        code: pythonCode
      }
    }
  }

  private static buildAnalysisScript(userCode: string, dataFile: string): string {
    return `
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# Load data
with open('${dataFile}', 'r') as f:
    raw_data = json.load(f)

# Convert to DataFrame
df = pd.DataFrame(raw_data)

# Print basic info about the dataset
import json
print("DATASET_INFO:", json.dumps({
    "shape": df.shape,
    "columns": df.columns.tolist(),
    "dtypes": {str(k): str(v) for k, v in df.dtypes.to_dict().items()},
    "memory_usage": int(df.memory_usage(deep=True).sum())
}))

# Convert numeric columns
for col in df.columns:
    if df[col].dtype == 'object':
        try:
            df[col] = pd.to_numeric(df[col], errors='ignore')
        except:
            pass

# Identify column types
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
datetime_cols = []

# Try to parse datetime columns
for col in categorical_cols:
    try:
        df[col + '_parsed'] = pd.to_datetime(df[col])
        datetime_cols.append(col)
    except:
        pass

print("COLUMN_TYPES:", json.dumps({
    "numeric": numeric_cols,
    "categorical": categorical_cols,
    "datetime": datetime_cols
}))

# Custom analysis code
try:
${userCode.split('\n').map(line => line.trim() ? '    ' + line : '').join('\n')}
except Exception as e:
    print("USER_CODE_ERROR:", str(e))

# Generate summary statistics
if numeric_cols:
    stats_dict = df[numeric_cols].describe().to_dict()
    # Convert numpy types to native Python types
    for col in stats_dict:
        for stat in stats_dict[col]:
            if hasattr(stats_dict[col][stat], 'item'):
                stats_dict[col][stat] = stats_dict[col][stat].item()
    print("SUMMARY_STATS:", json.dumps(stats_dict))

# Generate correlation matrix for numeric columns
if len(numeric_cols) > 1:
    correlations = df[numeric_cols].corr().to_dict()
    # Convert numpy types to native Python types
    for col in correlations:
        for stat in correlations[col]:
            if hasattr(correlations[col][stat], 'item'):
                correlations[col][stat] = correlations[col][stat].item()
    print("CORRELATIONS:", json.dumps(correlations))

# Identify trends and patterns
analysis_results = {}

# Calculate growth rates for numeric columns
for col in numeric_cols:
    if len(df) > 1:
        first_val = df[col].iloc[0]
        last_val = df[col].iloc[-1]
        if first_val != 0:
            growth_rate = ((last_val - first_val) / first_val) * 100
            analysis_results[f"{col}_growth_rate"] = float(growth_rate)

# Find top performers for categorical analysis
for cat_col in categorical_cols:
    if cat_col not in datetime_cols:
        for num_col in numeric_cols:
            top_categories = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False).head(3)
            top_dict = {}
            for k, v in top_categories.to_dict().items():
                top_dict[str(k)] = float(v) if hasattr(v, 'item') else float(v)
            analysis_results[f"top_{cat_col}_by_{num_col}"] = top_dict

print("ANALYSIS_RESULTS:", json.dumps(analysis_results))

# Generate insights
insights = []

# Revenue/performance insights
if numeric_cols:
    for col in numeric_cols:
        values = df[col].dropna()
        if len(values) > 0:
            mean_val = float(values.mean())
            median_val = float(values.median())
            std_val = float(values.std())
            
            if 'revenue' in col.lower() or 'sales' in col.lower():
                growth_rate = analysis_results.get(f"{col}_growth_rate", 0)
                insights.append({
                    "type": "revenue",
                    "metric": col,
                    "value": mean_val,
                    "trend": "positive" if growth_rate > 0 else "negative",
                    "insight": f"Average {col} is {mean_val:,.2f} with {'growth' if growth_rate > 0 else 'decline'} trend"
                })

print("INSIGHTS:", json.dumps(insights))

print("EXECUTION_COMPLETE")
`
  }

  private static async runPythonScript(scriptFile: string): Promise<{success: boolean, output?: any, error?: string}> {
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', [scriptFile], {
        cwd: this.tempDir,
        env: { ...process.env, PYTHONPATH: this.tempDir }
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const output = this.parseOutput(stdout)
            resolve({ success: true, output })
          } catch (error) {
            resolve({ success: false, error: `Failed to parse output: ${error}` })
          }
        } else {
          resolve({ success: false, error: stderr || `Python process exited with code ${code}` })
        }
      })

      pythonProcess.on('error', (error) => {
        resolve({ success: false, error: error.message })
      })

      // Kill process after timeout
      setTimeout(() => {
        pythonProcess.kill('SIGTERM')
        resolve({ success: false, error: 'Python execution timeout' })
      }, 30000) // 30 second timeout
    })
  }

  private static parseOutput(stdout: string): any {
    const output: any = {}
    const lines = stdout.split('\n')
    
    for (const line of lines) {
      try {
        if (line.startsWith('DATASET_INFO:')) {
          output.datasetInfo = JSON.parse(line.substring(13))
        } else if (line.startsWith('COLUMN_TYPES:')) {
          output.columnTypes = JSON.parse(line.substring(13))
        } else if (line.startsWith('SUMMARY_STATS:')) {
          output.summaryStats = JSON.parse(line.substring(14))
        } else if (line.startsWith('CORRELATIONS:')) {
          output.correlations = JSON.parse(line.substring(13))
        } else if (line.startsWith('ANALYSIS_RESULTS:')) {
          output.analysisResults = JSON.parse(line.substring(17))
        } else if (line.startsWith('INSIGHTS:')) {
          output.insights = JSON.parse(line.substring(9))
        } else if (line.startsWith('USER_CODE_ERROR:')) {
          output.userCodeError = line.substring(16)
        } else if (line.startsWith('PYTHON_RESULT:')) {
          // Handle custom output from user code
          output.pythonResults = output.pythonResults || []
          output.pythonResults.push(line.substring(14))
        }
      } catch (parseError) {
        console.warn('Failed to parse line:', line, 'Error:', parseError)
        // Continue parsing other lines
      }
    }
    
    // Store raw output for debugging
    output.rawOutput = stdout
    
    return output
  }

  private static cleanup(files: string[]) {
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file)
        }
      } catch (error) {
        console.warn('Failed to cleanup file:', file, error)
      }
    }
  }
}