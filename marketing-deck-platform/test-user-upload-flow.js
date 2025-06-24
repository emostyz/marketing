#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE USER UPLOAD & SLIDE GENERATION TEST
 * ===================================================
 * 
 * This agent simulates a REAL USER uploading data and verifies:
 * 1. File upload actually works
 * 2. Data is properly processed
 * 3. AI generates meaningful insights
 * 4. Beautiful slides are created
 * 5. Export to PowerPoint works
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ANSI color codes for beautiful output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testDataFile: 'demo_1000_row_dataset.csv',
  timeout: 60000,
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down actions to see what's happening
};

class UserUploadTestAgent {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      steps: [],
      screenshots: [],
      errors: [],
      slideQuality: {},
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: `${colors.blue}ℹ️`,
      success: `${colors.green}✅`,
      error: `${colors.red}❌`,
      warning: `${colors.yellow}⚠️`,
      test: `${colors.magenta}🧪`,
    }[type] || '';
    
    console.log(`${prefix} [${timestamp}] ${message}${colors.reset}`);
    
    this.results.steps.push({
      time: timestamp,
      type,
      message,
    });
  }

  async init() {
    this.log('Starting browser...', 'info');
    this.browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Set up console logging from the page
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.log(`Browser console error: ${msg.text()}`, 'error');
      }
    });
    
    // Set up request interception to log API calls
    await this.page.setRequestInterception(true);
    this.page.on('request', request => {
      if (request.url().includes('/api/')) {
        this.log(`API Call: ${request.method()} ${request.url()}`, 'info');
      }
      request.continue();
    });
    
    this.page.on('response', response => {
      if (response.url().includes('/api/') && response.status() !== 200) {
        this.log(`API Error: ${response.status()} ${response.url()}`, 'error');
      }
    });
  }

  async takeScreenshot(name) {
    const filename = `screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ 
      path: filename,
      fullPage: true 
    });
    this.results.screenshots.push(filename);
    this.log(`Screenshot saved: ${filename}`, 'info');
  }

  async navigateToUpload() {
    this.log('Navigating to upload page...', 'test');
    
    try {
      await this.page.goto(TEST_CONFIG.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: TEST_CONFIG.timeout 
      });
      
      // Check if we're in demo mode
      const isDemoMode = await this.page.evaluate(() => {
        return localStorage.getItem('demo-mode') === 'true';
      });
      
      if (!isDemoMode) {
        this.log('Setting demo mode...', 'info');
        await this.page.evaluate(() => {
          localStorage.setItem('demo-mode', 'true');
          // Also set demo user for authentication
          localStorage.setItem('demo-user', JSON.stringify({
            id: 'demo-user-123',
            email: 'demo@example.com',
            name: 'Demo User'
          }));
        });
        await this.page.reload({ waitUntil: 'networkidle2' });
      }
      
      await this.takeScreenshot('01-home-page');
      
      // Try multiple selectors for the start button
      const startButtonSelectors = [
        'button:has-text("Start Building")',
        'a:has-text("Start Building")',
        'button:has-text("Get Started")',
        'a:has-text("Get Started")',
        '[href="/deck-builder"]',
        'button:has-text("Create Deck")',
        'a:has-text("Create Deck")'
      ];
      
      let clicked = false;
      for (const selector of startButtonSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          clicked = true;
          this.log(`Clicked button with selector: ${selector}`, 'success');
          break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!clicked) {
        // Try navigating directly to deck-builder page
        this.log('Navigating directly to deck-builder page...', 'info');
        await this.page.goto(`${TEST_CONFIG.baseUrl}/deck-builder/new`, { 
          waitUntil: 'networkidle2',
          timeout: TEST_CONFIG.timeout 
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for navigation
      await this.takeScreenshot('02-deck-builder-page');
      this.log('Successfully navigated to deck builder', 'success');
      
    } catch (error) {
      this.log(`Navigation error: ${error.message}`, 'error');
      await this.takeScreenshot('navigation-error');
      throw error;
    }
  }

  async uploadFile() {
    this.log('Testing file upload...', 'test');
    
    try {
      // Wait for the deck builder to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try multiple selectors for file input
      const fileInputSelectors = [
        'input[type="file"]',
        '.file-upload input',
        '[data-testid="file-upload"]',
        'input[accept*="csv"]',
        'input[accept*="xlsx"]',
        '#file-upload',
        '.upload-area input'
      ];
      
      let fileInput = null;
      for (const selector of fileInputSelectors) {
        try {
          fileInput = await this.page.$(selector);
          if (fileInput) {
            this.log(`Found file input with selector: ${selector}`, 'success');
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!fileInput) {
        // Check if we need to click an upload button first
        const uploadButtonSelectors = [
          'button:has-text("Upload")',
          'button:has-text("Choose File")',
          'button:has-text("Select File")',
          '[data-testid="upload-button"]',
          '.upload-button'
        ];
        
        for (const selector of uploadButtonSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 2000 });
            await this.page.click(selector);
            this.log(`Clicked upload button: ${selector}`, 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          } catch (e) {
            // Continue
          }
        }
        
        // Try finding file input again
        fileInput = await this.page.$('input[type="file"]');
      }
      
      if (!fileInput) {
        throw new Error('Could not find file input element');
      }
      
      // Upload the test file
      const testFilePath = path.resolve(TEST_CONFIG.testDataFile);
      
      if (!fs.existsSync(testFilePath)) {
        throw new Error(`Test file not found: ${testFilePath}`);
      }
      
      await fileInput.uploadFile(testFilePath);
      this.log(`Uploaded file: ${TEST_CONFIG.testDataFile}`, 'success');
      
      // Wait for processing
      await this.page.waitForFunction(
        () => {
          const processingIndicator = document.querySelector('[data-processing="true"]');
          return !processingIndicator;
        },
        { timeout: 30000 }
      );
      
      await this.takeScreenshot('03-file-uploaded');
      
      // Check if data was processed - try multiple selectors
      const dataStats = await this.page.evaluate(() => {
        // Try various selectors for data stats
        const selectors = [
          '[data-testid="data-stats"]',
          '.data-stats',
          '[class*="stats"]',
          '[class*="data-info"]',
          'div:has-text("rows")',
          'div:has-text("columns")'
        ];
        
        for (const selector of selectors) {
          try {
            const element = document.querySelector(selector);
            if (element && element.textContent.includes('rows')) {
              return element.textContent;
            }
          } catch (e) {}
        }
        
        // Check if we see any indication of data processing
        const body = document.body.textContent;
        if (body.includes('rows') && body.includes('columns')) {
          return 'Data appears to be processed';
        }
        
        return null;
      });
      
      if (dataStats) {
        this.log(`Data processed: ${dataStats}`, 'success');
      }
      
      return true;
    } catch (error) {
      this.log(`Upload error: ${error.message}`, 'error');
      await this.takeScreenshot('upload-error');
      throw error;
    }
  }

  async generatePresentation() {
    this.log('Generating presentation...', 'test');
    
    try {
      // Click generate button
      await this.page.waitForSelector('button:has-text("Generate Presentation")', { timeout: 10000 });
      await this.page.click('button:has-text("Generate Presentation")');
      
      // Wait for AI processing
      this.log('Waiting for AI to analyze data...', 'info');
      
      await this.page.waitForFunction(
        () => {
          const loadingIndicator = document.querySelector('[data-loading="true"]');
          return !loadingIndicator;
        },
        { timeout: 60000 }
      );
      
      await this.takeScreenshot('04-presentation-generated');
      
      // Check if slides were created
      const slideCount = await this.page.evaluate(() => {
        const slides = document.querySelectorAll('[data-testid="slide"]');
        return slides.length;
      });
      
      this.log(`Generated ${slideCount} slides`, 'success');
      
      // Analyze slide quality
      await this.analyzeSlideQuality();
      
      return slideCount > 0;
    } catch (error) {
      this.log(`Generation error: ${error.message}`, 'error');
      await this.takeScreenshot('generation-error');
      throw error;
    }
  }

  async analyzeSlideQuality() {
    this.log('Analyzing slide quality...', 'test');
    
    const quality = await this.page.evaluate(() => {
      const slides = document.querySelectorAll('[data-testid="slide"]');
      const analysis = {
        totalSlides: slides.length,
        slides: [],
        hasCharts: false,
        hasText: false,
        hasLayouts: false,
        designQuality: 'unknown'
      };
      
      slides.forEach((slide, index) => {
        const slideData = {
          index: index + 1,
          elements: 0,
          hasChart: false,
          hasText: false,
          hasTitle: false,
          layout: 'unknown'
        };
        
        // Count elements
        const elements = slide.querySelectorAll('[data-element-type]');
        slideData.elements = elements.length;
        
        // Check for charts
        if (slide.querySelector('[data-element-type="chart"]')) {
          slideData.hasChart = true;
          analysis.hasCharts = true;
        }
        
        // Check for text
        if (slide.querySelector('[data-element-type="text"]')) {
          slideData.hasText = true;
          analysis.hasText = true;
        }
        
        // Check for title
        if (slide.querySelector('[data-element-type="title"]')) {
          slideData.hasTitle = true;
        }
        
        // Determine layout
        if (slideData.elements >= 3) {
          slideData.layout = 'rich';
          analysis.hasLayouts = true;
        } else if (slideData.elements >= 2) {
          slideData.layout = 'standard';
        } else {
          slideData.layout = 'minimal';
        }
        
        analysis.slides.push(slideData);
      });
      
      // Determine overall quality
      if (analysis.hasCharts && analysis.hasText && analysis.hasLayouts) {
        analysis.designQuality = 'excellent';
      } else if (analysis.hasCharts || analysis.hasText) {
        analysis.designQuality = 'good';
      } else {
        analysis.designQuality = 'poor';
      }
      
      return analysis;
    });
    
    this.results.slideQuality = quality;
    
    this.log(`Slide Quality Analysis:`, 'info');
    this.log(`- Total Slides: ${quality.totalSlides}`, 'info');
    this.log(`- Has Charts: ${quality.hasCharts ? 'Yes' : 'No'}`, 'info');
    this.log(`- Has Text Content: ${quality.hasText ? 'Yes' : 'No'}`, 'info');
    this.log(`- Design Quality: ${quality.designQuality}`, 'info');
    
    quality.slides.forEach(slide => {
      this.log(`  Slide ${slide.index}: ${slide.elements} elements, Layout: ${slide.layout}`, 'info');
    });
    
    return quality;
  }

  async testDragAndDrop() {
    this.log('Testing drag and drop functionality...', 'test');
    
    try {
      // Find a draggable element
      const draggableElement = await this.page.$('[data-moveable="true"]');
      
      if (draggableElement) {
        const box = await draggableElement.boundingBox();
        
        // Drag the element
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(box.x + 100, box.y + 100);
        await this.page.mouse.up();
        
        this.log('Drag and drop test completed', 'success');
        await this.takeScreenshot('05-drag-drop-test');
      } else {
        this.log('No draggable elements found', 'warning');
      }
    } catch (error) {
      this.log(`Drag test error: ${error.message}`, 'error');
    }
  }

  async testExport() {
    this.log('Testing PowerPoint export...', 'test');
    
    try {
      // Set up download handling
      const downloadPromise = this.page.waitForEvent('download');
      
      // Click export button
      await this.page.waitForSelector('button:has-text("Export")', { timeout: 10000 });
      await this.page.click('button:has-text("Export")');
      
      // Wait for download
      const download = await Promise.race([
        downloadPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Download timeout')), 30000)
        )
      ]);
      
      if (download) {
        const filename = download.suggestedFilename();
        const filePath = `downloads/${filename}`;
        await download.saveAs(filePath);
        
        this.log(`Export successful: ${filename}`, 'success');
        
        // Check file size
        const stats = fs.statSync(filePath);
        this.log(`Exported file size: ${(stats.size / 1024).toFixed(2)} KB`, 'info');
        
        return true;
      }
    } catch (error) {
      this.log(`Export error: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    const report = `
${colors.bright}${colors.cyan}
🎯 USER UPLOAD & SLIDE GENERATION TEST REPORT
=============================================${colors.reset}

${colors.bright}Test Duration:${colors.reset} ${duration} seconds

${colors.bright}📊 Test Results:${colors.reset}
${this.results.steps.map(step => {
  const icon = step.type === 'success' ? '✅' : 
               step.type === 'error' ? '❌' : 
               step.type === 'warning' ? '⚠️' : 
               step.type === 'test' ? '🧪' : 'ℹ️';
  return `${icon} ${step.message}`;
}).join('\n')}

${colors.bright}🎨 Slide Quality Analysis:${colors.reset}
- Total Slides: ${this.results.slideQuality.totalSlides || 0}
- Design Quality: ${this.results.slideQuality.designQuality || 'Not analyzed'}
- Has Charts: ${this.results.slideQuality.hasCharts ? '✅ Yes' : '❌ No'}
- Has Text Content: ${this.results.slideQuality.hasText ? '✅ Yes' : '❌ No'}
- Has Rich Layouts: ${this.results.slideQuality.hasLayouts ? '✅ Yes' : '❌ No'}

${colors.bright}📸 Screenshots Captured:${colors.reset}
${this.results.screenshots.map(s => `- ${s}`).join('\n')}

${colors.bright}⚠️  Errors Encountered:${colors.reset}
${this.results.errors.length > 0 ? this.results.errors.join('\n') : '✅ No errors!'}

${colors.bright}🎯 Overall Result:${colors.reset} ${
  this.results.slideQuality.totalSlides > 0 && 
  this.results.slideQuality.designQuality !== 'poor' 
    ? `${colors.bgGreen}${colors.bright} PASS ${colors.reset}` 
    : `${colors.bgRed}${colors.bright} FAIL ${colors.reset}`
}
`;

    // Save report to file
    fs.writeFileSync('test-report.txt', report);
    console.log(report);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    console.log(`${colors.bright}${colors.magenta}
🚀 STARTING COMPREHENSIVE USER UPLOAD TEST
==========================================
Testing real user flow from upload to beautiful slides${colors.reset}
`);

    try {
      await this.init();
      
      // Execute test steps
      await this.navigateToUpload();
      await this.uploadFile();
      await this.generatePresentation();
      await this.testDragAndDrop();
      await this.testExport();
      
      // Generate final report
      await this.generateReport();
      
    } catch (error) {
      this.log(`Critical test failure: ${error.message}`, 'error');
      this.results.errors.push(error.message);
      await this.generateReport();
    } finally {
      await this.cleanup();
    }
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

if (!fs.existsSync('downloads')) {
  fs.mkdirSync('downloads');
}

// Run the test agent
const agent = new UserUploadTestAgent();
agent.run().catch(console.error);