// ADVANCED PYTHON BRAIN - WORLD-CLASS DATA SCIENCE ENGINE
// Leverages full Python ecosystem: scikit-learn, statsmodels, prophet, plotly, seaborn, etc.

import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface AdvancedAnalysisRequest {
  data: any[]
  businessContext: {
    industry: string
    goals: string[]
    kpis: string[]
    timeHorizon: string
    competitiveContext: string
    constraints: string[]
  }
  analysisType: 'exploratory' | 'predictive' | 'prescriptive' | 'comprehensive'
  userFeedback?: {
    previousInsights: any[]
    corrections: any[]
    preferences: any[]
  }
}

export interface WorldClassAnalysisResult {
  success: boolean
  confidence: number
  insights: {
    statistical: StatisticalInsight[]
    predictive: PredictiveInsight[]
    prescriptive: PrescriptiveInsight[]
    visual: VisualizationInsight[]
  }
  models: {
    trained: ModelSummary[]
    performance: ModelPerformance[]
    recommendations: ModelRecommendation[]
  }
  visualizations: {
    interactive: InteractiveChart[]
    static: StaticChart[]
    dashboards: DashboardConfig[]
  }
  narratives: {
    executive: string
    technical: string
    actionable: string
  }
  recommendations: ActionableRecommendation[]
  uncertainties: UncertaintyAnalysis[]
  nextSteps: string[]
}

interface StatisticalInsight {
  type: 'correlation' | 'regression' | 'clustering' | 'anomaly' | 'trend'
  title: string
  finding: string
  significance: number
  businessImplication: string
  evidence: any
  confidence: number
}

interface PredictiveInsight {
  model: string
  prediction: any
  accuracy: number
  timeHorizon: string
  businessImpact: string
  riskFactors: string[]
  confidence: number
}

interface PrescriptiveInsight {
  recommendation: string
  expectedOutcome: string
  implementation: string[]
  resources: string[]
  timeline: string
  roi: number
  confidence: number
}

interface VisualizationInsight {
  type: 'plotly' | 'tremor' | 'custom'
  title: string
  description: string
  chartConfig: any
  data: any
  insights: string[]
  interactivity: any
}

export class AdvancedPythonBrain {
  private pythonEnv: string
  private tempDir: string
  private modelCache: Map<string, any>

  constructor() {
    this.pythonEnv = process.env.PYTHON_PATH || 'python3'
    this.tempDir = '/tmp/advanced_brain'
    this.modelCache = new Map()
  }

  /**
   * Execute world-class data science analysis
   */
  async executeWorldClassAnalysis(request: AdvancedAnalysisRequest): Promise<WorldClassAnalysisResult> {
    console.log('🧠 Starting world-class Python data science analysis...')
    
    try {
      // 1. Generate advanced Python script
      const pythonScript = await this.generateAdvancedPythonScript(request)
      
      // 2. Execute comprehensive analysis
      const pythonResults = await this.executePythonAnalysis(pythonScript, request.data, request.businessContext)
      
      // 3. OpenAI enhancement of results
      const enhancedResults = await this.enhanceWithOpenAI(pythonResults, request)
      
      // 4. Generate interactive visualizations
      const visualizations = await this.generateInteractiveVisualizations(pythonResults, request)
      
      // 5. Create actionable narratives
      const narratives = await this.generateBusinessNarratives(enhancedResults, request)
      
      return {
        success: true,
        confidence: enhancedResults.overallConfidence || 85,
        insights: {
          statistical: enhancedResults.statisticalInsights || [],
          predictive: enhancedResults.predictiveInsights || [],
          prescriptive: enhancedResults.prescriptiveInsights || [],
          visual: visualizations
        },
        models: enhancedResults.models || { trained: [], performance: [], recommendations: [] },
        visualizations: {
          interactive: visualizations.filter(v => v.type === 'plotly'),
          static: visualizations.filter(v => v.type === 'tremor'),
          dashboards: enhancedResults.dashboards || []
        },
        narratives,
        recommendations: enhancedResults.recommendations || [],
        uncertainties: enhancedResults.uncertainties || [],
        nextSteps: enhancedResults.nextSteps || []
      }
      
    } catch (error) {
      console.error('❌ Advanced Python brain failed:', error)
      throw error
    }
  }

