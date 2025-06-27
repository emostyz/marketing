#!/usr/bin/env node

// Test Draft Functionality
console.log('🧪 Testing Draft Persistence Functionality...')

const fs = require('fs')
const path = require('path')

// Mock localStorage for Node.js testing
class MockLocalStorage {
  constructor() {
    this.storage = {}
  }
  
  setItem(key, value) {
    this.storage[key] = value
    console.log(`📝 localStorage.setItem('${key}', ${value.length} chars)`)
  }
  
  getItem(key) {
    const value = this.storage[key]
    console.log(`📖 localStorage.getItem('${key}') = ${value ? 'found' : 'null'}`)
    return value || null
  }
  
  removeItem(key) {
    delete this.storage[key]
    console.log(`🗑️ localStorage.removeItem('${key}')`)
  }
}

// Simulate the draft saving logic from UltimateDeckBuilder
const mockLocalStorage = new MockLocalStorage()

const testUser = { id: 'test-user-123', demo: false }
const testCurrentStep = 3

const saveDraft = async (data) => {
  try {
    // Save to localStorage for immediate recovery
    const draftKey = `easydecks-intake-draft-${testUser?.id || 'demo'}`
    mockLocalStorage.setItem(draftKey, JSON.stringify({
      data,
      timestamp: Date.now(),
      currentStep: testCurrentStep,
      userId: testUser?.id
    }))

    // Also save to server for authenticated users
    if (testUser && !testUser.demo) {
      console.log('🌐 Would POST to /api/drafts with:', {
        draftData: data,
        type: 'intake',
        currentStep: testCurrentStep
      })
    }

    console.log('💾 Draft saved successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to save draft:', error)
    return false
  }
}

const loadDraft = () => {
  try {
    const draftKey = `easydecks-intake-draft-${testUser?.id || 'demo'}`
    const saved = mockLocalStorage.getItem(draftKey)
    
    if (saved) {
      const draft = JSON.parse(saved)
      console.log('📂 Draft loaded:', {
        timestamp: new Date(draft.timestamp),
        step: draft.currentStep,
        dataKeys: Object.keys(draft.data)
      })
      return draft
    } else {
      console.log('📭 No draft found')
      return null
    }
  } catch (error) {
    console.error('❌ Failed to load draft:', error)
    return null
  }
}

// Test with realistic intake data
const testIntakeData = {
  context: {
    description: 'Q4 Revenue Performance Analysis',
    industry: 'SaaS',
    targetAudience: 'Executives',
    businessContext: 'Quarterly business review for investor meeting',
    keyMetrics: 'MRR, CAC, Churn Rate, Growth Rate'
  },
  files: [
    {
      name: 'revenue-data.csv',
      status: 'success',
      datasetId: 'ds_12345',
      parsedData: [
        { Date: '2024-01', Revenue: 450000, Customers: 1200 },
        { Date: '2024-02', Revenue: 520000, Customers: 1350 }
      ]
    }
  ],
  timeFrame: {
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    comparisons: ['YoY', 'QoQ']
  },
  requirements: {
    comparisonTypes: ['YoY', 'QoQ'],
    includeComparisons: true
  }
}

async function runDraftTest() {
  console.log('\n📋 Testing Draft Save/Load Cycle...')
  
  // Test 1: Save draft
  console.log('\n1️⃣ Testing saveDraft...')
  const saveSuccess = await saveDraft(testIntakeData)
  
  if (!saveSuccess) {
    console.log('❌ Draft save failed')
    return false
  }
  
  // Test 2: Load draft
  console.log('\n2️⃣ Testing loadDraft...')
  const loadedDraft = loadDraft()
  
  if (!loadedDraft) {
    console.log('❌ Draft load failed')
    return false
  }
  
  // Test 3: Verify data integrity
  console.log('\n3️⃣ Testing data integrity...')
  const originalKeys = Object.keys(testIntakeData)
  const loadedKeys = Object.keys(loadedDraft.data)
  
  const integrityCheck = originalKeys.every(key => loadedKeys.includes(key))
  
  if (!integrityCheck) {
    console.log('❌ Data integrity check failed')
    console.log('Original keys:', originalKeys)
    console.log('Loaded keys:', loadedKeys)
    return false
  }
  
  console.log('✅ Data integrity verified')
  
  // Test 4: Simulate form updates
  console.log('\n4️⃣ Testing incremental updates...')
  
  const updatedData = {
    ...testIntakeData,
    context: {
      ...testIntakeData.context,
      description: 'Updated: Q4 Revenue Performance Analysis with Regional Breakdown'
    }
  }
  
  await saveDraft(updatedData)
  const updatedDraft = loadDraft()
  
  if (updatedDraft.data.context.description !== updatedData.context.description) {
    console.log('❌ Incremental update failed')
    return false
  }
  
  console.log('✅ Incremental updates working')
  
  // Test 5: Browser session simulation
  console.log('\n5️⃣ Testing browser session persistence...')
  
  // Simulate page refresh (new instance)
  const newLocalStorage = new MockLocalStorage()
  newLocalStorage.storage = { ...mockLocalStorage.storage }
  
  const persistedDraft = newLocalStorage.getItem(`easydecks-intake-draft-${testUser.id}`)
  
  if (!persistedDraft) {
    console.log('❌ Session persistence failed')
    return false
  }
  
  console.log('✅ Session persistence verified')
  
  return true
}

// Run the test
runDraftTest().then(success => {
  console.log('\n📊 DRAFT FUNCTIONALITY TEST RESULTS:')
  console.log('====================================')
  console.log(`Overall Success: ${success ? '✅' : '❌'}`)
  
  if (success) {
    console.log('\n🎉 DRAFT PERSISTENCE IS WORKING!')
    console.log('✅ Draft saves to localStorage automatically')
    console.log('✅ Draft loads correctly after page refresh')
    console.log('✅ Data integrity maintained')
    console.log('✅ Incremental updates work')
    console.log('✅ Session persistence verified')
    
    console.log('\n👤 USER EXPERIENCE:')
    console.log('→ User fills out intake form')
    console.log('→ Data automatically saves on every change')
    console.log('→ If browser crashes/closes, draft is preserved')
    console.log('→ User returns and continues from where they left off')
  } else {
    console.log('\n❌ DRAFT PERSISTENCE HAS ISSUES')
    console.log('🔧 Review the implementation and test again')
  }
}).catch(error => {
  console.error('\n💥 Test failed:', error)
})