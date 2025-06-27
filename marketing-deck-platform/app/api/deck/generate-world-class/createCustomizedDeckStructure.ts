// Custom deck structure creation based on user feedback
export async function createCustomizedDeckStructure(template: any, insights: any[], dataset: any, context: any) {
  console.log('🎯 Creating customized deck structure with user feedback')
  
  const { deckStructure, approvedInsights } = context
  
  // Start with user's slide structure
  const customSlides = deckStructure.slides
    .filter((slide: any) => slide.enabled) // Only enabled slides
    .sort((a: any, b: any) => a.order - b.order) // User's ordering
    .map((userSlide: any, index: number) => {
      
      // Find matching insights for this slide
      const slideInsights = approvedInsights.filter((insight: any) => 
        insight.slideAssignment === userSlide.id || 
        insight.approved === true
      )
      
      console.log(`📄 Processing slide ${index + 1}: "${userSlide.title}" with ${slideInsights.length} insights`)
      
      return {
        id: userSlide.id,
        title: userSlide.title, // Use user's custom title
        type: userSlide.type,
        purpose: userSlide.purpose,
        order: index + 1,
        content: generateSlideContentFromInsights(slideInsights, userSlide, context),
        charts: generateChartsForSlide(slideInsights, dataset, userSlide.type),
        insights: slideInsights,
        userCustomized: true,
        originalOrder: userSlide.order,
        essential: userSlide.essential
      }
    })
  
  console.log(`✅ Created ${customSlides.length} customized slides based on user feedback`)
  
  return {
    title: deckStructure.title || `${context.industry} Strategic Analysis`,
    description: deckStructure.description || `Customized presentation based on user insights`,
    slides: customSlides,
    metadata: {
      userCustomized: true,
      originalSlideCount: deckStructure.slides.length,
      enabledSlideCount: customSlides.length,
      approvedInsightCount: approvedInsights.length,
      customizationApplied: true
    }
  }
}

function generateSlideContentFromInsights(insights: any[], slide: any, context: any): string[] {
  const content = []
  
  // Add slide purpose if provided by user
  if (slide.purpose && slide.purpose !== slide.title) {
    content.push(slide.purpose)
  }
  
  // Add insights that user approved
  insights.forEach((insight, index) => {
    content.push(`${index + 1}. ${insight.title}`)
    if (insight.businessImplication) {
      content.push(`   • ${insight.businessImplication}`)
    }
    if (insight.confidence) {
      content.push(`   • Confidence: ${insight.confidence}%`)
    }
  })
  
  // Add context-relevant content
  if (insights.length === 0) {
    content.push(`Strategic analysis for ${context.industry} ${slide.type}`)
    content.push(`Tailored for ${context.audience} decision-making`)
  }
  
  return content
}

function generateChartsForSlide(insights: any[], dataset: any, slideType: string): any[] {
  const charts = []
  
  // Use charts from approved insights
  insights.forEach(insight => {
    if (insight.visualizations && insight.visualizations.length > 0) {
      charts.push(...insight.visualizations.slice(0, 1)) // One chart per insight
    }
  })
  
  // Generate default chart if no insight charts
  if (charts.length === 0 && dataset.processed_data && dataset.processed_data.length > 0) {
    const data = dataset.processed_data
    const numericCols = Object.keys(data[0] || {}).filter(col => 
      data.slice(0, 5).every((row: any) => !isNaN(parseFloat(row[col])))
    )
    
    if (numericCols.length > 0) {
      charts.push({
        type: slideType.includes('trend') ? 'line' : 'bar',
        title: `${slideType} Analysis`,
        data: data.slice(0, 8).map((row: any, i: number) => ({
          name: row.Date || row.Category || `Item ${i + 1}`,
          value: parseFloat(row[numericCols[0]]) || 0
        })),
        insight: `Key patterns identified in ${numericCols[0]}`
      })
    }
  }
  
  return charts
}