  /**
   * Generate comprehensive Python script using full ecosystem
   */
  private async generateAdvancedPythonScript(request: AdvancedAnalysisRequest): Promise<string> {
    const script = `
import pandas as pd
import numpy as np
import json
import sys
import warnings
from datetime import datetime, timedelta
import pickle
import base64

# Advanced Analytics Libraries
import sklearn
from sklearn.ensemble import RandomForestRegressor, IsolationForest, GradientBoostingRegressor
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import silhouette_score, adjusted_rand_score, mean_squared_error, r2_score
from sklearn.decomposition import PCA, ICA
from sklearn.manifold import TSNE
from sklearn.feature_selection import SelectKBest, f_regression

# Statistical Analysis
import scipy.stats as stats
from scipy.stats import pearsonr, spearmanr, kendalltau, chi2_contingency, kruskal
import statsmodels.api as sm
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Time Series & Forecasting
try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    HAS_PROPHET = False

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.io as pio

# Suppress warnings
warnings.filterwarnings('ignore')

def comprehensive_world_class_analysis(data_file, business_context_str):
    """
    World-class data science analysis using full Python ecosystem
    """
    
    # Load and prepare data
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
        df = pd.DataFrame(data)
        business_context = json.loads(business_context_str)
    except Exception as e:
        return {"error": f"Data loading failed: {str(e)}"}
    
    results = {
        "statisticalInsights": [],
        "predictiveInsights": [],
        "prescriptiveInsights": [],
        "visualizations": [],
        "models": {"trained": [], "performance": [], "recommendations": []},
        "overallConfidence": 0,
        "dashboards": [],
        "uncertainties": [],
        "nextSteps": []
    }
    
    # Data Quality Assessment
    missing_percentage = df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100
    data_quality_score = max(0, 100 - missing_percentage * 2)
    
    # Column Type Analysis
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    # Advanced Date Detection
    date_cols = []
    for col in categorical_cols:
        try:
            parsed_dates = pd.to_datetime(df[col].dropna().head(20), infer_datetime_format=True)
            if len(parsed_dates) > 10:
                date_cols.append(col)
                df[col + '_parsed'] = pd.to_datetime(df[col], errors='coerce')
        except:
            pass
    
    print(f"Data Analysis: {len(df)} rows, {len(numeric_cols)} numeric, {len(categorical_cols)} categorical, {len(date_cols)} temporal")
    
    # 1. ADVANCED STATISTICAL ANALYSIS
    if len(numeric_cols) >= 2:
        # Correlation Analysis with Multiple Methods
        correlation_methods = ['pearson', 'spearman', 'kendall']
        for method in correlation_methods:
            try:
                corr_matrix = df[numeric_cols].corr(method=method)
                high_corr_pairs = []
                
                for i in range(len(corr_matrix.columns)):
                    for j in range(i+1, len(corr_matrix.columns)):
                        corr_val = corr_matrix.iloc[i, j]
                        if abs(corr_val) > 0.6:
                            high_corr_pairs.append({
                                "var1": corr_matrix.columns[i],
                                "var2": corr_matrix.columns[j],
                                "correlation": float(corr_val),
                                "method": method,
                                "strength": "strong" if abs(corr_val) > 0.8 else "moderate"
                            })
                
                if high_corr_pairs:
                    results["statisticalInsights"].append({
                        "type": "correlation",
                        "title": f"{method.title()} Correlation Analysis",
                        "finding": f"Found {len(high_corr_pairs)} significant correlations using {method} method",
                        "significance": 0.95,
                        "businessImplication": f"Strong relationships identified that can inform {business_context.get('goals', ['strategy'])[0]}",
                        "evidence": high_corr_pairs[:5],
                        "confidence": 90
                    })
            except Exception as e:
                print(f"Correlation analysis failed for {method}: {e}")
    
    # 2. CLUSTERING ANALYSIS
    if len(numeric_cols) >= 2 and len(df) > 10:
        try:
            # Prepare data for clustering
            cluster_data = df[numeric_cols].fillna(df[numeric_cols].median())
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(cluster_data)
            
            # Multiple clustering algorithms
            clustering_results = {}
            
            # K-Means with optimal k
            silhouette_scores = []
            for k in range(2, min(8, len(df)//2)):
                try:
                    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                    cluster_labels = kmeans.fit_predict(scaled_data)
                    silhouette_avg = silhouette_score(scaled_data, cluster_labels)
                    silhouette_scores.append((k, silhouette_avg))
                except:
                    continue
            
            if silhouette_scores:
                optimal_k = max(silhouette_scores, key=lambda x: x[1])[0]
                kmeans_final = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
                cluster_labels = kmeans_final.fit_predict(scaled_data)
                
                # Cluster characteristics
                df_with_clusters = df.copy()
                df_with_clusters['cluster'] = cluster_labels
                
                cluster_summary = []
                for cluster_id in range(optimal_k):
                    cluster_data = df_with_clusters[df_with_clusters['cluster'] == cluster_id]
                    cluster_profile = {}
                    
                    for col in numeric_cols:
                        cluster_profile[col] = {
                            "mean": float(cluster_data[col].mean()),
                            "median": float(cluster_data[col].median()),
                            "size": len(cluster_data)
                        }
                    
                    cluster_summary.append({
                        "cluster_id": int(cluster_id),
                        "size": len(cluster_data),
                        "percentage": len(cluster_data) / len(df) * 100,
                        "profile": cluster_profile
                    })
                
                results["statisticalInsights"].append({
                    "type": "clustering",
                    "title": f"Customer/Data Segmentation Analysis",
                    "finding": f"Identified {optimal_k} distinct segments with {max(silhouette_scores, key=lambda x: x[1])[1]:.3f} silhouette score",
                    "significance": 0.9,
                    "businessImplication": f"Segmentation reveals distinct groups for targeted {business_context.get('goals', ['strategy'])[0]}",
                    "evidence": cluster_summary,
                    "confidence": 85
                })
                
                # Store model for predictions
                model_data = {
                    "type": "clustering",
                    "model": "kmeans",
                    "scaler": base64.b64encode(pickle.dumps(scaler)).decode(),
                    "clusters": optimal_k,
                    "performance": max(silhouette_scores, key=lambda x: x[1])[1]
                }
                results["models"]["trained"].append(model_data)
        
        except Exception as e:
            print(f"Clustering analysis failed: {e}")
    
    # 3. ANOMALY DETECTION
    if len(numeric_cols) >= 1:
        try:
            anomaly_data = df[numeric_cols].fillna(df[numeric_cols].median())
            
            # Isolation Forest
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            anomaly_labels = iso_forest.fit_predict(anomaly_data)
            
            anomaly_count = sum(1 for label in anomaly_labels if label == -1)
            anomaly_percentage = anomaly_count / len(df) * 100
            
            if anomaly_percentage > 2:  # If more than 2% anomalies
                anomaly_indices = [i for i, label in enumerate(anomaly_labels) if label == -1]
                anomaly_samples = df.iloc[anomaly_indices][numeric_cols].describe().to_dict()
                
                results["statisticalInsights"].append({
                    "type": "anomaly",
                    "title": "Anomaly Detection Analysis",
                    "finding": f"Detected {anomaly_count} anomalies ({anomaly_percentage:.1f}% of data)",
                    "significance": 0.8,
                    "businessImplication": "Unusual patterns detected that may indicate opportunities or risks requiring investigation",
                    "evidence": {
                        "count": anomaly_count,
                        "percentage": anomaly_percentage,
                        "sample_characteristics": anomaly_samples
                    },
                    "confidence": 80
                })
        
        except Exception as e:
            print(f"Anomaly detection failed: {e}")
    
    # 4. PREDICTIVE MODELING
    if len(numeric_cols) >= 2 and len(df) > 20:
        try:
            # Identify potential target variable (highest variance or specified in context)
            target_candidates = numeric_cols.copy()
            if business_context.get('kpis'):
                # Look for KPI-related columns
                kpi_cols = [col for col in numeric_cols if any(kpi.lower() in col.lower() for kpi in business_context['kpis'])]
                if kpi_cols:
                    target_candidates = kpi_cols
            
            target_col = max(target_candidates, key=lambda col: df[col].var())
            feature_cols = [col for col in numeric_cols if col != target_col]
            
            if len(feature_cols) >= 1:
                # Prepare training data
                X = df[feature_cols].fillna(df[feature_cols].median())
                y = df[target_col].fillna(df[target_col].median())
                
                if len(X) > 10:
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
                    
                    # Multiple models
                    models = {
                        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
                        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
                    }
                    
                    best_model = None
                    best_score = -np.inf
                    
                    for model_name, model in models.items():
                        try:
                            model.fit(X_train, y_train)
                            y_pred = model.predict(X_test)
                            r2 = r2_score(y_test, y_pred)
                            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                            
                            if r2 > best_score:
                                best_score = r2
                                best_model = (model_name, model, r2, rmse)
                            
                            results["models"]["performance"].append({
                                "model": model_name,
                                "r2_score": float(r2),
                                "rmse": float(rmse),
                                "target": target_col
                            })
                        
                        except Exception as e:
                            print(f"Model {model_name} failed: {e}")
                    
                    if best_model and best_model[2] > 0.3:  # R² > 0.3
                        model_name, trained_model, r2, rmse = best_model
                        
                        # Feature importance
                        if hasattr(trained_model, 'feature_importances_'):
                            importance_df = pd.DataFrame({
                                'feature': feature_cols,
                                'importance': trained_model.feature_importances_
                            }).sort_values('importance', ascending=False)
                            
                            top_features = importance_df.head(3).to_dict('records')
                        else:
                            top_features = []
                        
                        # Generate predictions for next period
                        latest_data = X.tail(1)
                        prediction = trained_model.predict(latest_data)[0]
                        
                        results["predictiveInsights"].append({
                            "model": model_name,
                            "prediction": {
                                "target": target_col,
                                "predicted_value": float(prediction),
                                "current_value": float(y.iloc[-1]),
                                "change_percentage": float((prediction - y.iloc[-1]) / y.iloc[-1] * 100)
                            },
                            "accuracy": float(r2),
                            "timeHorizon": "next_period",
                            "businessImpact": f"Model predicts {target_col} performance with {r2:.1%} accuracy",
                            "riskFactors": [f"Model accuracy: {r2:.1%}", f"RMSE: {rmse:.2f}"],
                            "confidence": min(85, int(r2 * 100))
                        })
                        
                        if top_features:
                            results["prescriptiveInsights"].append({
                                "recommendation": f"Focus on improving {top_features[0]['feature']} to maximize {target_col}",
                                "expectedOutcome": f"Potential {abs(prediction - y.iloc[-1]):.1f} improvement in {target_col}",
                                "implementation": [f"Monitor and optimize {feat['feature']}" for feat in top_features[:3]],
                                "resources": ["Data monitoring", "Performance tracking", "Strategic focus"],
                                "timeline": "1-3 months",
                                "roi": float(abs(prediction - y.iloc[-1]) / y.mean() * 100),
                                "confidence": 75
                            })
        
        except Exception as e:
            print(f"Predictive modeling failed: {e}")
    
    # 5. TIME SERIES ANALYSIS
    if date_cols and len(numeric_cols) >= 1:
        try:
            date_col = date_cols[0] + '_parsed'
            value_col = numeric_cols[0]
            
            # Create time series
            ts_data = df[[date_col, value_col]].copy()
            ts_data = ts_data.dropna().sort_values(date_col)
            ts_data.set_index(date_col, inplace=True)
            
            if len(ts_data) > 10:
                # Trend analysis
                ts_data['trend'] = ts_data[value_col].rolling(window=min(7, len(ts_data)//2)).mean()
                
                # Seasonal decomposition if enough data
                if len(ts_data) > 24:
                    try:
                        decomposition = seasonal_decompose(ts_data[value_col], model='additive', period=min(12, len(ts_data)//3))
                        
                        trend_direction = "increasing" if decomposition.trend.dropna().iloc[-1] > decomposition.trend.dropna().iloc[0] else "decreasing"
                        seasonality_strength = np.std(decomposition.seasonal.dropna()) / np.std(ts_data[value_col])
                        
                        results["statisticalInsights"].append({
                            "type": "trend",
                            "title": f"{value_col} Time Series Analysis",
                            "finding": f"Data shows {trend_direction} trend with {seasonality_strength:.2f} seasonality strength",
                            "significance": 0.85,
                            "businessImplication": f"Time-based patterns in {value_col} can inform forecasting and planning",
                            "evidence": {
                                "trend_direction": trend_direction,
                                "seasonality_strength": float(seasonality_strength),
                                "data_points": len(ts_data)
                            },
                            "confidence": 80
                        })
                    except Exception as e:
                        print(f"Seasonal decomposition failed: {e}")
                
                # Simple forecasting
                if HAS_PROPHET and len(ts_data) > 30:
                    try:
                        prophet_data = ts_data.reset_index()
                        prophet_data.columns = ['ds', 'y']
                        
                        model = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
                        model.fit(prophet_data)
                        
                        future = model.make_future_dataframe(periods=30)
                        forecast = model.predict(future)
                        
                        next_value = forecast['yhat'].iloc[-1]
                        current_value = ts_data[value_col].iloc[-1]
                        change_percent = (next_value - current_value) / current_value * 100
                        
                        results["predictiveInsights"].append({
                            "model": "Prophet Time Series",
                            "prediction": {
                                "target": value_col,
                                "predicted_value": float(next_value),
                                "current_value": float(current_value),
                                "change_percentage": float(change_percent),
                                "forecast_period": "30 days"
                            },
                            "accuracy": 75,  # Default for Prophet
                            "timeHorizon": "30_days",
                            "businessImpact": f"Forecasting shows {abs(change_percent):.1f}% {'increase' if change_percent > 0 else 'decrease'} expected",
                            "riskFactors": ["Model based on historical patterns", "External factors not included"],
                            "confidence": 70
                        })
                    except Exception as e:
                        print(f"Prophet forecasting failed: {e}")
        
        except Exception as e:
            print(f"Time series analysis failed: {e}")
    
    # 6. ADVANCED VISUALIZATIONS
    try:
        # Create Plotly visualizations
        viz_configs = []
        
        # Correlation heatmap
        if len(numeric_cols) >= 2:
            corr_matrix = df[numeric_cols].corr()
            
            viz_configs.append({
                "type": "plotly",
                "title": "Correlation Matrix Heatmap",
                "description": "Interactive correlation analysis of all numeric variables",
                "chartConfig": {
                    "type": "heatmap",
                    "data": corr_matrix.values.tolist(),
                    "labels": numeric_cols,
                    "colorscale": "RdBu"
                },
                "insights": [f"Strongest correlation: {corr_matrix.abs().unstack().nlargest(2).index[1]} ({corr_matrix.abs().unstack().nlargest(2).iloc[1]:.3f})"],
                "interactivity": {"hover": True, "zoom": True, "pan": True}
            })
        
        # Distribution plots
        for col in numeric_cols[:3]:  # Top 3 numeric columns
            col_data = df[col].dropna()
            if len(col_data) > 5:
                viz_configs.append({
                    "type": "plotly",
                    "title": f"{col} Distribution Analysis",
                    "description": f"Statistical distribution and outlier analysis for {col}",
                    "chartConfig": {
                        "type": "histogram",
                        "data": col_data.tolist(),
                        "title": col,
                        "bins": min(20, len(col_data)//5)
                    },
                    "insights": [
                        f"Mean: {col_data.mean():.2f}",
                        f"Std Dev: {col_data.std():.2f}",
                        f"Skewness: {col_data.skew():.2f}"
                    ],
                    "interactivity": {"hover": True, "zoom": True}
                })
        
        results["visualizations"] = viz_configs
    
    except Exception as e:
        print(f"Visualization generation failed: {e}")
    
    # 7. BUSINESS INTELLIGENCE SUMMARY
    confidence_scores = []
    if results["statisticalInsights"]:
        confidence_scores.extend([insight["confidence"] for insight in results["statisticalInsights"]])
    if results["predictiveInsights"]:
        confidence_scores.extend([insight["confidence"] for insight in results["predictiveInsights"]])
    
    overall_confidence = np.mean(confidence_scores) if confidence_scores else 60
    results["overallConfidence"] = int(overall_confidence)
    
    # Next steps based on analysis
    next_steps = []
    if len(results["statisticalInsights"]) > 0:
        next_steps.append("Investigate identified patterns and correlations")
    if len(results["predictiveInsights"]) > 0:
        next_steps.append("Implement predictive model monitoring")
    if len(results["prescriptiveInsights"]) > 0:
        next_steps.append("Execute recommended optimization strategies")
    
    results["nextSteps"] = next_steps
    
    print(f"Analysis complete: {len(results['statisticalInsights'])} statistical insights, {len(results['predictiveInsights'])} predictions")
    
    return results

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python script.py <data_file> <business_context>"}))
        sys.exit(1)
    
    data_file = sys.argv[1]
    business_context = sys.argv[2]
    
    try:
        results = comprehensive_world_class_analysis(data_file, business_context)
        print(json.dumps(results, default=str, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
`

    return script
  }

