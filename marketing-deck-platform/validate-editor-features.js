// Comprehensive validation script for all editor features
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// ANSI color codes for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    step: `${colors.magenta}▸${colors.reset}`
  };
  console.log(`${prefix[type] || prefix.info} ${colors.bright}[${timestamp}]${colors.reset} ${message}`);
}

// Feature test functions
const testFeatures = {
  // Test 1: Design System
  async testDesignSystem(page) {
    log('Testing Design System...', 'step');
    
    // Navigate to test page
    await page.goto('http://localhost:3000/test-editor', { waitUntil: 'networkidle0' });
    
    // Check if design system components are loaded
    const designSystem = await page.evaluate(() => {
      const hasColors = document.querySelector('[data-testid="color-palette"]') !== null;
      const hasFonts = document.querySelector('[data-testid="font-selector"]') !== null;
      const hasShapes = document.querySelector('[data-testid="shape-library"]') !== null;
      
      return { hasColors, hasFonts, hasShapes };
    });
    
    if (designSystem.hasColors && designSystem.hasFonts && designSystem.hasShapes) {
      log('Design System components loaded successfully', 'success');
      return true;
    } else {
      log('Design System components missing', 'error');
      return false;
    }
  },

  // Test 2: Template Selection
  async testTemplateSelection(page) {
    log('Testing Template Selection...', 'step');
    
    // Click template selector
    await page.click('[data-testid="template-selector"]');
    await page.waitForTimeout(1000);
    
    // Check templates are displayed
    const templates = await page.$$('[data-testid="template-card"]');
    
    if (templates.length > 0) {
      log(`Found ${templates.length} templates`, 'success');
      
      // Try selecting a template
      await templates[0].click();
      await page.waitForTimeout(1000);
      
      const templateApplied = await page.evaluate(() => {
        return document.querySelector('[data-testid="active-template"]') !== null;
      });
      
      if (templateApplied) {
        log('Template selection works correctly', 'success');
        return true;
      }
    }
    
    log('Template selection failed', 'error');
    return false;
  },

  // Test 3: Elements Library
  async testElementsLibrary(page) {
    log('Testing Elements Library...', 'step');
    
    // Open elements panel
    await page.click('[data-testid="elements-library-toggle"]');
    await page.waitForTimeout(1000);
    
    // Check element categories
    const elementCategories = await page.evaluate(() => {
      const categories = ['text', 'shapes', 'charts', 'icons', 'data'];
      return categories.map(cat => {
        const element = document.querySelector(`[data-element-category="${cat}"]`);
        return { category: cat, exists: element !== null };
      });
    });
    
    const allCategoriesExist = elementCategories.every(cat => cat.exists);
    
    if (allCategoriesExist) {
      log('All element categories loaded', 'success');
      
      // Try dragging an element
      const textElement = await page.$('[data-element-type="heading"]');
      const canvas = await page.$('[data-testid="editor-canvas"]');
      
      if (textElement && canvas) {
        const box = await textElement.boundingBox();
        const canvasBox = await canvas.boundingBox();
        
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(1000);
        
        const elementAdded = await page.evaluate(() => {
          return document.querySelector('[data-movable-element]') !== null;
        });
        
        if (elementAdded) {
          log('Element drag and drop works', 'success');
          return true;
        }
      }
    }
    
    log('Elements Library test failed', 'error');
    return false;
  },

  // Test 4: Chart Customization
  async testChartCustomization(page) {
    log('Testing Chart Customization...', 'step');
    
    // Add a chart element
    await page.click('[data-element-type="bar-chart"]');
    await page.waitForTimeout(1000);
    
    // Open chart customizer
    const chartElement = await page.$('[data-chart-element]');
    if (chartElement) {
      await chartElement.click();
      await page.waitForTimeout(500);
      
      // Check customization options
      const customizationOptions = await page.evaluate(() => {
        const hasDataInput = document.querySelector('[data-testid="chart-data-input"]') !== null;
        const hasColorPicker = document.querySelector('[data-testid="chart-color-picker"]') !== null;
        const hasTypeSelector = document.querySelector('[data-testid="chart-type-selector"]') !== null;
        
        return { hasDataInput, hasColorPicker, hasTypeSelector };
      });
      
      if (customizationOptions.hasDataInput && customizationOptions.hasColorPicker && customizationOptions.hasTypeSelector) {
        log('Chart customization panel loaded', 'success');
        
        // Try changing chart type
        await page.click('[data-testid="chart-type-selector"]');
        await page.click('[data-chart-type="line"]');
        await page.waitForTimeout(1000);
        
        const chartTypeChanged = await page.evaluate(() => {
          const chart = document.querySelector('[data-chart-element]');
          return chart && chart.getAttribute('data-chart-type') === 'line';
        });
        
        if (chartTypeChanged) {
          log('Chart customization works correctly', 'success');
          return true;
        }
      }
    }
    
    log('Chart customization test failed', 'error');
    return false;
  },

  // Test 5: Customization Panels
  async testCustomizationPanels(page) {
    log('Testing Customization Panels...', 'step');
    
    // Select an element
    const element = await page.$('[data-movable-element]');
    if (!element) {
      log('No element to customize', 'warning');
      return false;
    }
    
    await element.click();
    await page.waitForTimeout(500);
    
    // Check all customization panels
    const panels = await page.evaluate(() => {
      const fontPanel = document.querySelector('[data-testid="font-customization"]');
      const colorPanel = document.querySelector('[data-testid="color-customization"]');
      const alignmentPanel = document.querySelector('[data-testid="alignment-customization"]');
      const effectsPanel = document.querySelector('[data-testid="effects-customization"]');
      
      return {
        hasFont: fontPanel !== null,
        hasColor: colorPanel !== null,
        hasAlignment: alignmentPanel !== null,
        hasEffects: effectsPanel !== null
      };
    });
    
    const allPanelsExist = Object.values(panels).every(exists => exists);
    
    if (allPanelsExist) {
      log('All customization panels available', 'success');
      
      // Try changing font
      await page.click('[data-testid="font-family-selector"]');
      await page.click('[data-font-family="Inter"]');
      await page.waitForTimeout(500);
      
      const fontChanged = await page.evaluate(() => {
        const element = document.querySelector('[data-movable-element]');
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.fontFamily.includes('Inter');
      });
      
      if (fontChanged) {
        log('Customization panels work correctly', 'success');
        return true;
      }
    }
    
    log('Customization panels test failed', 'error');
    return false;
  },

  // Test 6: Supabase Persistence
  async testSupabasePersistence(page) {
    log('Testing Supabase Persistence...', 'step');
    
    // Click save button
    await page.click('[data-testid="save-presentation"]');
    await page.waitForTimeout(2000);
    
    // Check for success message
    const saveSuccess = await page.evaluate(() => {
      const toast = document.querySelector('.toast-success');
      return toast && toast.textContent.includes('saved');
    });
    
    if (saveSuccess) {
      log('Presentation saved successfully', 'success');
      
      // Reload page and check if data persists
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);
      
      const dataLoaded = await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-movable-element]');
        return elements.length > 0;
      });
      
      if (dataLoaded) {
        log('Data persistence works correctly', 'success');
        return true;
      }
    }
    
    log('Supabase persistence test failed', 'error');
    return false;
  }
};

