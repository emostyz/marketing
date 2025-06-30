import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    console.log('🎨 Testing Tremor Chart Rendering with Real Data...')
    
    // Read our test CSV data
    const csvPath = path.join(process.cwd(), 'test_sales_data.csv')
    const csvData = fs.readFileSync(csvPath, 'utf8')
    
    // Parse CSV data
    const csvLines = csvData.trim().split('\n')
    const headers = csvLines[0].split(',')
    const rows = csvLines.slice(1).map(line => {
      const values = line.split(',')
      const row: any = {}
      headers.forEach((header, index) => {
        // Convert numeric values
        const value = values[index]
        if (!isNaN(Number(value)) && value !== '') {
          row[header] = Number(value)
        } else {
          row[header] = value
        }
      })
      return row
    })
    
    console.log(`📊 Parsed ${rows.length} data rows with headers:`, headers)
    
    // Test different chart configurations for Tremor compatibility
    const testConfigurations = [
      {
        name: 'Revenue by Region (Bar Chart)',
        type: 'bar',
        data: rows.slice(0, 6).map(row => ({
          name: row.Region,
          value: row.Sales_Revenue,
          category: row.Product
        })),
        xAxisKey: 'name',
        yAxisKey: 'value',
        title: 'Sales Revenue by Region',
        subtitle: 'Q1 2024 Performance'
      },
      {
        name: 'Revenue Trend (Line Chart)', 
        type: 'line',
        data: rows.filter(row => row.Product === 'ProductA').map(row => ({
          name: row.Date,
          value: row.Sales_Revenue
        })),
        xAxisKey: 'name',
        yAxisKey: 'value',
        title: 'Product A Revenue Trend',
        subtitle: 'Monthly progression'
      },
      {
        name: 'Customer Satisfaction (Area Chart)',
        type: 'area',
        data: rows.slice(0, 8).map(row => ({
          name: row.Date,
          value: row.Customer_Satisfaction,
          region: row.Region
        })),
        xAxisKey: 'name',
        yAxisKey: 'value',
        title: 'Customer Satisfaction Trends',
        subtitle: 'Across regions over time'
      },
      {
        name: 'Marketing ROI (Scatter Chart)',
        type: 'scatter',
        data: rows.slice(0, 10).map(row => ({
          name: `${row.Region}-${row.Product}`,
          value: row.Sales_Revenue / row.Marketing_Spend,
          x: row.Marketing_Spend,
          y: row.Sales_Revenue
        })),
        xAxisKey: 'x',
        yAxisKey: 'y',
        title: 'Marketing Spend vs Revenue',
        subtitle: 'ROI efficiency analysis'
      }
    ]
    
    // Validate each configuration
    const validationResults = testConfigurations.map(config => {
      const validation: any = {
        configName: config.name,
        chartType: config.type,
        dataValidation: {},
        tremorCompatibility: {},
        issues: []
      }
      
      // Check data structure
      if (!config.data || !Array.isArray(config.data)) {
        validation.issues.push('Data is not an array')
      } else if (config.data.length === 0) {
        validation.issues.push('Data array is empty')
      } else {
        validation.dataValidation.rowCount = config.data.length
        
        // Check data structure consistency
        const firstRow = config.data[0]
        if (typeof firstRow === 'object' && firstRow !== null) {
          const keys = Object.keys(firstRow)
          validation.dataValidation.columns = keys
          validation.dataValidation.hasRequiredKeys = keys.includes(config.xAxisKey) && keys.includes(config.yAxisKey)
          
          if (!validation.dataValidation.hasRequiredKeys) {
            validation.issues.push(`Missing required keys: ${config.xAxisKey} or ${config.yAxisKey}`)
          }
          
          // Check data types
          const xValues = config.data.map(row => row[config.xAxisKey])
          const yValues = config.data.map(row => row[config.yAxisKey])
          
          validation.dataValidation.xAxisDataType = typeof xValues[0]
          validation.dataValidation.yAxisDataType = typeof yValues[0]
          
          // For numeric charts, Y should be numeric
          if (['bar', 'line', 'area', 'scatter'].includes(config.type)) {
            const allYNumeric = yValues.every(val => typeof val === 'number' && !isNaN(val))
            validation.dataValidation.yAxisIsNumeric = allYNumeric
            if (!allYNumeric) {
              validation.issues.push('Y-axis values must be numeric for this chart type')
            }
          }
        } else {
          validation.issues.push('Data rows are not objects')
        }
      }
      
      // Tremor-specific compatibility checks
      validation.tremorCompatibility = {
        supportsChartType: ['bar', 'line', 'area', 'donut', 'scatter'].includes(config.type),
        hasValidIndexKey: config.xAxisKey && typeof config.xAxisKey === 'string',
        hasValidCategories: config.yAxisKey && typeof config.yAxisKey === 'string',
        dataStructureValid: validation.issues.length === 0
      }
      
      validation.tremorCompatibility.overallCompatible = 
        validation.tremorCompatibility.supportsChartType &&
        validation.tremorCompatibility.hasValidIndexKey &&
        validation.tremorCompatibility.hasValidCategories &&
        validation.tremorCompatibility.dataStructureValid
      
      return validation
    })
    
    // Generate summary
    const summary = {
      totalConfigurations: testConfigurations.length,
      compatibleConfigurations: validationResults.filter(v => v.tremorCompatibility.overallCompatible).length,
      dataIssues: validationResults.reduce((total, v) => total + v.issues.length, 0),
      supportedChartTypes: ['bar', 'line', 'area', 'donut', 'scatter'],
      testedChartTypes: [...new Set(testConfigurations.map(c => c.type))],
      dataQuality: {
        totalDataPoints: rows.length,
        columnsAvailable: headers.length,
        numericColumns: headers.filter(h => rows.every(row => !isNaN(Number(row[h])))).length,
        categoricalColumns: headers.filter(h => rows.some(row => isNaN(Number(row[h])))).length
      }
    }
    
    console.log('✅ Tremor chart testing completed')
    console.log(`📈 ${summary.compatibleConfigurations}/${summary.totalConfigurations} configurations compatible`)
    console.log(`🎯 Chart types tested: ${summary.testedChartTypes.join(', ')}`)
    
    return NextResponse.json({
      success: true,
      testResults: {
        summary,
        validationResults,
        sampleData: {
          rawDataPreview: rows.slice(0, 3),
          headers,
          rowCount: rows.length
        },
        recommendations: summary.compatibleConfigurations === summary.totalConfigurations ? [
          "All chart configurations are Tremor-compatible",
          "Data structure is optimal for chart rendering",
          "Ready for production chart generation"
        ] : [
          "Review incompatible chart configurations",
          "Ensure numeric data for quantitative charts",
          "Validate data structure consistency"
        ]
      }
    })
    
  } catch (error) {
    console.error('❌ Tremor chart test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}