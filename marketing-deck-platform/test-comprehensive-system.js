#!/usr/bin/env node

/**
 * Comprehensive System Test Script
 * Tests the complete flow from data upload to AI-powered deck creation
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:3000';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  verbose: true
};

// Sample test data
const SAMPLE_CSV_DATA = `Month,Revenue,Growth,Customers,Satisfaction
January,125000,12,450,4.2
February,138000,18,478,4.3
March,142000,15,492,4.1
April,165000,22,515,4.4
May,171000,24,538,4.3
June,184000,28,562,4.5`;

// Test form data
const TEST_FORM_DATA = {
  projectName: "Q1 2024 Sales Analysis",
  projectDescription: "Comprehensive analysis of Q1 sales performance with insights for strategic planning",
  targetAudience: "Executive team and board of directors",
  businessGoals: [
    "Identify top performing sales channels",
    "Understand customer satisfaction drivers", 
    "Optimize revenue growth strategies"
  ],
  keyQuestions: [
    "What factors drive revenue growth?",
    "How does customer satisfaction correlate with retention?",
    "Which months show the strongest performance?"
  ],
  factors: [
    {
      id: "factor-1",
      name: "Market Seasonality",
      description: "Impact of seasonal trends on sales performance",
      weight: 8,
      category: "external"
    },
    {
      id: "factor-2", 
      name: "Customer Acquisition Cost",
      description: "Efficiency of customer acquisition strategies",
      weight: 7,
      category: "operational"
    }
  ],
  presentationStyle: "executive",
  slideCount: 12,
  timeframe: "30 days",
  dataDescription: "Monthly sales data including revenue, growth rates, customer counts and satisfaction scores",
  expectedInsights: [
    "Revenue growth trends and patterns",
    "Customer satisfaction correlation analysis",
    "Seasonal performance variations"
  ],
  customRequirements: "Include executive summary with key recommendations and actionable insights",
  includeExecutiveSummary: true,
  includeAppendix: true,
  includeDataSources: true,
  templatePreference: "mckinsey"
};

class SystemTester {
  constructor() {
    this.results = {
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
    this.sessionData = {};
    this.testResults = [];
    this.currentUser = null;
    this.testDraft = null;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(name, testFn) {
    this.log(`Running test: ${name}`);
    this.results.summary.total++;
    
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.log(`✅ PASSED: ${name} (${duration}ms)`, 'success');
      this.results.tests.push({ name, status: 'passed', duration });
      this.results.summary.passed++;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
      this.results.tests.push({ name, status: 'failed', duration, error: error.message });
      this.results.summary.failed++;
      
      if (TEST_CONFIG.verbose) {
        console.error(error);
      }
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      timeout: TEST_CONFIG.timeout,
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  }

  // ==========================================
  // CORE SYSTEM TESTS
  // ==========================================

  async testHealthCheck() {
    const response = await this.makeRequest('/api/health');
    if (typeof response === 'object' && response.status === 'ok') {
      return true;
    }
    throw new Error('Health check failed');
  }

  async testDataUpload() {
    // Create a temporary CSV file
    const csvPath = path.join(__dirname, 'test-data.csv');
    fs.writeFileSync(csvPath, SAMPLE_CSV_DATA);

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(csvPath));
      form.append('description', 'Test sales data upload');

      const response = await this.makeRequest('/api/upload', {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });

      this.sessionData.uploadId = response.id || response.fileId;
      this.sessionData.uploadData = response;
      
      if (!this.sessionData.uploadId) {
        throw new Error('No upload ID returned');
      }

      return response;
    } finally {
      // Clean up temp file
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  }

  async testOpenAIAnalysis() {
    if (!this.sessionData.uploadId) {
      throw new Error('No upload data available - run data upload test first');
    }

    const analysisRequest = {
      uploadId: this.sessionData.uploadId,
      userContext: TEST_FORM_DATA.dataDescription,
      userGoals: TEST_FORM_DATA.businessGoals,
      factors: TEST_FORM_DATA.factors
    };

    const response = await this.makeRequest('/api/openai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysisRequest)
    });

    this.sessionData.analysisResult = response;

    // Validate response structure
    if (!response.insights || !response.chartRecommendations) {
      throw new Error('Invalid analysis response structure');
    }

    if (response.chartRecommendations.length === 0) {
      throw new Error('No chart recommendations generated');
    }

    return response;
  }

  async testChartGeneration() {
    if (!this.sessionData.analysisResult) {
      throw new Error('No analysis result available - run OpenAI analysis test first');
    }

    const chartRequest = {
      analysisResult: this.sessionData.analysisResult,
      designPreferences: {
        style: TEST_FORM_DATA.presentationStyle,
        templatePreference: TEST_FORM_DATA.templatePreference
      }
    };

    const response = await this.makeRequest('/api/openai/chart-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chartRequest)
    });

    this.sessionData.chartConfigs = response;

    // Validate chart configurations
    if (!Array.isArray(response.charts) || response.charts.length === 0) {
      throw new Error('No charts generated');
    }

    // Check each chart has required properties
    for (const chart of response.charts) {
      if (!chart.type || !chart.data || !chart.config) {
        throw new Error('Invalid chart configuration structure');
      }
    }

    return response;
  }

  async testSlideGeneration() {
    if (!this.sessionData.chartConfigs) {
      throw new Error('No chart configurations available');
    }

    const slideRequest = {
      formData: TEST_FORM_DATA,
      analysisResult: this.sessionData.analysisResult,
      chartConfigs: this.sessionData.chartConfigs
    };

    const response = await this.makeRequest('/api/openai/slide-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slideRequest)
    });

    this.sessionData.presentationData = response;

    // Validate slide structure
    if (!response.slides || !Array.isArray(response.slides)) {
      throw new Error('Invalid presentation structure');
    }

    if (response.slides.length < 3) {
      throw new Error('Insufficient slides generated');
    }

    // Check for required slide types
    const slideTypes = response.slides.map(s => s.layout);
    if (!slideTypes.includes('title')) {
      throw new Error('Missing title slide');
    }

    return response;
  }

  async testQAValidation() {
    if (!this.sessionData.presentationData) {
      throw new Error('No presentation data available');
    }

    const qaRequest = {
      presentationData: this.sessionData.presentationData,
      originalData: SAMPLE_CSV_DATA,
      formData: TEST_FORM_DATA
    };

    const response = await this.makeRequest('/api/openai/slide-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qaRequest)
    });

    this.sessionData.qaResults = response;

    // Validate QA results
    if (!response.overallScore || response.overallScore < 70) {
      this.log(`⚠️ QA score is low: ${response.overallScore}`, 'warn');
    }

    if (response.criticalIssues && response.criticalIssues.length > 0) {
      this.log(`⚠️ Critical QA issues found: ${response.criticalIssues.length}`, 'warn');
    }

    return response;
  }

  async testExportGeneration() {
    if (!this.sessionData.presentationData) {
      throw new Error('No presentation data available');
    }

    const exportRequest = {
      presentationData: this.sessionData.presentationData,
      format: 'pptx',
      size: '16:9'
    };

    const response = await this.makeRequest('/api/presentations/test/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportRequest)
    });

    // Check if we got binary data (PowerPoint file)
    if (typeof response === 'string' && response.length < 100) {
      throw new Error('Export response too small - likely an error');
    }

    this.sessionData.exportResult = response;
    return response;
  }

  async testFeedbackLoop() {
    const feedbackData = {
      sessionId: 'test-session-' + Date.now(),
      userModifications: [
        {
          chartId: 'chart-1',
          modificationType: 'style_change',
          before: { color: 'blue' },
          after: { color: 'green' },
          timestamp: new Date()
        }
      ],
      timeSpent: 300, // 5 minutes
      finalAction: 'exported',
      userRating: 4,
      comments: 'Great analysis, would like more detailed insights'
    };

    const response = await this.makeRequest('/api/feedback/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });

    if (!response.id) {
      throw new Error('Feedback not recorded properly');
    }

    return response;
  }

  // ==========================================
  // OPENAI INTEGRATION TESTS
  // ==========================================

  async testOpenAIConnectivity() {
    const testRequest = {
      prompt: "Test prompt for system validation",
      model: "gpt-4-turbo-preview",
      maxTokens: 100
    };

    const response = await this.makeRequest('/api/openai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });

    if (!response.response || response.response.length < 10) {
      throw new Error('OpenAI test response invalid');
    }

    return response;
  }

  async testStructuredOutputs() {
    const structuredRequest = {
      data: SAMPLE_CSV_DATA,
      schema: 'chartRecommendation'
    };

    const response = await this.makeRequest('/api/openai/structured-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(structuredRequest)
    });

    // Should return valid structured data matching our Zod schema
    if (!response.recommendations || !Array.isArray(response.recommendations)) {
      throw new Error('Structured output test failed - invalid format');
    }

    return response;
  }

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  async testCompleteFlow() {
    this.log('Testing complete end-to-end flow...', 'info');
    
    // Run all tests in sequence
    await this.testHealthCheck();
    await this.testDataUpload();
    await this.testOpenAIAnalysis();
    await this.testChartGeneration();
    await this.testSlideGeneration();
    await this.testQAValidation();
    await this.testExportGeneration();
    await this.testFeedbackLoop();
    
    this.log('Complete flow test finished successfully!', 'success');
  }

  // ==========================================
  // ANALYSIS AND REPORTING
  // ==========================================

  async analyzeResultsWithOpenAI() {
    this.log('Analyzing test results with OpenAI...', 'info');

    const analysisRequest = {
      testResults: this.results,
      sessionData: this.sessionData,
      systemMetrics: {
        totalTestTime: this.results.tests.reduce((sum, test) => sum + (test.duration || 0), 0),
        successRate: (this.results.summary.passed / this.results.summary.total) * 100,
        failedTests: this.results.tests.filter(test => test.status === 'failed')
      }
    };

    try {
      const response = await this.makeRequest('/api/openai/analyze-system-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisRequest)
      });

      this.log('🤖 OpenAI Analysis Results:', 'info');
      console.log(JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      this.log(`Failed to analyze results with OpenAI: ${error.message}`, 'warn');
      return null;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      successRate: (this.results.summary.passed / this.results.summary.total) * 100,
      totalTime: this.results.tests.reduce((sum, test) => sum + (test.duration || 0), 0),
      tests: this.results.tests,
      sessionData: this.sessionData
    };

    // Save report to file
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Test report saved to: ${reportPath}`, 'info');

    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⏭️ Skipped: ${this.results.summary.skipped}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.summary.passed / this.results.summary.total) * 100)}%`);
    console.log(`⏱️ Total Time: ${report.totalTime}ms`);
    console.log('='.repeat(60));

    if (this.results.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    return report;
  }

  // ==========================================
  // MAIN EXECUTION
  // ==========================================

  async run() {
    this.log('🚀 Starting comprehensive system test...', 'info');
    
    try {
      // Core functionality tests
      await this.runTest('Health Check', () => this.testHealthCheck());
      await this.runTest('Data Upload', () => this.testDataUpload());
      await this.runTest('OpenAI Connectivity', () => this.testOpenAIConnectivity());
      await this.runTest('Structured Outputs', () => this.testStructuredOutputs());
      await this.runTest('OpenAI Analysis', () => this.testOpenAIAnalysis());
      await this.runTest('Chart Generation', () => this.testChartGeneration());
      await this.runTest('Slide Generation', () => this.testSlideGeneration());
      await this.runTest('QA Validation', () => this.testQAValidation());
      await this.runTest('Export Generation', () => this.testExportGeneration());
      await this.runTest('Feedback Loop', () => this.testFeedbackLoop());

      // Integration test
      await this.runTest('Complete Flow Integration', () => this.testCompleteFlow());

      // Generate reports
      const report = this.generateReport();
      const aiAnalysis = await this.analyzeResultsWithOpenAI();

      this.log('✅ All tests completed!', 'success');
      
      return { report, aiAnalysis };

    } catch (error) {
      this.log(`❌ Test execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testDatabaseConnection() {
    console.log('📊 Testing Database Connection...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      this.addResult('Database Connection', 'PASS', 'Successfully connected to Supabase');
    } catch (error) {
      this.addResult('Database Connection', 'FAIL', error.message);
    }
  }

  async testUserRegistration() {
    console.log('👤 Testing User Registration...');
    
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testName = 'Test User';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
            company_name: 'Test Company'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        this.currentUser = data.user;
        this.addResult('User Registration', 'PASS', `User created: ${data.user.email}`);
      } else {
        throw new Error('No user data returned');
      }
    } catch (error) {
      this.addResult('User Registration', 'FAIL', error.message);
    }
  }

  async testUserLogin() {
    console.log('🔐 Testing User Login...');
    
    if (!this.currentUser) {
      this.addResult('User Login', 'SKIP', 'No user to test login with');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.currentUser.email,
        password: 'TestPassword123!'
      });
      
      if (error) throw error;
      
      if (data.user) {
        this.addResult('User Login', 'PASS', 'Successfully logged in');
      } else {
        throw new Error('No user data returned');
      }
    } catch (error) {
      this.addResult('User Login', 'FAIL', error.message);
    }
  }

  async testUserProfile() {
    console.log('👤 Testing User Profile...');
    
    if (!this.currentUser) {
      this.addResult('User Profile', 'SKIP', 'No user to test profile with');
      return;
    }
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();
      
      if (existingProfile) {
        this.addResult('User Profile', 'PASS', 'Profile exists and accessible');
      } else {
        // Create profile
        const profileData = {
          id: this.currentUser.id,
          email: this.currentUser.email,
          companyName: 'Test Company',
          brandColors: {
            primary: '#3b82f6',
            secondary: '#10b981'
          },
          dataPreferences: {
            chartStyles: ['modern', 'clean'],
            colorSchemes: ['blue', 'green'],
            narrativeStyle: 'professional'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (error) throw error;
        
        this.addResult('User Profile', 'PASS', 'Profile created successfully');
      }
    } catch (error) {
      this.addResult('User Profile', 'FAIL', error.message);
    }
  }

  async testDeckCreation() {
    console.log('📄 Testing Deck Creation...');
    
    if (!this.currentUser) {
      this.addResult('Deck Creation', 'SKIP', 'No user to test deck creation with');
      return;
    }
    
    try {
      const draftData = {
        id: `test-draft-${Date.now()}`,
        user_id: this.currentUser.id,
        title: 'Test Presentation',
        description: 'A test presentation for system validation',
        slides: [
          {
            id: crypto.randomUUID(),
            type: 'title',
            title: 'Test Title Slide',
            content: 'Welcome to our test presentation',
            order: 0
          },
          {
            id: crypto.randomUUID(),
            type: 'content',
            title: 'Test Content Slide',
            content: 'This is a test content slide',
            order: 1
          }
        ],
        status: 'draft',
        data_sources: [],
        narrative_config: {
          tone: 'professional',
          audience: 'executive',
          keyMessages: ['Test message 1', 'Test message 2'],
          callToAction: 'Test CTA'
        },
        ai_feedback: {
          suggestions: [],
          improvements: [],
          confidence: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_edited_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('presentations')
        .insert(draftData)
        .select()
        .single();
      
      if (error) throw error;
      
      this.testDraft = data;
      this.addResult('Deck Creation', 'PASS', `Draft created: ${data.title}`);
    } catch (error) {
      this.addResult('Deck Creation', 'FAIL', error.message);
    }
  }

  async testDeckPersistence() {
    console.log('💾 Testing Deck Persistence...');
    
    if (!this.testDraft) {
      this.addResult('Deck Persistence', 'SKIP', 'No draft to test persistence with');
      return;
    }
    
    try {
      // Test updating the draft
      const updatedData = {
        ...this.testDraft,
        title: 'Updated Test Presentation',
        updated_at: new Date().toISOString(),
        last_edited_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('presentations')
        .update(updatedData)
        .eq('id', this.testDraft.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Test loading the draft
      const { data: loadedDraft, error: loadError } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', this.testDraft.id)
        .single();
      
      if (loadError) throw loadError;
      
      if (loadedDraft.title === 'Updated Test Presentation') {
        this.addResult('Deck Persistence', 'PASS', 'Draft updated and loaded successfully');
      } else {
        throw new Error('Draft not updated correctly');
      }
    } catch (error) {
      this.addResult('Deck Persistence', 'FAIL', error.message);
    }
  }

  async testAIFeedback() {
    console.log('🤖 Testing AI Feedback...');
    
    if (!this.testDraft) {
      this.addResult('AI Feedback', 'SKIP', 'No draft to test AI feedback with');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3002/api/openai/content-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: this.testDraft.slides,
          narrativeConfig: this.testDraft.narrative_config,
          businessContext: 'executive'
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.addResult('AI Feedback', 'PASS', 'AI feedback generated successfully');
      } else {
        throw new Error(result.error || 'AI feedback failed');
      }
    } catch (error) {
      this.addResult('AI Feedback', 'FAIL', error.message);
    }
  }

  async testExportFunctionality() {
    console.log('📤 Testing Export Functionality...');
    
    if (!this.testDraft) {
      this.addResult('Export Functionality', 'SKIP', 'No draft to test export with');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3002/api/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          draftId: this.testDraft.id,
          format: 'pdf',
          size: '16:9',
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981',
            backgroundColor: '#ffffff'
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.addResult('Export Functionality', 'PASS', 'Export endpoint responding');
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      this.addResult('Export Functionality', 'FAIL', error.message);
    }
  }

  addResult(testName, status, message) {
    this.testResults.push({ testName, status, message });
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${emoji} ${testName}: ${status} - ${message}`);
  }

  printResults() {
    console.log('\n📋 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
    
    this.testResults.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${emoji} ${result.testName}: ${result.status}`);
      if (result.status === 'FAIL') {
        console.log(`   └─ ${result.message}`);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! The system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      if (this.testDraft) {
        await supabase
          .from('presentations')
          .delete()
          .eq('id', this.testDraft.id);
      }
      
      if (this.currentUser) {
        await supabase.auth.admin.deleteUser(this.currentUser.id);
      }
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.run()
    .then(results => {
      process.exit(results.report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = SystemTester;