// Main validation function
async function validateAllFeatures() {
  console.log(`\n${colors.cyan}${colors.bright}🎨 Marketing Deck Platform - Editor Features Validation${colors.reset}\n`);
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        log(`Browser console error: ${msg.text()}`, 'error');
      }
    });
    
    // Results tracking
    const results = {
      designSystem: false,
      templateSelection: false,
      elementsLibrary: false,
      chartCustomization: false,
      customizationPanels: false,
      supabasePersistence: false
    };
    
    // Run all tests
    results.designSystem = await testFeatures.testDesignSystem(page);
    results.templateSelection = await testFeatures.testTemplateSelection(page);
    results.elementsLibrary = await testFeatures.testElementsLibrary(page);
    results.chartCustomization = await testFeatures.testChartCustomization(page);
    results.customizationPanels = await testFeatures.testCustomizationPanels(page);
    results.supabasePersistence = await testFeatures.testSupabasePersistence(page);
    
    // Generate report
    console.log(`\n${colors.bright}${colors.yellow}📊 Validation Results:${colors.reset}\n`);
    
    let passedTests = 0;
    const totalTests = Object.keys(results).length;
    
    for (const [feature, passed] of Object.entries(results)) {
      const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
      const featureName = feature.replace(/([A-Z])/g, ' $1').trim();
      console.log(`  ${featureName}: ${status}`);
      if (passed) passedTests++;
    }
    
    const percentage = ((passedTests / totalTests) * 100).toFixed(1);
    const overallStatus = passedTests === totalTests ? 
      `${colors.green}${colors.bright}✨ ALL TESTS PASSED!${colors.reset}` : 
      `${colors.yellow}${colors.bright}⚠️  ${passedTests}/${totalTests} tests passed (${percentage}%)${colors.reset}`;
    
    console.log(`\n${overallStatus}\n`);
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        percentage
      }
    };
    
    await fs.writeFile(
      path.join(__dirname, 'editor-validation-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    log('Detailed report saved to editor-validation-report.json', 'info');
    
  } catch (error) {
    log(`Validation error: ${error.message}`, 'error');
    console.error(error);
  } finally {
    await browser.close();
  }
}

// Run validation
if (require.main === module) {
  validateAllFeatures().catch(console.error);
}

module.exports = { validateAllFeatures };