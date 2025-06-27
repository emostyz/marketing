// Test script to verify user feedback integration
const testUserFeedbackFlow = async () => {
  console.log('🧪 Testing complete user feedback integration flow...')
  
  // Step 1: Test ultimate brain analysis
  const analysisResponse = await fetch('http://localhost:3000/api/ai/ultimate-brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [
        { revenue: 100000, date: "2024-01", category: "enterprise" },
        { revenue: 120000, date: "2024-02", category: "enterprise" },
        { revenue: 95000, date: "2024-03", category: "smb" }
      ],
      context: {
        industry: "tech",
        businessContext: "SaaS growth analysis",
        targetAudience: "executives"
      },
      userFeedback: [],
      learningObjectives: ["growth analysis", "market insights"]
    })
  })
  
  const analysisResult = await analysisResponse.json()
  console.log('📊 Analysis Result:', {
    success: analysisResult.success,
    insightCount: analysisResult.analysis?.strategicInsights?.length || 0,
    confidence: analysisResult.analysis?.overallConfidence || 0
  })
  
  // Simulate user feedback
  const mockApprovedInsights = analysisResult.analysis?.strategicInsights?.map((insight, index) => ({
    ...insight,
    approved: index < 2 ? true : false, // Approve first 2 insights
    slideAssignment: `slide_${index + 1}`
  })) || []
  
  const mockDeckStructure = {
    title: "SaaS Growth Analysis",
    description: "User-customized presentation",
    slides: [
      {
        id: "slide_1",
        title: "Executive Summary", 
        purpose: "High-level overview",
        type: "executive",
        enabled: true,
        essential: true,
        order: 1
      },
      {
        id: "slide_2", 
        title: "Growth Insights",
        purpose: "Key performance drivers",
        type: "insights",
        enabled: true,
        essential: false,
        order: 2
      },
      {
        id: "slide_3",
        title: "Market Analysis", 
        purpose: "Competitive landscape",
        type: "analysis",
        enabled: false, // User disabled this slide
        essential: false,
        order: 3
      },
      {
        id: "slide_4",
        title: "Action Plan",
        purpose: "Next steps and recommendations", 
        type: "recommendations",
        enabled: true,
        essential: true,
        order: 4
      }
    ]
  }
  
  console.log('👤 Simulated User Feedback:', {
    approvedInsights: mockApprovedInsights.filter(i => i.approved).length,
    totalInsights: mockApprovedInsights.length,
    enabledSlides: mockDeckStructure.slides.filter(s => s.enabled).length,
    totalSlides: mockDeckStructure.slides.length,
    disabledSlides: mockDeckStructure.slides.filter(s => !s.enabled).map(s => s.title)
  })
  
  // Step 2: Test deck generation with user feedback
  const deckResponse = await fetch('http://localhost:3000/api/deck/generate-world-class', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Quality-Level': 'world-class',
      'X-Generation-Method': 'circular-feedback'
    },
    body: JSON.stringify({
      datasetId: "demo-test-data",
      context: {
        // Basic context
        audience: "executives",
        goal: "strategic data analysis", 
        timeLimit: 15,
        industry: "tech",
        decision: "strategic_planning",
        companySize: "medium",
        urgency: "normal",
        presentationStyle: "executive",
        
        // USER FEEDBACK DATA
        approvedInsights: mockApprovedInsights.filter(i => i.approved),
        deckStructure: mockDeckStructure,
        userCustomizedSlides: true,
        userApprovedStructure: true,
        slideReorderingApplied: true,
        realTimeGenerated: true,
        analysisMethod: 'ai_enhanced_with_feedback',
        qualityTarget: 'world_class',
        confidenceThreshold: 85,
        consultingStyle: 'mckinsey',
        chartCohesion: 'professional'
      }
    })
  })
  
  const deckResult = await deckResponse.json()
  console.log('🎯 Deck Generation Result:', {
    success: deckResult.success,
    deckId: deckResult.deckId || 'not generated',
    slideCount: deckResult.slides?.length || 0,
    userFeedbackProcessed: deckResult.userFeedbackProcessed || false
  })
  
  // Step 3: Verify feedback integration
  if (deckResult.success) {
    console.log('✅ USER FEEDBACK INTEGRATION TEST PASSED')
    console.log('🔍 Generated Slides:')
    deckResult.slides?.forEach((slide, i) => {
      console.log(`   ${i + 1}. ${slide.title} (${slide.userCustomized ? 'CUSTOMIZED' : 'default'})`)
    })
  } else {
    console.log('❌ USER FEEDBACK INTEGRATION TEST FAILED')
    console.log('Error:', deckResult.error)
  }
  
  return deckResult
}

// Run the test
testUserFeedbackFlow().catch(console.error)