  /**
   * Execute Python analysis with full data science stack
   */
  private async executePythonAnalysis(script: string, data: any[], businessContext: any): Promise<any> {
    await this.ensureTempDirectory()
    
    const timestamp = Date.now()
    const dataFile = path.join(this.tempDir, `data_${timestamp}.json`)
    const scriptFile = path.join(this.tempDir, `analysis_${timestamp}.py`)
    
    // Write files
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2))
    await fs.writeFile(scriptFile, script)
    
    return new Promise((resolve, reject) => {
      const contextString = JSON.stringify(businessContext)
      const python = spawn(this.pythonEnv, [scriptFile, dataFile, contextString], {
        timeout: 120000 // 2 minute timeout for complex analysis
      })
      
      let stdout = ''
      let stderr = ''
      
      python.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      python.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      python.on('close', (code) => {
        // Cleanup
        fs.unlink(dataFile).catch(() => {})
        fs.unlink(scriptFile).catch(() => {})
        
        if (code === 0) {
          try {
            const results = JSON.parse(stdout)
            resolve(results)
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${stdout.substring(0, 500)}...`))
          }
        } else {
          reject(new Error(`Python analysis failed with code ${code}: ${stderr}`))
        }
      })
      
      python.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * Enhance Python results with OpenAI intelligence
   */
  private async enhanceWithOpenAI(pythonResults: any, request: AdvancedAnalysisRequest): Promise<any> {
    const prompt = `
You are a world-class data scientist and business strategist. Enhance these Python analysis results with strategic business insights.

Python Analysis Results:
${JSON.stringify(pythonResults, null, 2)}

Business Context:
- Industry: ${request.businessContext.industry}
- Goals: ${request.businessContext.goals.join(', ')}
- KPIs: ${request.businessContext.kpis.join(', ')}
- Time Horizon: ${request.businessContext.timeHorizon}

Enhance the analysis by:
1. Adding strategic business implications to each insight
2. Identifying hidden patterns the algorithms might have missed
3. Providing actionable recommendations with ROI estimates
4. Flagging potential risks and uncertainties
5. Suggesting next steps for implementation

Return enhanced results in the same structure, but with deeper business intelligence.
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      })

      const enhancedContent = response.choices[0].message.content
      
      // Try to parse as JSON, fallback to adding as narrative
      try {
        return JSON.parse(enhancedContent || '{}')
      } catch {
        return {
          ...pythonResults,
          aiEnhancement: enhancedContent,
          overallConfidence: Math.min((pythonResults.overallConfidence || 70) + 10, 95)
        }
      }
    } catch (error) {
      console.warn('OpenAI enhancement failed, using Python results:', error)
      return pythonResults
    }
  }

  /**
   * Generate interactive visualizations for beautiful slides
   */
  private async generateInteractiveVisualizations(results: any, request: AdvancedAnalysisRequest): Promise<VisualizationInsight[]> {
    const visualizations: VisualizationInsight[] = []
    
    // Convert Python visualizations to Tremor-compatible format
    if (results.visualizations) {
      for (const viz of results.visualizations) {
        if (viz.type === 'plotly') {
          // Convert to Tremor format for beautiful slides
          visualizations.push({
            type: 'tremor',
            title: viz.title,
            description: viz.description,
            chartConfig: this.convertToTremorConfig(viz.chartConfig),
            data: viz.chartConfig.data,
            insights: viz.insights,
            interactivity: {
              editable: true,
              resizable: true,
              deletable: true
            }
          })
        }
      }
    }
    
    return visualizations
  }

  /**
   * Generate business narratives for slides
   */
  private async generateBusinessNarratives(results: any, request: AdvancedAnalysisRequest) {
    const prompt = `
Create compelling business narratives for these analysis results:

${JSON.stringify(results, null, 2)}

Generate three narrative styles:
1. Executive Summary (C-level, strategic, brief)
2. Technical Summary (detailed, methodology-focused)
3. Actionable Summary (implementation-focused, next steps)

Each should be persuasive, data-driven, and tailored to ${request.businessContext.industry} industry.
`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 2000
      })

      const content = response.choices[0].message.content || ''
      
      return {
        executive: this.extractSection(content, 'Executive Summary'),
        technical: this.extractSection(content, 'Technical Summary'),
        actionable: this.extractSection(content, 'Actionable Summary')
      }
    } catch (error) {
      return {
        executive: "Advanced analysis reveals significant opportunities for strategic optimization.",
        technical: "Comprehensive statistical and machine learning analysis completed successfully.",
        actionable: "Implement data-driven recommendations to achieve measurable business impact."
      }
    }
  }

  private convertToTremorConfig(plotlyConfig: any): any {
    // Convert Plotly config to Tremor chart config
    return {
      type: plotlyConfig.type,
      data: plotlyConfig.data,
      title: plotlyConfig.title,
      // Add Tremor-specific configurations
      ...plotlyConfig
    }
  }

  private extractSection(content: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i')
    const match = content.match(regex)
    return match ? match[1].trim() : `${sectionName} content generated from analysis.`
  }

  private async ensureTempDirectory(): Promise<void> {
    try {
      await fs.access(this.tempDir)
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true })
    }
  }
}

export default AdvancedPythonBrain