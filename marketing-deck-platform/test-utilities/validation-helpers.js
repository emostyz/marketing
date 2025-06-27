/**
 * VALIDATION HELPERS FOR EasyDecks.ai E2E TESTING
 * 
 * Utility functions to support comprehensive testing of the EasyDecks.ai platform
 * These helpers provide reusable validation logic for different components
 */

class ValidationHelpers {
  /**
   * Validate CSV data structure and content
   */
  static validateCSVData(data, expectedColumns, expectedRows) {
    const validation = {
      isValid: true,
      errors: [],
      metrics: {}
    };

    // Check row count
    if (data.length < expectedRows) {
      validation.isValid = false;
      validation.errors.push(`Expected at least ${expectedRows} rows, got ${data.length}`);
    }

    // Check column count
    if (data.length > 0) {
      const actualColumns = Object.keys(data[0]).length;
      if (actualColumns < expectedColumns) {
        validation.isValid = false;
        validation.errors.push(`Expected at least ${expectedColumns} columns, got ${actualColumns}`);
      }
      validation.metrics.columnCount = actualColumns;
    }

    validation.metrics.rowCount = data.length;
    return validation;
  }

  /**
   * Validate chart configuration
   */
  static validateChartConfig(chartConfig) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!chartConfig) {
      validation.isValid = false;
      validation.errors.push('Chart configuration is missing');
      return validation;
    }

    // Check required properties
    if (!chartConfig.type) {
      validation.isValid = false;
      validation.errors.push('Chart type is required');
    }

    if (!chartConfig.data || !Array.isArray(chartConfig.data)) {
      validation.isValid = false;
      validation.errors.push('Chart data must be an array');
    }

    // Validate chart type
    const validChartTypes = ['bar', 'line', 'pie', 'scatter', 'area', 'doughnut'];
    if (chartConfig.type && !validChartTypes.includes(chartConfig.type)) {
      validation.warnings.push(`Unusual chart type: ${chartConfig.type}`);
    }

    // Check data structure
    if (chartConfig.data && chartConfig.data.length > 0) {
      const firstItem = chartConfig.data[0];
      if (typeof firstItem !== 'object') {
        validation.isValid = false;
        validation.errors.push('Chart data items must be objects');
      }
    }

    return validation;
  }

  /**
   * Validate slide structure
   */
  static validateSlideStructure(slide) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      metrics: {}
    };

    if (!slide) {
      validation.isValid = false;
      validation.errors.push('Slide is null or undefined');
      return validation;
    }

    // Check required properties
    if (!slide.id) {
      validation.isValid = false;
      validation.errors.push('Slide ID is required');
    }

    if (!slide.title) {
      validation.warnings.push('Slide title is missing');
    }

    if (!slide.elements || !Array.isArray(slide.elements)) {
      validation.isValid = false;
      validation.errors.push('Slide elements must be an array');
    } else {
      validation.metrics.elementCount = slide.elements.length;
      
      // Validate each element
      slide.elements.forEach((element, index) => {
        const elementValidation = this.validateSlideElement(element);
        if (!elementValidation.isValid) {
          validation.isValid = false;
          validation.errors.push(`Element ${index}: ${elementValidation.errors.join(', ')}`);
        }
      });
    }

    return validation;
  }

  /**
   * Validate individual slide element
   */
  static validateSlideElement(element) {
    const validation = {
      isValid: true,
      errors: []
    };

    if (!element) {
      validation.isValid = false;
      validation.errors.push('Element is null or undefined');
      return validation;
    }

    // Check required properties
    if (!element.id) {
      validation.isValid = false;
      validation.errors.push('Element ID is required');
    }

    if (!element.type) {
      validation.isValid = false;
      validation.errors.push('Element type is required');
    }

    // Validate position and size
    const requiredNumbers = ['x', 'y', 'width', 'height'];
    requiredNumbers.forEach(prop => {
      if (typeof element[prop] !== 'number') {
        validation.isValid = false;
        validation.errors.push(`Element ${prop} must be a number`);
      }
    });

    // Type-specific validation
    if (element.type === 'chart' && element.chartConfig) {
      const chartValidation = this.validateChartConfig(element.chartConfig);
      if (!chartValidation.isValid) {
        validation.isValid = false;
        validation.errors.push(...chartValidation.errors);
      }
    }

    return validation;
  }

  /**
   * Validate AI insights
   */
  static validateAIInsights(insights) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      metrics: {}
    };

    if (!Array.isArray(insights)) {
      validation.isValid = false;
      validation.errors.push('Insights must be an array');
      return validation;
    }

    if (insights.length === 0) {
      validation.isValid = false;
      validation.errors.push('At least one insight is required');
      return validation;
    }

    validation.metrics.insightCount = insights.length;
    validation.metrics.avgLength = insights.reduce((sum, insight) => 
      sum + (insight.description ? insight.description.length : 0), 0) / insights.length;

    // Validate each insight
    insights.forEach((insight, index) => {
      if (!insight.description || insight.description.length < 10) {
        validation.warnings.push(`Insight ${index} description is too short`);
      }

      if (!insight.category) {
        validation.warnings.push(`Insight ${index} missing category`);
      }

      if (!insight.confidence || typeof insight.confidence !== 'number') {
        validation.warnings.push(`Insight ${index} missing or invalid confidence score`);
      }
    });

    return validation;
  }

  /**
   * Validate export response
   */
  static validateExportResponse(response, expectedFormat) {
    const validation = {
      isValid: true,
      errors: [],
      metrics: {}
    };

    if (!response) {
      validation.isValid = false;
      validation.errors.push('Export response is null or undefined');
      return validation;
    }

    // Check response status
    if (!response.ok) {
      validation.isValid = false;
      validation.errors.push(`Export failed with status ${response.status}`);
      return validation;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    const expectedContentTypes = {
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'pdf': 'application/pdf'
    };

    if (expectedFormat && expectedContentTypes[expectedFormat]) {
      if (!contentType || !contentType.includes(expectedContentTypes[expectedFormat])) {
        validation.isValid = false;
        validation.errors.push(`Expected ${expectedContentTypes[expectedFormat]}, got ${contentType}`);
      }
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      validation.metrics.fileSize = parseInt(contentLength);
      if (validation.metrics.fileSize < 1000) { // Less than 1KB seems suspicious
        validation.errors.push('Export file size is suspiciously small');
      }
    }

    return validation;
  }

  /**
   * Validate performance metrics
   */
  static validatePerformance(duration, maxDuration, operation) {
    const validation = {
      isValid: true,
      warnings: [],
      metrics: { duration, maxDuration, operation }
    };

    if (duration > maxDuration) {
      validation.isValid = false;
      validation.warnings.push(`${operation} took ${duration}ms, exceeded limit of ${maxDuration}ms`);
    }

    return validation;
  }

  /**
   * Generate data quality report
   */
  static generateDataQualityReport(data, columns) {
    const report = {
      totalRows: data.length,
      totalColumns: columns.length,
      columnAnalysis: {},
      overallQuality: 'unknown'
    };

    columns.forEach(column => {
      const columnData = data.map(row => row[column.name]);
      const nonNullData = columnData.filter(val => val !== null && val !== undefined && val !== '');
      
      report.columnAnalysis[column.name] = {
        type: column.type,
        nullCount: columnData.length - nonNullData.length,
        nullPercentage: ((columnData.length - nonNullData.length) / columnData.length * 100).toFixed(1),
        uniqueValues: new Set(nonNullData).size,
        sampleValues: [...new Set(nonNullData)].slice(0, 5)
      };
    });

    // Calculate overall quality score
    const avgNullPercentage = Object.values(report.columnAnalysis)
      .reduce((sum, col) => sum + parseFloat(col.nullPercentage), 0) / columns.length;
    
    if (avgNullPercentage < 5) report.overallQuality = 'excellent';
    else if (avgNullPercentage < 15) report.overallQuality = 'good';
    else if (avgNullPercentage < 30) report.overallQuality = 'fair';
    else report.overallQuality = 'poor';

    return report;
  }

  /**
   * Create test data sample
   */
  static createTestDataSample(rowCount = 100, columnCount = 5) {
    const columns = [];
    const data = [];

    // Generate column definitions
    for (let i = 0; i < columnCount; i++) {
      columns.push({
        name: `column_${i + 1}`,
        type: i % 3 === 0 ? 'number' : i % 3 === 1 ? 'string' : 'date'
      });
    }

    // Generate data rows
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      columns.forEach(col => {
        switch (col.type) {
          case 'number':
            row[col.name] = Math.floor(Math.random() * 1000);
            break;
          case 'string':
            row[col.name] = `value_${i + 1}_${Math.random().toString(36).substring(7)}`;
            break;
          case 'date':
            row[col.name] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
        }
      });
      data.push(row);
    }

    return { data, columns };
  }

  /**
   * Validate system health
   */
  static async validateSystemHealth(baseUrl) {
    const healthChecks = [
      { name: 'API Health', endpoint: '/api/health' },
      { name: 'Database Connection', endpoint: '/api/db/health' },
      { name: 'AI Service', endpoint: '/api/ai/health' },
      { name: 'Upload Service', endpoint: '/api/upload/health' }
    ];

    const results = [];

    for (const check of healthChecks) {
      try {
        const response = await fetch(`${baseUrl}${check.endpoint}`, {
          method: 'GET',
          timeout: 5000
        });

        results.push({
          name: check.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: response.headers.get('response-time') || 'unknown',
          details: response.ok ? 'OK' : `HTTP ${response.status}`
        });
      } catch (error) {
        results.push({
          name: check.name,
          status: 'error',
          details: error.message
        });
      }
    }

    return results;
  }
}

module.exports = { ValidationHelpers };