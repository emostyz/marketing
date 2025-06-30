import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { runPipeline } from '@/lib/orchestrator'

export async function GET(request: NextRequest) {
  try {
    console.log('⚡ Running Performance Testing with Large Datasets...')
    
    const performanceTests = []
    
    // Test 1: Small Dataset (Baseline)
    console.log('📊 Test 1: Small dataset baseline')
    const smallDataStart = Date.now()
    
    const smallCsvPath = path.join(process.cwd(), 'test_sales_data.csv')
    const smallCsvData = fs.readFileSync(smallCsvPath, 'utf8')
    const smallRows = parseCSV(smallCsvData)
    
    try {
      const smallResult = await runPipeline({
        deckId: 'perf-test-small',
        csvData: smallRows,
        context: {
          businessGoals: ['performance_analysis'],
          industry: 'Technology',
          audience: 'Executive Team'
        }
      })
      
      const smallDuration = Date.now() - smallDataStart
      
      performanceTests.push({
        testName: 'Small Dataset (24 rows)',
        dataSize: {
          rows: smallRows.length,
          columns: Object.keys(smallRows[0] || {}).length,
          sizeKB: Math.round(smallCsvData.length / 1024)
        },
        performance: {
          totalTime: smallDuration,
          timePerRow: Math.round(smallDuration / smallRows.length),
          status: smallResult.status,
          slidesGenerated: smallResult.finalDeckJson?.presentation?.slides?.length || 0,
          chartsGenerated: countCharts(smallResult),
          qualityScore: smallResult.metadata?.qualityScore || 0
        },
        success: smallResult.status === 'success'
      })
    } catch (error) {
      performanceTests.push({
        testName: 'Small Dataset (24 rows)',
        dataSize: { rows: smallRows.length, columns: Object.keys(smallRows[0] || {}).length },
        performance: { totalTime: Date.now() - smallDataStart, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      })
    }
    
    // Test 2: Large Dataset
    console.log('📊 Test 2: Large dataset performance')
    const largeDataStart = Date.now()
    
    const largeCsvPath = path.join(process.cwd(), 'large_sales_data.csv')
    const largeCsvData = fs.readFileSync(largeCsvPath, 'utf8')
    const largeRows = parseCSV(largeCsvData)
    
    try {
      const largeResult = await runPipeline({
        deckId: 'perf-test-large',
        csvData: largeRows,
        context: {
          businessGoals: ['comprehensive_analysis', 'trend_analysis', 'segmentation'],
          industry: 'Technology',
          audience: 'Executive Team',
          presentationType: 'detailed_review'
        }
      })
      
      const largeDuration = Date.now() - largeDataStart
      
      performanceTests.push({
        testName: 'Large Dataset (48 rows)',
        dataSize: {
          rows: largeRows.length,
          columns: Object.keys(largeRows[0] || {}).length,
          sizeKB: Math.round(largeCsvData.length / 1024)
        },
        performance: {
          totalTime: largeDuration,
          timePerRow: Math.round(largeDuration / largeRows.length),
          status: largeResult.status,
          slidesGenerated: largeResult.finalDeckJson?.presentation?.slides?.length || 0,
          chartsGenerated: countCharts(largeResult),
          qualityScore: largeResult.metadata?.qualityScore || 0,
          memoryEfficient: largeDuration < (smallResult ? performanceTests[0].performance.totalTime * 3 : 15000)
        },
        success: largeResult.status === 'success'
      })
    } catch (error) {
      performanceTests.push({
        testName: 'Large Dataset (48 rows)',
        dataSize: { rows: largeRows.length, columns: Object.keys(largeRows[0] || {}).length },
        performance: { totalTime: Date.now() - largeDataStart, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      })
    }
    
    // Test 3: Complex Data Processing
    console.log('📊 Test 3: Complex data with multiple dimensions')
    const complexDataStart = Date.now()
    
    // Create complex aggregations from large dataset
    const complexAggregations = generateComplexAggregations(largeRows)
    
    try {
      const complexResult = await runPipeline({
        deckId: 'perf-test-complex',
        csvData: complexAggregations,
        context: {
          businessGoals: ['advanced_analytics', 'predictive_insights', 'competitive_analysis'],
          industry: 'Technology',
          audience: 'Data Science Team',
          presentationType: 'analytical_deep_dive'
        }
      })
      
      const complexDuration = Date.now() - complexDataStart
      
      performanceTests.push({
        testName: 'Complex Aggregated Data',
        dataSize: {
          rows: complexAggregations.length,
          columns: Object.keys(complexAggregations[0] || {}).length,
          complexity: 'High - Aggregated metrics'
        },
        performance: {
          totalTime: complexDuration,
          timePerRow: Math.round(complexDuration / complexAggregations.length),
          status: complexResult.status,
          slidesGenerated: complexResult.finalDeckJson?.presentation?.slides?.length || 0,
          chartsGenerated: countCharts(complexResult),
          qualityScore: complexResult.metadata?.qualityScore || 0
        },
        success: complexResult.status === 'success'
      })
    } catch (error) {
      performanceTests.push({
        testName: 'Complex Aggregated Data',
        dataSize: { rows: complexAggregations.length, columns: Object.keys(complexAggregations[0] || {}).length },
        performance: { totalTime: Date.now() - complexDataStart, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      })
    }
    
    // Test 4: Concurrent Processing
    console.log('📊 Test 4: Concurrent pipeline processing')
    const concurrentStart = Date.now()
    
    const concurrentPromises = [
      runPipeline({
        deckId: 'perf-test-concurrent-1',
        csvData: smallRows.slice(0, 12),
        context: { businessGoals: ['quick_analysis'], industry: 'Tech' }
      }),
      runPipeline({
        deckId: 'perf-test-concurrent-2', 
        csvData: smallRows.slice(12, 24),
        context: { businessGoals: ['quick_analysis'], industry: 'Tech' }
      })
    ]
    
    try {
      const concurrentResults = await Promise.all(concurrentPromises)
      const concurrentDuration = Date.now() - concurrentStart
      
      performanceTests.push({
        testName: 'Concurrent Processing (2 pipelines)',
        dataSize: {
          rows: smallRows.length,
          parallelJobs: 2,
          rowsPerJob: 12
        },
        performance: {
          totalTime: concurrentDuration,
          successfulJobs: concurrentResults.filter(r => r.status === 'success').length,
          totalJobs: concurrentResults.length,
          averageJobTime: Math.round(concurrentDuration / concurrentResults.length),
          concurrencyEfficient: concurrentDuration < (performanceTests[0]?.performance.totalTime * 1.5 || 10000)
        },
        success: concurrentResults.every(r => r.status === 'success')
      })
    } catch (error) {
      performanceTests.push({
        testName: 'Concurrent Processing (2 pipelines)',
        dataSize: { parallelJobs: 2 },
        performance: { totalTime: Date.now() - concurrentStart, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      })
    }
    
    // Analyze performance results
    const performanceAnalysis = {
      totalTests: performanceTests.length,
      successfulTests: performanceTests.filter(t => t.success).length,
      averageProcessingTime: Math.round(
        performanceTests
          .filter(t => t.success && t.performance.totalTime)
          .reduce((sum, t) => sum + t.performance.totalTime, 0) / 
        performanceTests.filter(t => t.success && t.performance.totalTime).length
      ),
      scalabilityScore: calculateScalabilityScore(performanceTests),
      performanceRating: getPerformanceRating(performanceTests),
      bottlenecks: identifyBottlenecks(performanceTests)
    }
    
    // Generate performance recommendations
    const recommendations = []
    
    if (performanceAnalysis.successfulTests < performanceAnalysis.totalTests) {
      recommendations.push('Address pipeline failures under load')
    }
    
    if (performanceAnalysis.averageProcessingTime > 10000) {
      recommendations.push('Optimize processing time - consider caching and parallel processing')
    }
    
    const largeTest = performanceTests.find(t => t.testName.includes('Large Dataset'))
    const smallTest = performanceTests.find(t => t.testName.includes('Small Dataset'))
    
    if (largeTest && smallTest && largeTest.performance.totalTime > smallTest.performance.totalTime * 4) {
      recommendations.push('Implement data chunking for better scalability')
    }
    
    if (performanceAnalysis.scalabilityScore < 80) {
      recommendations.push('Improve system scalability with larger datasets')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent across all test scenarios')
      recommendations.push('System is ready for production workloads')
      recommendations.push('Consider monitoring real-world performance metrics')
    }
    
    console.log('✅ Performance testing completed')
    console.log(`⚡ Scalability score: ${performanceAnalysis.scalabilityScore}%`)
    console.log(`🏆 Performance rating: ${performanceAnalysis.performanceRating}`)
    
    return NextResponse.json({
      success: true,
      testResults: {
        performanceAnalysis,
        performanceTests,
        recommendations,
        summary: {
          overallPerformance: performanceAnalysis.performanceRating,
          scalabilityScore: performanceAnalysis.scalabilityScore,
          averageProcessingTime: `${performanceAnalysis.averageProcessingTime}ms`,
          productionReadiness: performanceAnalysis.scalabilityScore >= 80 && 
                              performanceAnalysis.performanceRating !== 'Poor' ? 
                              'Ready for Production' : 'Needs Optimization'
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function parseCSV(csvData: string) {
  const lines = csvData.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const row: any = {}
    headers.forEach((header, index) => {
      const value = values[index]
      if (!isNaN(Number(value)) && value !== '') {
        row[header] = Number(value)
      } else {
        row[header] = value
      }
    })
    return row
  })
}

function countCharts(result: any): number {
  const slides = result.finalDeckJson?.presentation?.slides || []
  return slides.reduce((count: number, slide: any) => {
    return count + (slide.charts?.length || 0)
  }, 0)
}

function generateComplexAggregations(data: any[]): any[] {
  // Generate aggregated metrics to test complex data processing
  const aggregations = []
  
  // Monthly aggregations
  const monthlyData = data.reduce((acc: any, row: any) => {
    const month = row.Date.substring(0, 7) // YYYY-MM
    if (!acc[month]) acc[month] = []
    acc[month].push(row)
    return acc
  }, {})
  
  Object.entries(monthlyData).forEach(([month, rows]: [string, any]) => {
    aggregations.push({
      Period: month,
      Type: 'Monthly',
      TotalRevenue: rows.reduce((sum: number, r: any) => sum + r.Sales_Revenue, 0),
      TotalUnits: rows.reduce((sum: number, r: any) => sum + r.Units_Sold, 0),
      AvgSatisfaction: rows.reduce((sum: number, r: any) => sum + r.Customer_Satisfaction, 0) / rows.length,
      TotalMarketing: rows.reduce((sum: number, r: any) => sum + r.Marketing_Spend, 0),
      UniqueRegions: new Set(rows.map((r: any) => r.Region)).size,
      ROI: rows.reduce((sum: number, r: any) => sum + (r.Sales_Revenue / r.Marketing_Spend), 0) / rows.length
    })
  })
  
  return aggregations
}

function calculateScalabilityScore(tests: any[]): number {
  const smallTest = tests.find(t => t.testName.includes('Small'))
  const largeTest = tests.find(t => t.testName.includes('Large'))
  
  if (!smallTest || !largeTest || !smallTest.success || !largeTest.success) {
    return 50 // Default score if tests failed
  }
  
  const scalingRatio = largeTest.performance.totalTime / smallTest.performance.totalTime
  const dataSizeRatio = largeTest.dataSize.rows / smallTest.dataSize.rows
  
  // Good scaling should be roughly linear or better
  const efficiency = Math.min(100, (dataSizeRatio / scalingRatio) * 100)
  return Math.round(efficiency)
}

function getPerformanceRating(tests: any[]): string {
  const avgTime = tests
    .filter(t => t.success && t.performance.totalTime)
    .reduce((sum, t) => sum + t.performance.totalTime, 0) / 
    tests.filter(t => t.success && t.performance.totalTime).length
  
  if (avgTime < 5000) return 'Excellent'
  if (avgTime < 10000) return 'Very Good'
  if (avgTime < 20000) return 'Good'
  if (avgTime < 30000) return 'Fair'
  return 'Poor'
}

function identifyBottlenecks(tests: any[]): string[] {
  const bottlenecks = []
  
  const failedTests = tests.filter(t => !t.success)
  if (failedTests.length > 0) {
    bottlenecks.push(`${failedTests.length} test(s) failed`)
  }
  
  const slowTests = tests.filter(t => t.success && t.performance.totalTime > 15000)
  if (slowTests.length > 0) {
    bottlenecks.push(`Slow processing on ${slowTests.map(t => t.testName).join(', ')}`)
  }
  
  return bottlenecks
}