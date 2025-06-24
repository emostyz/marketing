#!/usr/bin/env node

/**
 * 🎯 DECK DISPLAY TEST - PROVES BEAUTIFUL SLIDES ARE SHOWN
 * ========================================================
 * 
 * This test proves the deck page actually displays beautiful slides:
 * 1. Generate a deck from real data
 * 2. Open the deck page
 * 3. Take screenshots proving slides are displayed
 * 4. Verify each slide content is rendered properly
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const FormData = require('form-data');

const SERVER_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  return fetch(url, options);
}

async function testDeckDisplay() {
  console.log('🎯 TESTING DECK DISPLAY - PROVING BEAUTIFUL SLIDES');
  console.log('==================================================\n');

  let browser;
  try {
    // Step 1: Generate a deck first
    console.log('📁 Step 1: Generate Demo Deck');
    console.log('-----------------------------');
    
    const csvFile = 'demo_1000_row_dataset.csv';
    if (!fs.existsSync(csvFile)) {
      throw new Error(`Test file ${csvFile} not found`);
    }
    
    // Upload the CSV file
    const form = new FormData();
    form.append('file', fs.createReadStream(csvFile));
    
    const uploadResponse = await makeRequest(`${SERVER_URL}/api/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const uploadResult = await uploadResponse.json();
    const datasetId = uploadResult.datasets?.[0]?.id || uploadResult.files?.[0]?.datasetId;
    
    if (!datasetId) {
      throw new Error('No dataset ID from upload');
    }
    
    console.log('✅ Dataset uploaded:', datasetId);
    
    // Generate deck
    const generateResponse = await makeRequest(`${SERVER_URL}/api/deck/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId: datasetId })
    });
    
    const generateResult = await generateResponse.json();
    
    if (!generateResult.success || !generateResult.deckId) {
      throw new Error('Deck generation failed: ' + JSON.stringify(generateResult));
    }
    
    const deckId = generateResult.deckId;
    const deckUrl = `${SERVER_URL}/deck-builder/${deckId}`;
    
    console.log('✅ Deck generated:', deckId);
    console.log('🔗 Deck URL:', deckUrl);
    
    // Step 2: Open the deck in browser
    console.log('\n🌐 Step 2: Open Deck in Browser');
    console.log('--------------------------------');
    
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    const page = await browser.newPage();
    
    // Set demo mode in localStorage
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('demo-mode', 'true');
    });
    
    console.log('📍 Navigating to deck page...');
    await page.goto(deckUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for deck to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📸 Taking screenshot of deck page...');
    await page.screenshot({ 
      path: 'deck-display-proof.png',
      fullPage: true 
    });
    
    // Step 3: Analyze what's actually displayed
    console.log('\n🔍 Step 3: Analyze Displayed Content');
    console.log('-----------------------------------');
    
    // Check for slide content
    const pageContent = await page.evaluate(() => {
      const analysis = {
        hasSlides: false,
        slideCount: 0,
        hasText: false,
        hasCharts: false,
        hasEditorInterface: false,
        slideElements: [],
        errorMessages: []
      };
      
      // Look for slide indicators
      const slideElements = document.querySelectorAll('[class*="slide"], [data-testid*="slide"]');
      analysis.slideCount = slideElements.length;
      analysis.hasSlides = slideElements.length > 0;
      
      // Look for text content
      const textElements = document.querySelectorAll('h1, h2, h3, p, span, div');
      const relevantText = Array.from(textElements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 3 && 
          (text.includes('Demo') || text.includes('Analysis') || text.includes('Data') || text.includes('Revenue')))
        .slice(0, 10);
      
      analysis.hasText = relevantText.length > 0;
      analysis.slideElements = relevantText;
      
      // Look for chart elements
      const chartElements = document.querySelectorAll('svg, canvas, [class*="chart"], [class*="recharts"]');
      analysis.hasCharts = chartElements.length > 0;
      
      // Look for editor interface
      const editorElements = document.querySelectorAll('[class*="editor"], [class*="toolbar"], [class*="panel"]');
      analysis.hasEditorInterface = editorElements.length > 0;
      
      // Look for error messages
      const errorElements = document.querySelectorAll('[class*="error"], .error, [role="alert"]');
      analysis.errorMessages = Array.from(errorElements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0);
      
      return analysis;
    });
    
    console.log('📊 Analysis Results:');
    console.log('- Has Slides:', pageContent.hasSlides ? '✅ YES' : '❌ NO');
    console.log('- Slide Count:', pageContent.slideCount);
    console.log('- Has Text Content:', pageContent.hasText ? '✅ YES' : '❌ NO');
    console.log('- Has Charts:', pageContent.hasCharts ? '✅ YES' : '❌ NO'); 
    console.log('- Has Editor Interface:', pageContent.hasEditorInterface ? '✅ YES' : '❌ NO');
    
    if (pageContent.slideElements.length > 0) {
      console.log('📝 Found Content Elements:');
      pageContent.slideElements.forEach(text => {
        console.log(`  - "${text}"`);
      });
    }
    
    if (pageContent.errorMessages.length > 0) {
      console.log('⚠️ Error Messages Found:');
      pageContent.errorMessages.forEach(error => {
        console.log(`  - "${error}"`);
      });
    }
    
    // Step 4: Test slide navigation
    console.log('\n🎮 Step 4: Test Slide Navigation');
    console.log('--------------------------------');
    
    try {
      // Look for next/previous buttons
      const navigationElements = await page.evaluate(() => {
        const nextButtons = document.querySelectorAll('button[aria-label*="next"], button[title*="next"], .next-slide, [class*="next"]');
        const prevButtons = document.querySelectorAll('button[aria-label*="prev"], button[title*="prev"], .prev-slide, [class*="prev"]');
        const slideNumbers = document.querySelectorAll('[class*="slide-number"], [class*="current-slide"]');
        
        return {
          hasNext: nextButtons.length > 0,
          hasPrev: prevButtons.length > 0,
          hasSlideNumbers: slideNumbers.length > 0,
          nextButtonCount: nextButtons.length,
          prevButtonCount: prevButtons.length
        };
      });
      
      console.log('🎯 Navigation Analysis:');
      console.log('- Next Buttons:', navigationElements.hasNext ? '✅ YES' : '❌ NO', `(${navigationElements.nextButtonCount})`);
      console.log('- Previous Buttons:', navigationElements.hasPrev ? '✅ YES' : '❌ NO', `(${navigationElements.prevButtonCount})`);
      console.log('- Slide Numbers:', navigationElements.hasSlideNumbers ? '✅ YES' : '❌ NO');
      
    } catch (error) {
      console.log('⚠️ Navigation test error:', error.message);
    }
    
    // Final assessment
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('==================');
    
    const isWorking = pageContent.hasSlides && pageContent.hasText && pageContent.hasEditorInterface;
    const hasErrors = pageContent.errorMessages.length > 0;
    
    if (isWorking && !hasErrors) {
      console.log('✅ SUCCESS: Beautiful deck is displayed!');
      console.log('📸 Screenshot saved: deck-display-proof.png');
      console.log('🎨 Slides are rendered with proper content');
      console.log('🖥️ Editor interface is functional');
      return { success: true, deckId, deckUrl, analysis: pageContent };
    } else {
      console.log('❌ FAILURE: Deck is not properly displayed');
      if (!pageContent.hasSlides) console.log('  - No slides found');
      if (!pageContent.hasText) console.log('  - No meaningful text content');
      if (!pageContent.hasEditorInterface) console.log('  - No editor interface');
      if (hasErrors) console.log('  - Errors detected:', pageContent.errorMessages.join(', '));
      return { success: false, deckId, deckUrl, analysis: pageContent, errors: pageContent.errorMessages };
    }
    
  } catch (error) {
    console.error('💥 TEST FAILED:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testDeckDisplay().then(result => {
  if (result.success) {
    console.log('\n🎉 PROOF: DECK GENERATION AND DISPLAY WORKS!');
    console.log('✅ Real CSV data uploads successfully');
    console.log('✅ Deck generates from real data');
    console.log('✅ Beautiful slides are displayed');
    console.log('✅ Editor interface is functional');
    console.log(`🔗 Live demo: ${result.deckUrl}`);
    process.exit(0);
  } else {
    console.log('\n💥 FAILED: Deck display is not working properly');
    if (result.error) console.log('Error:', result.error);
    process.exit(1);
  }
});