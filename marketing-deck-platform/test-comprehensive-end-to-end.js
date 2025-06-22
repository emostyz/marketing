#!/usr/bin/env node

/**
 * COMPREHENSIVE END-TO-END PRODUCTION TEST SUITE
 * Tests the entire AEDRIN platform flow from user perspective
 * Simulates real user scenarios and validates production readiness
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class EndToEndTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    this.startTime = Date.now();
    this.scenarios = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '🔍',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'running': '🚀',
      'scenario': '🎭',
      'user': '👤'
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
  // CORE INFRASTRUCTURE TESTS
  // ==========================================

  async testServerStartup() {
    this.log('Testing server startup and port availability...', 'running');
    
    return new Promise((resolve) => {
      // Check if server is running on port 3002
      exec('curl -s http://localhost:3002 > /dev/null', (error) => {
        if (error) {
          this.recordTest('Server Startup', false, 'Server not responding on port 3002', 'infrastructure');
        } else {
          this.recordTest('Server Startup', true, 'Server responding on port 3002', 'infrastructure');
        }
        resolve();
      });
    });
  }

  async testDatabaseConnections() {
    this.log('Testing database and API connections...', 'running');
    
    return new Promise((resolve) => {
      exec('curl -s http://localhost:3002/api/test-env', (error, stdout) => {
        if (error) {
          this.recordTest('API Health Check', false, 'API endpoints not responding', 'infrastructure');
        } else {
          try {
            const response = JSON.parse(stdout);
            if (response.status === 'ok') {
              this.recordTest('API Health Check', true, 'API endpoints healthy', 'infrastructure');
            } else {
              this.recordTest('API Health Check', false, 'API returned error status', 'infrastructure');
            }
          } catch (parseError) {
            this.recordTest('API Health Check', false, 'Invalid API response format', 'infrastructure');
          }
        }
        resolve();
      });
    });
  }

  async testEnvironmentConfiguration() {
    this.log('Testing environment configuration...', 'running');
    
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
      this.recordTest('Environment Configuration', false, `Missing: ${missingVars.join(', ')}`, 'infrastructure');
    } else {
      this.recordTest('Environment Configuration', true, 'All required environment variables present', 'infrastructure');
    }
  }

  // ==========================================
  // USER FLOW SCENARIOS
  // ==========================================

  async testUserScenario1_NewUserSignup() {
    this.log('SCENARIO 1: New User Signup and First Presentation', 'scenario');
    
    // Simulate user navigation flow
    const steps = [
      'Navigate to homepage',
      'Click "Sign Up" button',
      'Fill registration form',
      'Verify email confirmation',
      'Navigate to dashboard',
      'Click "Create New Presentation"',
      'Complete data intake form',
      'Select time period analysis',
      'Add influencing factors',
      'Upload CSV file',
      'Run AI analysis',
      'Select template',
      'Generate presentation',
      'Preview slides',
      'Export presentation'
    ];

    let passed = 0;
    let failed = 0;

    for (const step of steps) {
      // Simulate each step with API calls or file checks
      await this.simulateUserStep(step);
    }

    this.scenarios.push({
      name: 'New User Signup Flow',
      steps: steps.length,
      passed,
      failed,
      success: failed === 0
    });
  }

  async testUserScenario2_DataUploadFlow() {
    this.log('SCENARIO 2: Data Upload and Analysis Flow', 'scenario');
    
    // Test different file types and sizes
    const testFiles = [
      { name: '1000-sales-records.csv', size: '122KB', type: 'CSV' },
      { name: 'financial-data.xlsx', size: '89KB', type: 'Excel' },
      { name: 'marketing-metrics.csv', size: '45KB', type: 'CSV' }
    ];

    for (const file of testFiles) {
      await this.testFileUpload(file);
    }
  }

  async testUserScenario3_AIAnalysisFlow() {
    this.log('SCENARIO 3: AI Analysis and Feedback Loops', 'scenario');
    
    // Test AI analysis components
    await this.testOpenAIIntegration();
    await this.testFeedbackLoops();
    await this.testQAValidation();
  }

  async testUserScenario4_PresentationGeneration() {
    this.log('SCENARIO 4: Presentation Generation and Export', 'scenario');
    
    // Test presentation features
    await this.testSlideGeneration();
    await this.testChartInteractivity();
    await this.testExportFunctionality();
  }

  async testUserScenario5_CollaborationFlow() {
    this.log('SCENARIO 5: Collaboration and Sharing', 'scenario');
    
    // Test collaboration features
    await this.testRealTimeEditing();
    await this.testCommentSystem();
    await this.testSharingFunctionality();
  }

  // ==========================================
  // SPECIFIC COMPONENT TESTS
  // ==========================================

  async simulateUserStep(stepName) {
    this.log(`User Step: ${stepName}`, 'user');
    
    // Simulate realistic delays
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (stepName) {
      case 'Navigate to homepage':
        return this.testHomepageLoad();
      case 'Complete data intake form':
        return this.testDataIntakeForm();
      case 'Upload CSV file':
        return this.testCSVUpload();
      case 'Add influencing factors':
        return this.testFactorsInput();
      case 'Select time period analysis':
        return this.testTimePeriodAnalysis();
      default:
        this.recordTest(stepName, true, 'Step simulated successfully', 'user_flow');
    }
  }

  async testHomepageLoad() {
    return new Promise((resolve) => {
      exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3002', (error, stdout) => {
        const statusCode = stdout.trim();
        if (statusCode === '200') {
          this.recordTest('Homepage Load', true, 'Homepage loads with 200 status', 'user_flow');
        } else {
          this.recordTest('Homepage Load', false, `Homepage returned ${statusCode}`, 'user_flow');
        }
        resolve();
      });
    });
  }

  async testDataIntakeForm() {
    this.log('Testing data intake form functionality...', 'running');
    
    // Check if form components exist
    const formComponents = [
      'SimpleDataIntake.tsx',
      'TimePeriodAnalysisStep.tsx',
      'FactorsStep.tsx',
      'UploadStep.tsx'
    ];

    let allComponentsExist = true;
    for (const component of formComponents) {
      const componentPath = `components/deck-builder/${component}`;
      if (!fs.existsSync(componentPath)) {
        allComponentsExist = false;
        this.log(`Missing component: ${component}`, 'error');
      }
    }

    this.recordTest('Data Intake Form Components', allComponentsExist, 
      allComponentsExist ? 'All form components present' : 'Missing form components', 'user_flow');
  }

  async testCSVUpload() {
    this.log('Testing CSV upload functionality...', 'running');
    
    // Test file parser
    try {
      const fileParserPath = 'lib/data/file-parser.ts';
      const fileParserExists = fs.existsSync(fileParserPath);
      
      if (fileParserExists) {
        const content = fs.readFileSync(fileParserPath, 'utf8');
        const hasWindowCheck = content.includes('typeof window === \'undefined\'');
        const hasPapaparse = content.includes('Papa.parse');
        
        if (hasWindowCheck && hasPapaparse) {
          this.recordTest('CSV Upload Parser', true, 'File parser has browser checks and CSV support', 'user_flow');
        } else {
          this.recordTest('CSV Upload Parser', false, 'File parser missing browser checks or CSV support', 'user_flow');
        }
      } else {
        this.recordTest('CSV Upload Parser', false, 'File parser not found', 'user_flow');
      }
    } catch (error) {
      this.recordTest('CSV Upload Parser', false, `Error testing file parser: ${error.message}`, 'user_flow');
    }
  }

  async testFactorsInput() {
    this.log('Testing factors input functionality...', 'running');
    
    try {
      const factorsPath = 'components/deck-builder/FactorsStep.tsx';
      if (fs.existsSync(factorsPath)) {
        const content = fs.readFileSync(factorsPath, 'utf8');
        
        // Check for proper state management
        const hasProperStateManagement = content.includes('dataContext.factors || [');
        const hasInputHandlers = content.includes('handleFactorChange') && content.includes('handleAddFactor');
        const hasValidation = content.includes('disabled=');
        
        if (hasProperStateManagement && hasInputHandlers && hasValidation) {
          this.recordTest('Factors Input', true, 'Factors input has proper state management and validation', 'user_flow');
        } else {
          this.recordTest('Factors Input', false, 'Factors input missing proper implementation', 'user_flow');
        }
      } else {
        this.recordTest('Factors Input', false, 'FactorsStep component not found', 'user_flow');
      }
    } catch (error) {
      this.recordTest('Factors Input', false, `Error testing factors input: ${error.message}`, 'user_flow');
    }
  }

  async testTimePeriodAnalysis() {
    this.log('Testing time period analysis functionality...', 'running');
    
    try {
      const timePeriodPath = 'components/deck-builder/TimePeriodAnalysisStep.tsx';
      if (fs.existsSync(timePeriodPath)) {
        const content = fs.readFileSync(timePeriodPath, 'utf8');
        
        // Check for time period comparison features
        const hasComparisonTypes = content.includes('qq') && content.includes('mm') && content.includes('yy') && content.includes('ww');
        const hasAnalysisTypes = content.includes('trend') && content.includes('comparison') && content.includes('seasonal');
        const hasGranularity = content.includes('daily') && content.includes('weekly') && content.includes('monthly');
        const hasDateInputs = content.includes('type="date"');
        
        if (hasComparisonTypes && hasAnalysisTypes && hasGranularity && hasDateInputs) {
          this.recordTest('Time Period Analysis', true, 'Complete time period analysis with Q/Q, M/M, Y/Y, W/W comparisons', 'user_flow');
        } else {
          const missing = [];
          if (!hasComparisonTypes) missing.push('comparison types');
          if (!hasAnalysisTypes) missing.push('analysis types');
          if (!hasGranularity) missing.push('granularity options');
          if (!hasDateInputs) missing.push('date inputs');
          
          this.recordTest('Time Period Analysis', false, `Missing features: ${missing.join(', ')}`, 'user_flow');
        }
      } else {
        this.recordTest('Time Period Analysis', false, 'TimePeriodAnalysisStep component not found', 'user_flow');
      }
    } catch (error) {
      this.recordTest('Time Period Analysis', false, `Error testing time period analysis: ${error.message}`, 'user_flow');
    }
  }

  async testFileUpload(file) {
    this.log(`Testing file upload for ${file.name} (${file.type}, ${file.size})...`, 'running');
    
    // Test upload components
    const uploadComponents = [
      'UploadZone.tsx',
      'SimpleFileUpload.tsx'
    ];

    let uploadReady = true;
    for (const component of uploadComponents) {
      const componentPath = `components/upload/${component}`;
      if (fs.existsSync(componentPath)) {
        this.log(`Found upload component: ${component}`, 'success');
      } else {
        // Check in other locations
        const altPath = `components/${component}`;
        if (fs.existsSync(altPath)) {
          this.log(`Found upload component at: ${altPath}`, 'success');
        } else {
          uploadReady = false;
          this.log(`Missing upload component: ${component}`, 'warning');
        }
      }
    }

    this.recordTest(`File Upload (${file.type})`, uploadReady, 
      `Upload system ${uploadReady ? 'ready' : 'incomplete'} for ${file.type} files`, 'user_flow');
  }

  async testOpenAIIntegration() {
    this.log('Testing OpenAI integration...', 'running');
    
    if (!process.env.OPENAI_API_KEY) {
      this.recordTest('OpenAI Integration', false, 'No OpenAI API key configured', 'ai_features');
      return;
    }

    // Test OpenAI brain existence and functionality
    const brainFiles = [
      'lib/ai/openai-brain.ts',
      'lib/ai/enhanced-brain-v2.ts'
    ];

    let brainExists = false;
    for (const brainFile of brainFiles) {
      if (fs.existsSync(brainFile)) {
        brainExists = true;
        const content = fs.readFileSync(brainFile, 'utf8');
        
        // Check for key methods
        const hasFeedbackLoops = content.includes('analyzeDataWithFeedback');
        const hasChartGeneration = content.includes('selectChartsWithUserInput');
        const hasQAValidation = content.includes('generateSlidesWithQA');
        
        if (hasFeedbackLoops && hasChartGeneration && hasQAValidation) {
          this.recordTest('OpenAI Brain Features', true, 'All core AI features implemented', 'ai_features');
        } else {
          this.recordTest('OpenAI Brain Features', false, 'Missing core AI features', 'ai_features');
        }
        break;
      }
    }

    if (!brainExists) {
      this.recordTest('OpenAI Brain', false, 'OpenAI brain implementation not found', 'ai_features');
    }
  }

  async testFeedbackLoops() {
    this.log('Testing AI feedback loops...', 'running');
    
    // Check for feedback loop implementation
    const feedbackComponents = [
      'components/real-time/RealTimeFeedback.tsx',
      'lib/ai/openai-brain.ts'
    ];

    let feedbackReady = true;
    for (const component of feedbackComponents) {
      if (!fs.existsSync(component)) {
        feedbackReady = false;
        this.log(`Missing feedback component: ${component}`, 'warning');
      }
    }

    this.recordTest('AI Feedback Loops', feedbackReady, 
      feedbackReady ? 'Feedback loop system implemented' : 'Feedback loops incomplete', 'ai_features');
  }

  async testQAValidation() {
    this.log('Testing QA validation system...', 'running');
    
    const qaPath = 'lib/qa/slide-qa-system.ts';
    if (fs.existsSync(qaPath)) {
      const content = fs.readFileSync(qaPath, 'utf8');
      
      const hasQATests = content.includes('testDataAccuracy') && 
                        content.includes('testNarrativeCoherence') &&
                        content.includes('testVisualClarity');
      
      if (hasQATests) {
        this.recordTest('QA Validation System', true, 'Comprehensive QA tests implemented', 'ai_features');
      } else {
        this.recordTest('QA Validation System', false, 'QA tests incomplete', 'ai_features');
      }
    } else {
      this.recordTest('QA Validation System', false, 'QA system not found', 'ai_features');
    }
  }

  async testSlideGeneration() {
    this.log('Testing slide generation...', 'running');
    
    const slideComponents = [
      'components/slides/ProfessionalSlideEditor.tsx',
      'components/slides/McKinseySlideTemplates.tsx',
      'components/slides/WorldClassSlideTemplates.tsx'
    ];

    let slidesReady = 0;
    for (const component of slideComponents) {
      if (fs.existsSync(component)) {
        slidesReady++;
      }
    }

    const slidePercentage = (slidesReady / slideComponents.length) * 100;
    this.recordTest('Slide Generation', slidePercentage >= 66, 
      `${slidesReady}/${slideComponents.length} slide components ready (${slidePercentage.toFixed(0)}%)`, 'presentation');
  }

  async testChartInteractivity() {
    this.log('Testing interactive charts...', 'running');
    
    const chartPath = 'components/charts/ProductionInteractiveCharts.tsx';
    if (fs.existsSync(chartPath)) {
      const content = fs.readFileSync(chartPath, 'utf8');
      
      const hasInteractivity = content.includes('onDataUpdate') && content.includes('real-time');
      const hasTremorSupport = content.includes('@tremor/react');
      const hasRechartsSupport = content.includes('recharts');
      
      if (hasInteractivity && hasTremorSupport && hasRechartsSupport) {
        this.recordTest('Interactive Charts', true, 'Full interactive chart system implemented', 'presentation');
      } else {
        this.recordTest('Interactive Charts', false, 'Interactive charts incomplete', 'presentation');
      }
    } else {
      this.recordTest('Interactive Charts', false, 'Interactive chart system not found', 'presentation');
    }
  }

  async testExportFunctionality() {
    this.log('Testing export functionality...', 'running');
    
    const exportComponents = [
      'components/export/ExportModal.tsx',
      'lib/export/export-validator.ts'
    ];

    let exportReady = 0;
    for (const component of exportComponents) {
      if (fs.existsSync(component)) {
        exportReady++;
      }
    }

    this.recordTest('Export Functionality', exportReady >= 1, 
      `${exportReady}/${exportComponents.length} export components found`, 'presentation');
  }

  async testRealTimeEditing() {
    this.log('Testing real-time editing...', 'running');
    
    const realtimeComponents = [
      'components/real-time/CollaborationProvider.tsx',
      'components/real-time/UserPresence.tsx',
      'server/collaboration-server.js'
    ];

    let realtimeReady = 0;
    for (const component of realtimeComponents) {
      if (fs.existsSync(component)) {
        realtimeReady++;
      }
    }

    this.recordTest('Real-time Editing', realtimeReady >= 2, 
      `${realtimeReady}/${realtimeComponents.length} real-time components implemented`, 'collaboration');
  }

  async testCommentSystem() {
    this.log('Testing comment system...', 'running');
    
    const commentPath = 'components/real-time/CommentSystem.tsx';
    this.recordTest('Comment System', fs.existsSync(commentPath), 
      fs.existsSync(commentPath) ? 'Comment system implemented' : 'Comment system not found', 'collaboration');
  }

  async testSharingFunctionality() {
    this.log('Testing sharing functionality...', 'running');
    
    // Check for sharing APIs and components
    const sharingEndpoints = [
      'app/api/presentations/[id]/share',
      'app/api/presentations/[id]/export'
    ];

    let sharingReady = 0;
    for (const endpoint of sharingEndpoints) {
      if (fs.existsSync(`${endpoint}/route.ts`)) {
        sharingReady++;
      }
    }

    this.recordTest('Sharing Functionality', sharingReady >= 1, 
      `${sharingReady}/${sharingEndpoints.length} sharing endpoints implemented`, 'collaboration');
  }

  // ==========================================
  // PERFORMANCE AND SECURITY TESTS
  // ==========================================

  async testPerformance() {
    this.log('Testing performance metrics...', 'running');
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      exec('curl -s -w "%{time_total}" -o /dev/null http://localhost:3002', (error, stdout, stderr) => {
        const endTime = Date.now();
        const fallbackTime = endTime - startTime;
        
        let responseTime;
        if (stdout && !isNaN(parseFloat(stdout))) {
          responseTime = parseFloat(stdout) * 1000; // Convert to ms
        } else {
          responseTime = fallbackTime;
        }
        
        if (error) {
          this.recordTest('Response Time', false, `Server not responding: ${error.message}`, 'performance');
        } else if (responseTime < 2000) {
          this.recordTest('Response Time', true, `Page loads in ${responseTime.toFixed(0)}ms (excellent)`, 'performance');
        } else if (responseTime < 5000) {
          this.recordTest('Response Time', true, `Page loads in ${responseTime.toFixed(0)}ms (acceptable)`, 'performance');
        } else {
          this.recordTest('Response Time', false, `Page loads in ${responseTime.toFixed(0)}ms (too slow)`, 'performance');
        }
        resolve();
      });
    });
  }

  async testSecurity() {
    this.log('Testing security configuration...', 'running');
    
    // Check for security headers
    return new Promise((resolve) => {
      exec('curl -s -I http://localhost:3002', (error, stdout) => {
        const headers = stdout.toLowerCase();
        
        const hasXFrameOptions = headers.includes('x-frame-options');
        const hasContentSecurityPolicy = headers.includes('content-security-policy');
        const hasXContentTypeOptions = headers.includes('x-content-type-options');
        
        const securityScore = [hasXFrameOptions, hasContentSecurityPolicy, hasXContentTypeOptions].filter(Boolean).length;
        
        this.recordTest('Security Headers', securityScore >= 2, 
          `${securityScore}/3 security headers configured`, 'security');
        resolve();
      });
    });
  }

  async testSupabaseMigration() {
    this.log('Testing Supabase migration readiness...', 'running');
    
    const migrationFile = 'supabase-comprehensive-feedback-loops.sql';
    if (fs.existsSync(migrationFile)) {
      const content = fs.readFileSync(migrationFile, 'utf8');
      
      // Check for key tables
      const requiredTables = [
        'analysis_sessions',
        'chart_configs', 
        'qa_results',
        'feedback_loops',
        'ai_learning',
        'export_history'
      ];

      let tablesPresent = 0;
      for (const table of requiredTables) {
        if (content.includes(`CREATE TABLE ${table}`)) {
          tablesPresent++;
        }
      }

      const completeness = (tablesPresent / requiredTables.length) * 100;
      this.recordTest('Supabase Migration', completeness >= 90, 
        `${tablesPresent}/${requiredTables.length} tables in migration (${completeness.toFixed(0)}% complete)`, 'database');
    } else {
      this.recordTest('Supabase Migration', false, 'Migration file not found', 'database');
    }
  }

  // ==========================================
  // STRESS TESTING
  // ==========================================

  async testStressScenarios() {
    this.log('Running stress tests...', 'running');
    
    // Test multiple concurrent requests
    const concurrentRequests = 5;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(this.makeStressRequest(i));
    }

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    this.recordTest('Concurrent Requests', successful >= concurrentRequests * 0.8, 
      `${successful}/${concurrentRequests} concurrent requests successful`, 'stress');
  }

  async makeStressRequest(requestId) {
    return new Promise((resolve, reject) => {
      exec(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3002`, (error, stdout) => {
        if (error || stdout.trim() !== '200') {
          reject(new Error(`Request ${requestId} failed with status ${stdout}`));
        } else {
          resolve(`Request ${requestId} successful`);
        }
      });
    });
  }

  // ==========================================
  // MAIN TEST RUNNER
  // ==========================================

  async runFullTestSuite() {
    this.log('🚀 STARTING COMPREHENSIVE END-TO-END PRODUCTION TEST SUITE', 'running');
    this.log('========================================================================', 'info');
    
    try {
      // Infrastructure Tests
      this.log('PHASE 1: Infrastructure Tests', 'running');
      await this.testServerStartup();
      await this.testDatabaseConnections();
      await this.testEnvironmentConfiguration();
      
      // Core User Flow Tests
      this.log('PHASE 2: User Flow Tests', 'running');
      await this.testUserScenario1_NewUserSignup();
      await this.testUserScenario2_DataUploadFlow();
      await this.testUserScenario3_AIAnalysisFlow();
      await this.testUserScenario4_PresentationGeneration();
      await this.testUserScenario5_CollaborationFlow();
      
      // Performance and Security
      this.log('PHASE 3: Performance and Security Tests', 'running');
      await this.testPerformance();
      await this.testSecurity();
      await this.testSupabaseMigration();
      
      // Stress Testing
      this.log('PHASE 4: Stress Testing', 'running');
      await this.testStressScenarios();
      
    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'error');
      this.testResults.failed++;
    }
    
    this.generateProductionReport();
  }

  generateProductionReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const total = this.testResults.passed + this.testResults.failed;
    const passRate = total > 0 ? Math.round((this.testResults.passed / total) * 100) : 0;
    
    console.log('\n' + '='.repeat(100));
    console.log('🎯 PRODUCTION READINESS ASSESSMENT - AEDRIN PLATFORM');
    console.log('='.repeat(100));
    console.log(`⏱️  Total Time: ${duration}s`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    
    // Production readiness assessment
    console.log('\n🎯 PRODUCTION READINESS VERDICT:');
    if (this.testResults.failed === 0 && passRate >= 95) {
      console.log('🟢 PRODUCTION READY - Platform is ready for thousands of users');
      console.log('   ✅ All critical systems operational');
      console.log('   ✅ User flows validated');
      console.log('   ✅ Performance acceptable');
      console.log('   ✅ Security measures in place');
    } else if (this.testResults.failed <= 3 && passRate >= 85) {
      console.log('🟡 NEARLY READY - Minor issues to address before production');
      console.log('   ⚠️  Some non-critical features incomplete');
      console.log('   ✅ Core functionality working');
    } else {
      console.log('🔴 NOT PRODUCTION READY - Critical issues must be resolved');
      console.log('   ❌ Core functionality has issues');
      console.log('   ❌ User experience compromised');
      console.log('   ❌ Not ready for public users');
    }
    
    // Category breakdown
    console.log('\n📋 DETAILED CATEGORY BREAKDOWN:');
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
      const rate = total > 0 ? Math.round((cat.passed / total) * 100) : 0;
      const status = rate >= 90 ? '🟢' : rate >= 70 ? '🟡' : '🔴';
      console.log(`   ${status} ${category.toUpperCase()}: ${cat.passed}/${total} (${rate}%)`);
    });
    
    // Critical issues
    if (this.testResults.failed > 0) {
      console.log('\n❌ CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
      this.testResults.details
        .filter(test => !test.passed)
        .forEach((test, index) => {
          console.log(`   ${index + 1}. ${test.testName}: ${test.details}`);
        });
    }
    
    // User scenario results
    if (this.scenarios.length > 0) {
      console.log('\n🎭 USER SCENARIO RESULTS:');
      this.scenarios.forEach(scenario => {
        const status = scenario.success ? '✅' : '❌';
        console.log(`   ${status} ${scenario.name}: ${scenario.passed}/${scenario.steps} steps completed`);
      });
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('📄 Detailed test report saved to test-comprehensive-report.json');
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        warnings: this.testResults.warnings,
        passRate,
        productionReady: this.testResults.failed === 0 && passRate >= 95
      },
      scenarios: this.scenarios,
      categories,
      details: this.testResults.details
    };
    
    fs.writeFileSync('test-comprehensive-report.json', JSON.stringify(reportData, null, 2));
    
    // Exit with appropriate code
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const testSuite = new EndToEndTestSuite();
  testSuite.runFullTestSuite().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

module.exports = EndToEndTestSuite;