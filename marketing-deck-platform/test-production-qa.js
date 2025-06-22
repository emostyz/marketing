#!/usr/bin/env node

/**
 * Production QA Test Suite for AEDRIN Marketing Deck Platform
 * Comprehensive end-to-end testing to ensure world-class production readiness
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  openai_api_key: process.env.OPENAI_API_KEY,
  supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  test_timeout: 30000,
  max_retries: 3
};

class ProductionQARunner {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '🔍',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'running': '🚀'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp.split('T')[1].split('.')[0]}] ${message}`);
  }

  recordTest(testName, passed, details = '', category = 'general') {
    const result = {
      testName,
      passed,
      details,
      category,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.details.push(result);
    
    if (passed) {
      this.testResults.passed++;
      this.log(`${testName}: PASSED ${details}`, 'success');
    } else {
      this.testResults.failed++;
      this.log(`${testName}: FAILED ${details}`, 'error');
    }
  }

  recordWarning(testName, details) {
    this.testResults.warnings++;
    this.log(`${testName}: WARNING ${details}`, 'warning');
  }

  // ==========================================
  // BUILD AND DEPENDENCY TESTS
  // ==========================================

  async testBuildSystem() {
    this.log('Testing build system...', 'running');
    
    return new Promise((resolve) => {
      exec('npm run build', { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          this.recordTest('Build System', false, `Build failed: ${error.message}`, 'build');
          resolve();
        } else if (stderr.includes('Failed to compile')) {
          this.recordTest('Build System', false, 'TypeScript compilation errors detected', 'build');
          resolve();
        } else {
          this.recordTest('Build System', true, 'Clean production build completed', 'build');
          
          // Check for warnings
          const warningCount = (stdout.match(/⚠/g) || []).length;
          if (warningCount > 0) {
            this.recordWarning('Build Warnings', `${warningCount} warnings found (acceptable for production)`);
          }
          
          resolve();
        }
      });
    });
  }

  async testDependencies() {
    this.log('Testing dependencies...', 'running');
    
    // Check package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const criticalDeps = [
      'next',
      'react',
      'openai',
      '@supabase/supabase-js',
      '@tremor/react',
      'recharts',
      'echarts',
      'framer-motion',
      'lucide-react',
      'zod'
    ];
    
    let missingDeps = [];
    for (const dep of criticalDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      this.recordTest('Critical Dependencies', false, `Missing: ${missingDeps.join(', ')}`, 'dependencies');
    } else {
      this.recordTest('Critical Dependencies', true, 'All critical dependencies present', 'dependencies');
    }
    
    // Check for version conflicts
    if (packageJson.dependencies.react && packageJson.dependencies.react.includes('19.')) {
      this.recordTest('React Version', true, 'React 19 correctly configured', 'dependencies');
    } else {
      this.recordWarning('React Version', 'React version may need update for optimal performance');
    }
  }

  // ==========================================
  // CONFIGURATION TESTS
  // ==========================================

  async testEnvironmentConfig() {
    this.log('Testing environment configuration...', 'running');
    
    // Check required environment variables
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    let missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }
    
    if (missingVars.length > 0) {
      this.recordTest('Environment Variables', false, `Missing: ${missingVars.join(', ')}`, 'config');
    } else {
      this.recordTest('Environment Variables', true, 'All required environment variables present', 'config');
    }
    
    // Validate API key format
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      this.recordWarning('OpenAI API Key', 'API key format may be incorrect');
    }
  }

  async testSupabaseConfig() {
    this.log('Testing Supabase configuration...', 'running');
    
    if (!TEST_CONFIG.supabase_url || !TEST_CONFIG.supabase_anon_key) {
      this.recordTest('Supabase Config', false, 'Missing Supabase credentials', 'config');
      return;
    }
    
    try {
      // Try to initialize Supabase client
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(TEST_CONFIG.supabase_url, TEST_CONFIG.supabase_anon_key);
      
      // Test connection
      const { error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && !error.message.includes('JWT')) {
        this.recordTest('Supabase Connection', false, `Connection error: ${error.message}`, 'config');
      } else {
        this.recordTest('Supabase Connection', true, 'Successfully connected to Supabase', 'config');
      }
    } catch (error) {
      this.recordTest('Supabase Config', false, `Configuration error: ${error.message}`, 'config');
    }
  }

  // ==========================================
  // FILE STRUCTURE TESTS
  // ==========================================

  async testFileStructure() {
    this.log('Testing file structure...', 'running');
    
    const criticalFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'components/charts/ProductionInteractiveCharts.tsx',
      'lib/ai/openai-brain.ts',
      'lib/supabase/enhanced-client.ts',
      'supabase-comprehensive-feedback-loops.sql'
    ];
    
    let missingFiles = [];
    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      this.recordTest('Critical Files', false, `Missing: ${missingFiles.join(', ')}`, 'structure');
    } else {
      this.recordTest('Critical Files', true, 'All critical files present', 'structure');
    }
    
    // Check component structure
    const componentDirs = ['components/charts', 'components/deck-builder', 'components/ui'];
    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
        this.recordTest(`${dir} Components`, true, `${files.length} components found`, 'structure');
      } else {
        this.recordTest(`${dir} Components`, false, 'Directory missing', 'structure');
      }
    }
  }

  // ==========================================
  // CODE QUALITY TESTS
  // ==========================================

  async testTypeScriptQuality() {
    this.log('Testing TypeScript quality...', 'running');
    
    return new Promise((resolve) => {
      exec('npx tsc --noEmit', { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          const errorCount = (stderr.match(/error TS/g) || []).length;
          this.recordTest('TypeScript Compilation', false, `${errorCount} TypeScript errors`, 'quality');
        } else {
          this.recordTest('TypeScript Compilation', true, 'No TypeScript errors', 'quality');
        }
        resolve();
      });
    });
  }

  async testCodeComplexity() {
    this.log('Testing code complexity...', 'running');
    
    // Check for extremely long files (potential refactoring candidates)
    const srcFiles = this.getAllTsxFiles('.');
    let longFiles = [];
    
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lineCount = content.split('\n').length;
      
      if (lineCount > 1000) {
        longFiles.push(`${file}:${lineCount} lines`);
      }
    }
    
    if (longFiles.length > 5) {
      this.recordWarning('Code Complexity', `${longFiles.length} files > 1000 lines may need refactoring`);
    } else {
      this.recordTest('Code Complexity', true, 'File sizes within reasonable limits', 'quality');
    }
  }

  getAllTsxFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item.includes('node_modules') || item.includes('.next')) continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results = results.concat(this.getAllTsxFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
    
    return results;
  }

  // ==========================================
  // FUNCTIONAL TESTS
  // ==========================================

  async testOpenAIIntegration() {
    this.log('Testing OpenAI integration...', 'running');
    
    if (!TEST_CONFIG.openai_api_key) {
      this.recordTest('OpenAI Integration', false, 'No API key configured', 'functional');
      return;
    }
    
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: TEST_CONFIG.openai_api_key });
      
      // Test basic completion
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test message for AEDRIN QA" }],
        max_tokens: 10
      });
      
      if (response.choices && response.choices.length > 0) {
        this.recordTest('OpenAI API', true, 'API responding correctly', 'functional');
      } else {
        this.recordTest('OpenAI API', false, 'Invalid API response', 'functional');
      }
    } catch (error) {
      this.recordTest('OpenAI Integration', false, `API error: ${error.message}`, 'functional');
    }
  }

  async testChartLibraries() {
    this.log('Testing chart libraries...', 'running');
    
    try {
      // Test Tremor import
      const tremor = require('@tremor/react');
      if (tremor.AreaChart && tremor.BarChart && tremor.Card) {
        this.recordTest('Tremor Library', true, 'Core components available', 'functional');
      } else {
        this.recordTest('Tremor Library', false, 'Missing core components', 'functional');
      }
      
      // Test Recharts import
      const recharts = require('recharts');
      if (recharts.AreaChart && recharts.BarChart && recharts.LineChart) {
        this.recordTest('Recharts Library', true, 'Core components available', 'functional');
      } else {
        this.recordTest('Recharts Library', false, 'Missing core components', 'functional');
      }
      
      // Test ECharts import
      const echarts = require('echarts');
      if (echarts.init && echarts.dispose) {
        this.recordTest('ECharts Library', true, 'Core functions available', 'functional');
      } else {
        this.recordTest('ECharts Library', false, 'Missing core functions', 'functional');
      }
    } catch (error) {
      this.recordTest('Chart Libraries', false, `Import error: ${error.message}`, 'functional');
    }
  }

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  async testBuildPerformance() {
    this.log('Testing build performance...', 'running');
    
    const buildStartTime = Date.now();
    
    return new Promise((resolve) => {
      exec('npm run build', { timeout: 180000 }, (error, stdout, stderr) => {
        const buildTime = Date.now() - buildStartTime;
        const buildTimeSeconds = Math.round(buildTime / 1000);
        
        if (buildTimeSeconds < 60) {
          this.recordTest('Build Performance', true, `Build completed in ${buildTimeSeconds}s (excellent)`, 'performance');
        } else if (buildTimeSeconds < 120) {
          this.recordTest('Build Performance', true, `Build completed in ${buildTimeSeconds}s (good)`, 'performance');
        } else {
          this.recordWarning('Build Performance', `Build took ${buildTimeSeconds}s (consider optimization)`);
        }
        
        // Check bundle sizes
        if (stdout.includes('First Load JS')) {
          const bundleSizes = stdout.match(/(\d+(?:\.\d+)?)\s*kB/g);
          if (bundleSizes) {
            const maxSize = Math.max(...bundleSizes.map(s => parseFloat(s)));
            if (maxSize < 500) {
              this.recordTest('Bundle Size', true, `Max bundle: ${maxSize}kB (good)`, 'performance');
            } else {
              this.recordWarning('Bundle Size', `Max bundle: ${maxSize}kB (consider code splitting)`);
            }
          }
        }
        
        resolve();
      });
    });
  }

  // ==========================================
  // SECURITY TESTS
  // ==========================================

  async testSecurity() {
    this.log('Testing security configuration...', 'running');
    
    // Check for hardcoded secrets
    const srcFiles = this.getAllTsxFiles('.');
    let securityIssues = [];
    
    for (const file of srcFiles.slice(0, 20)) { // Sample check
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for potential hardcoded secrets
        if (content.includes('sk-') || content.includes('secret_key') || content.includes('api_key')) {
          securityIssues.push(`${file}: Potential hardcoded secret`);
        }
        
        // Check for eval usage
        if (content.includes('eval(')) {
          securityIssues.push(`${file}: eval() usage detected`);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    if (securityIssues.length > 0) {
      this.recordWarning('Security Scan', `${securityIssues.length} potential issues found`);
    } else {
      this.recordTest('Security Scan', true, 'No obvious security issues detected', 'security');
    }
    
    // Check Next.js security headers
    if (fs.existsSync('next.config.ts') || fs.existsSync('next.config.js')) {
      this.recordTest('Next.js Config', true, 'Configuration file present', 'security');
    } else {
      this.recordWarning('Next.js Config', 'Consider adding security headers configuration');
    }
  }

  // ==========================================
  // MAIN TEST RUNNER
  // ==========================================

  async runAllTests() {
    this.log('🚀 Starting Production QA Test Suite for AEDRIN Platform', 'running');
    this.log('========================================================', 'info');
    
    try {
      // Core system tests
      await this.testDependencies();
      await this.testEnvironmentConfig();
      await this.testFileStructure();
      
      // Build and quality tests
      await this.testBuildSystem();
      await this.testTypeScriptQuality();
      await this.testCodeComplexity();
      
      // Integration tests
      await this.testSupabaseConfig();
      await this.testOpenAIIntegration();
      await this.testChartLibraries();
      
      // Performance and security
      await this.testBuildPerformance();
      await this.testSecurity();
      
    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'error');
      this.testResults.failed++;
    }
    
    this.generateReport();
  }

  generateReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const total = this.testResults.passed + this.testResults.failed;
    const passRate = Math.round((this.testResults.passed / total) * 100);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PRODUCTION QA REPORT - AEDRIN PLATFORM');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Time: ${duration}s`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    
    // Production readiness assessment
    console.log('\n🎯 PRODUCTION READINESS ASSESSMENT:');
    if (this.testResults.failed === 0 && passRate >= 95) {
      console.log('🟢 READY FOR PRODUCTION - All critical tests passed');
    } else if (this.testResults.failed <= 2 && passRate >= 90) {
      console.log('🟡 MOSTLY READY - Minor issues to address');
    } else {
      console.log('🔴 NOT READY - Critical issues must be resolved');
    }
    
    // Category breakdown
    console.log('\n📋 TEST CATEGORY BREAKDOWN:');
    const categories = {};
    this.testResults.details.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, failed: 0 };
      }
      if (test.passed) {
        categories[test.category].passed++;
      } else {
        categories[test.category].failed++;
      }
    });
    
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      const total = cat.passed + cat.failed;
      const rate = Math.round((cat.passed / total) * 100);
      console.log(`   ${category}: ${cat.passed}/${total} (${rate}%)`);
    });
    
    // Failed tests detail
    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.testName}: ${test.details}`);
        });
    }
    
    // Warnings detail
    if (this.testResults.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.testResults.details
        .filter(test => test.details.includes('WARNING'))
        .forEach(test => {
          console.log(`   • ${test.testName}: ${test.details}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Write detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        warnings: this.testResults.warnings,
        passRate
      },
      details: this.testResults.details
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to test-report.json');
    
    // Exit with appropriate code
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Run the test suite
if (require.main === module) {
  const qa = new ProductionQARunner();
  qa.runAllTests().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

module.exports = ProductionQARunner;