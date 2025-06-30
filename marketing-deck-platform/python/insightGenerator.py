#!/usr/bin/env python3
"""
AI-Powered Data Analysis Service
Analyzes CSV data to extract insights for slide generation

Usage:
  python insightGenerator.py <csv_path> [--output_format=json|summary]
  python -c "from insightGenerator import analyze_dataframe; print(analyze_dataframe(df))"

Dependencies:
  pip install pandas ydata-profiling sweetviz scipy scikit-learn numpy
"""

import pandas as pd
import numpy as np
import json
import sys
import argparse
from typing import Dict, List, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

try:
    from ydata_profiling import ProfileReport
    HAS_PROFILING = True
except ImportError:
    print("Warning: ydata-profiling not available. Install with: pip install ydata-profiling", file=sys.stderr)
    HAS_PROFILING = False

try:
    from scipy import stats
    from sklearn.preprocessing import StandardScaler
    from sklearn.cluster import KMeans
    HAS_SCIPY = True
except ImportError:
    print("Warning: scipy/sklearn not available. Install with: pip install scipy scikit-learn", file=sys.stderr)
    HAS_SCIPY = False


def detect_trends(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detect temporal and growth trends in the data"""
    trends = []
    
    # Look for date columns
    date_cols = []
    for col in df.columns:
        if df[col].dtype == 'object':
            # Try parsing as dates
            try:
                pd.to_datetime(df[col].head())
                date_cols.append(col)
            except:
                continue
    
    # Look for numeric columns that could be metrics
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if date_cols and numeric_cols:
        for date_col in date_cols[:1]:  # Use first date column
            for metric_col in numeric_cols[:3]:  # Analyze top 3 metrics
                try:
                    # Sort by date and calculate growth
                    temp_df = df[[date_col, metric_col]].copy()
                    temp_df[date_col] = pd.to_datetime(temp_df[date_col])
                    temp_df = temp_df.sort_values(date_col)
                    temp_df = temp_df.dropna()
                    
                    if len(temp_df) >= 3:
                        values = temp_df[metric_col].values
                        # Calculate period-over-period growth
                        if len(values) >= 2:
                            latest_growth = ((values[-1] - values[-2]) / abs(values[-2])) * 100 if values[-2] != 0 else 0
                            overall_growth = ((values[-1] - values[0]) / abs(values[0])) * 100 if values[0] != 0 else 0
                            
                            trend_direction = "growth" if overall_growth > 5 else "decline" if overall_growth < -5 else "stable"
                            
                            trends.append({
                                "metric": metric_col,
                                "timeframe": f"{temp_df[date_col].min().strftime('%Y-%m')} to {temp_df[date_col].max().strftime('%Y-%m')}",
                                "direction": trend_direction,
                                "overall_change_pct": round(overall_growth, 1),
                                "latest_period_change_pct": round(latest_growth, 1),
                                "confidence": min(100, max(50, 100 - abs(100 - len(values) * 10)))
                            })
                except Exception as e:
                    print(f"Warning: Could not analyze trend for {metric_col}: {e}", file=sys.stderr)
                    continue
    
    return trends


def detect_outliers(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detect statistical outliers using IQR method"""
    outliers = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in numeric_cols[:5]:  # Analyze top 5 numeric columns
        try:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_values = df[(df[col] < lower_bound) | (df[col] > upper_bound)][col]
            
            if len(outlier_values) > 0:
                outliers.append({
                    "column": col,
                    "outlier_count": len(outlier_values),
                    "outlier_percentage": round((len(outlier_values) / len(df)) * 100, 1),
                    "extreme_values": {
                        "highest": float(outlier_values.max()) if len(outlier_values) > 0 else None,
                        "lowest": float(outlier_values.min()) if len(outlier_values) > 0 else None
                    },
                    "threshold_bounds": {
                        "upper": float(upper_bound),
                        "lower": float(lower_bound)
                    }
                })
        except Exception as e:
            print(f"Warning: Could not detect outliers for {col}: {e}", file=sys.stderr)
            continue
    
    return outliers


def analyze_correlations(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Find significant correlations between numeric variables"""
    correlations = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(numeric_cols) >= 2:
        try:
            corr_matrix = df[numeric_cols].corr()
            
            # Find correlations above threshold
            for i in range(len(numeric_cols)):
                for j in range(i + 1, len(numeric_cols)):
                    col1, col2 = numeric_cols[i], numeric_cols[j]
                    corr_value = corr_matrix.loc[col1, col2]
                    
                    if abs(corr_value) >= 0.5:  # Significant correlation threshold
                        correlations.append({
                            "variable_x": col1,
                            "variable_y": col2,
                            "correlation": round(float(corr_value), 3),
                            "strength": "strong" if abs(corr_value) >= 0.7 else "moderate",
                            "direction": "positive" if corr_value > 0 else "negative",
                            "business_insight": generate_correlation_insight(col1, col2, corr_value)
                        })
            
            # Sort by absolute correlation value
            correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)
            
        except Exception as e:
            print(f"Warning: Could not analyze correlations: {e}", file=sys.stderr)
    
    return correlations[:5]  # Return top 5 correlations


def generate_correlation_insight(col1: str, col2: str, corr_value: float) -> str:
    """Generate business insight from correlation"""
    direction = "increases" if corr_value > 0 else "decreases"
    strength = "strongly" if abs(corr_value) >= 0.7 else "moderately"
    
    return f"As {col1} increases, {col2} {strength} {direction} (r={corr_value:.2f})"


def analyze_segments(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Identify natural segments in the data using clustering"""
    segments = []
    
    if not HAS_SCIPY:
        return segments
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    # Analyze categorical segments first
    for col in categorical_cols[:3]:
        try:
            value_counts = df[col].value_counts()
            if 2 <= len(value_counts) <= 10:  # Reasonable number of categories
                segments.append({
                    "type": "categorical",
                    "segment_by": col,
                    "segments": [
                        {
                            "name": str(category),
                            "count": int(count),
                            "percentage": round((count / len(df)) * 100, 1)
                        }
                        for category, count in value_counts.head(5).items()
                    ]
                })
        except Exception as e:
            print(f"Warning: Could not analyze categorical segments for {col}: {e}", file=sys.stderr)
    
    # Try numeric clustering if we have enough numeric data
    if len(numeric_cols) >= 2 and len(df) >= 10:
        try:
            # Select top 2-3 numeric columns for clustering
            cluster_data = df[numeric_cols[:3]].dropna()
            
            if len(cluster_data) >= 10:
                scaler = StandardScaler()
                scaled_data = scaler.fit_transform(cluster_data)
                
                # Use elbow method to find optimal clusters (2-5 range)
                optimal_k = 3  # Default
                kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
                cluster_labels = kmeans.fit_predict(scaled_data)
                
                # Analyze cluster characteristics
                cluster_summary = []
                for cluster_id in range(optimal_k):
                    cluster_mask = cluster_labels == cluster_id
                    cluster_subset = cluster_data[cluster_mask]
                    
                    if len(cluster_subset) > 0:
                        cluster_summary.append({
                            "cluster_id": int(cluster_id),
                            "size": int(len(cluster_subset)),
                            "percentage": round((len(cluster_subset) / len(cluster_data)) * 100, 1),
                            "characteristics": {
                                col: {
                                    "mean": round(float(cluster_subset[col].mean()), 2),
                                    "median": round(float(cluster_subset[col].median()), 2)
                                }
                                for col in cluster_data.columns[:2]
                            }
                        })
                
                segments.append({
                    "type": "numeric_clusters",
                    "cluster_method": "kmeans",
                    "features_used": cluster_data.columns.tolist()[:3],
                    "clusters": cluster_summary
                })
                
        except Exception as e:
            print(f"Warning: Could not perform clustering analysis: {e}", file=sys.stderr)
    
    return segments


def calculate_data_quality_score(df: pd.DataFrame) -> int:
    """Calculate an overall data quality score (0-100)"""
    score = 100
    
    # Penalize for missing data
    missing_pct = (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
    score -= min(40, missing_pct * 2)  # Max 40 point penalty
    
    # Bonus for good size
    if len(df) >= 100:
        score += 5
    elif len(df) < 10:
        score -= 20
    
    # Bonus for having both numeric and categorical data
    numeric_cols = len(df.select_dtypes(include=[np.number]).columns)
    categorical_cols = len(df.select_dtypes(include=['object']).columns)
    
    if numeric_cols >= 2 and categorical_cols >= 1:
        score += 10
    
    # Penalize for too many columns (noise)
    if len(df.columns) > 20:
        score -= 10
    
    return max(0, min(100, int(score)))


def analyze_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """Main analysis function that combines all insights"""
    
    # Basic statistics
    basic_stats = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "numeric_columns": len(df.select_dtypes(include=[np.number]).columns),
        "categorical_columns": len(df.select_dtypes(include=['object']).columns),
        "missing_values_total": int(df.isnull().sum().sum()),
        "missing_percentage": round((df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100, 2)
    }
    
    # Run all analysis functions
    trends = detect_trends(df)
    outliers = detect_outliers(df)
    correlations = analyze_correlations(df)
    segments = analyze_segments(df)
    quality_score = calculate_data_quality_score(df)
    
    # Generate high-level insights for slide generation
    key_insights = []
    
    # Add trend insights
    if trends:
        growth_trends = [t for t in trends if t["direction"] == "growth" and t["overall_change_pct"] > 10]
        if growth_trends:
            best_growth = max(growth_trends, key=lambda x: x["overall_change_pct"])
            key_insights.append({
                "type": "growth_opportunity",
                "title": f"{best_growth['metric']} Shows Strong Growth",
                "description": f"{best_growth['metric']} increased {best_growth['overall_change_pct']}% over {best_growth['timeframe']}",
                "business_impact": "high",
                "slide_recommendation": "metrics_performance"
            })
    
    # Add correlation insights
    if correlations:
        strong_corr = [c for c in correlations if c["strength"] == "strong"]
        if strong_corr:
            key_insights.append({
                "type": "relationship_discovery",
                "title": f"Strong Relationship: {strong_corr[0]['variable_x']} & {strong_corr[0]['variable_y']}",
                "description": strong_corr[0]["business_insight"],
                "business_impact": "medium",
                "slide_recommendation": "correlation_analysis"
            })
    
    # Add segment insights
    if segments:
        for segment in segments:
            if segment["type"] == "categorical" and len(segment["segments"]) >= 2:
                largest_segment = max(segment["segments"], key=lambda x: x["percentage"])
                if largest_segment["percentage"] >= 40:
                    key_insights.append({
                        "type": "market_segmentation",
                        "title": f"{segment['segment_by']} Distribution Analysis",
                        "description": f"{largest_segment['name']} represents {largest_segment['percentage']}% of the data",
                        "business_impact": "medium",
                        "slide_recommendation": "segment_breakdown"
                    })
                break
    
    return {
        "basic_statistics": basic_stats,
        "data_quality_score": quality_score,
        "trends": trends,
        "outliers": outliers,
        "correlations": correlations,
        "segments": segments,
        "key_insights": key_insights,
        "slide_recommendations": {
            "total_slides_suggested": min(8, max(4, len(key_insights) + 2)),
            "narrative_arc": determine_narrative_arc(trends, correlations, segments),
            "chart_types_recommended": recommend_chart_types(df, trends, correlations, segments)
        },
        "metadata": {
            "analysis_timestamp": pd.Timestamp.now().isoformat(),
            "python_version": sys.version.split()[0],
            "pandas_version": pd.__version__,
            "has_profiling": HAS_PROFILING,
            "has_scipy": HAS_SCIPY
        }
    }


def determine_narrative_arc(trends: List, correlations: List, segments: List) -> str:
    """Determine the best narrative structure for the presentation"""
    
    if trends and any(t["direction"] == "growth" for t in trends):
        return "growth_story"  # Start with overview, show growth, explain drivers
    elif correlations and len(correlations) >= 2:
        return "relationship_analysis"  # Show data, reveal relationships, implications
    elif segments and len(segments) >= 1:
        return "segmentation_insights"  # Overview, segment breakdown, opportunities
    else:
        return "data_summary"  # Basic summary and key findings


def recommend_chart_types(df: pd.DataFrame, trends: List, correlations: List, segments: List) -> List[str]:
    """Recommend chart types based on data characteristics"""
    chart_recommendations = []
    
    # Time series data → line charts
    if trends:
        chart_recommendations.append("line")
    
    # Correlations → scatter plots
    if correlations:
        chart_recommendations.append("scatter")
    
    # Categorical segments → bar charts or pie charts
    if segments:
        categorical_segments = [s for s in segments if s["type"] == "categorical"]
        if categorical_segments:
            chart_recommendations.extend(["bar", "donut"])
    
    # Always include a summary table/metrics
    chart_recommendations.append("metrics_cards")
    
    # Default to bar if nothing specific found
    if not chart_recommendations:
        chart_recommendations = ["bar", "line"]
    
    return chart_recommendations[:4]  # Limit to 4 chart types max


def main():
    """Command line interface"""
    parser = argparse.ArgumentParser(description="Analyze CSV data for presentation insights")
    parser.add_argument("csv_path", help="Path to CSV file")
    parser.add_argument("--output_format", choices=["json", "summary"], default="json", 
                       help="Output format (default: json)")
    parser.add_argument("--quality_threshold", type=int, default=50,
                       help="Minimum data quality score (default: 50)")
    
    args = parser.parse_args()
    
    try:
        # Load and analyze data
        df = pd.read_csv(args.csv_path)
        
        if len(df) == 0:
            print(json.dumps({"error": "CSV file is empty"}))
            sys.exit(1)
        
        analysis_result = analyze_dataframe(df)
        
        # Check quality threshold
        if analysis_result["data_quality_score"] < args.quality_threshold:
            print(json.dumps({
                "error": f"Data quality score {analysis_result['data_quality_score']} below threshold {args.quality_threshold}",
                "quality_issues": "High missing data percentage or insufficient data size"
            }))
            sys.exit(1)
        
        if args.output_format == "json":
            print(json.dumps(analysis_result, indent=2))
        else:
            # Summary format
            print(f"Data Quality Score: {analysis_result['data_quality_score']}/100")
            print(f"Rows: {analysis_result['basic_statistics']['row_count']}")
            print(f"Insights Found: {len(analysis_result['key_insights'])}")
            print(f"Suggested Slides: {analysis_result['slide_recommendations']['total_slides_suggested']}")
            print(f"Narrative Arc: {analysis_result['slide_recommendations']['narrative_arc']}")
        
    except FileNotFoundError:
        print(json.dumps({"error": f"CSV file not found: {args.csv_path}"}))
        sys.exit(1)
    except pd.errors.EmptyDataError:
        print(json.dumps({"error": "CSV file is empty or invalid"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Analysis failed: {str(e)}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()