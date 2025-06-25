export interface QualityScore {
  overall: number
  breakdown: {
    clarity: number
    impact: number
    design: number
    flow: number
  }
  recommendations: string[]
  grade: string
  details: {
    strengths: string[]
    improvements: string[]
    criticalIssues: string[]
  }
}

export class DeckQualityScorer {
  private criteria: { [key: string]: { weight: number; checks: string[] } } = {
    clarity: {
      weight: 0.25,
      checks: [
        'hasOneMessagePerSlide',
        'usesActiveVoice',
        'avoidsJargon',
        'quantifiesImpact'
      ]
    },
    
    impact: {
      weight: 0.35,
      checks: [
        'startsWithBusinessOutcome',
        'includesSpecificNumbers',
        'showsROI',
        'drivesAction'
      ]
    },
    
    design: {
      weight: 0.20,
      checks: [
        'consistentStyling',
        'appropriateCharts',
        'readableTypography',
        'professionalColors'
      ]
    },
    
    flow: {
      weight: 0.20,
      checks: [
        'logicalProgression',
        'smoothTransitions',
        'appropriatePacing',
        'strongOpeningClosing'
      ]
    }
  }
  
  async scoreDeck(deck: any): Promise<QualityScore> {
    console.log('🔍 Starting deck quality assessment...')
    
    const scores: { [key: string]: any } = {}
    const details = {
      strengths: [] as string[],
      improvements: [] as string[],
      criticalIssues: [] as string[]
    }
    
    // Score each category
    for (const [category, config] of Object.entries(this.criteria)) {
      const categoryResult = await this.scoreCategory(deck, config, category)
      scores[category] = categoryResult.score
      
      // Collect feedback
      details.strengths.push(...categoryResult.strengths)
      details.improvements.push(...categoryResult.improvements)
      details.criticalIssues.push(...categoryResult.criticalIssues)
    }
    
    // Calculate overall score
    const totalScore = Object.entries(scores).reduce((total, [cat, score]) => {
      return total + ((typeof score === 'number' ? score : 0) * (this.criteria[cat]?.weight ?? 1))
    }, 0)
    
    const grade = this.assignGrade(totalScore)
    const recommendations = this.generateRecommendations(scores, details)
    
    console.log(`📊 Quality assessment complete: ${grade} (${(totalScore * 100).toFixed(1)}%)`)
    
    return {
      overall: totalScore,
      breakdown: scores as any,
      recommendations,
      grade,
      details
    }
  }
  
  private async scoreCategory(deck: any, config: any, category: string) {
    const results = {
      score: 0,
      strengths: [] as string[],
      improvements: [] as string[],
      criticalIssues: [] as string[]
    }
    
    const checkResults = []
    
    // Run all checks for this category
    for (const checkName of config.checks) {
      const checkResult = await this.runQualityCheck(deck, checkName, category)
      checkResults.push(checkResult)
      
      if (checkResult.passed) {
        results.strengths.push(checkResult.feedback)
      } else if (checkResult.critical) {
        results.criticalIssues.push(checkResult.feedback)
      } else {
        results.improvements.push(checkResult.feedback)
      }
    }
    
    // Calculate category score
    const passedChecks = checkResults.filter(r => r.passed).length
    results.score = passedChecks / config.checks.length
    
    return results
  }
  
  private async runQualityCheck(deck: any, checkName: string, category: string) {
    const slides = deck.slides || []
    
    switch (checkName) {
      case 'hasOneMessagePerSlide':
        return this.checkOneMessagePerSlide(slides)
      
      case 'usesActiveVoice':
        return this.checkActiveVoice(slides)
      
      case 'avoidsJargon':
        return this.checkJargon(slides)
      
      case 'quantifiesImpact':
        return this.checkQuantification(slides)
      
      case 'startsWithBusinessOutcome':
        return this.checkBusinessOutcome(slides)
      
      case 'includesSpecificNumbers':
        return this.checkSpecificNumbers(slides)
      
      case 'showsROI':
        return this.checkROI(slides)
      
      case 'drivesAction':
        return this.checkActionOrientation(slides)
      
      case 'consistentStyling':
        return this.checkConsistentStyling(slides)
      
      case 'appropriateCharts':
        return this.checkChartAppropriate(slides)
      
      case 'readableTypography':
        return this.checkTypography(slides)
      
      case 'professionalColors':
        return this.checkProfessionalColors(slides)
      
      case 'logicalProgression':
        return this.checkLogicalFlow(slides)
      
      case 'smoothTransitions':
        return this.checkTransitions(slides)
      
      case 'appropriatePacing':
        return this.checkPacing(slides, deck)
      
      case 'strongOpeningClosing':
        return this.checkOpeningClosing(slides)
      
      default:
        return { passed: true, feedback: `Check ${checkName} not implemented`, critical: false }
    }
  }
  
  // Clarity Checks
  private checkOneMessagePerSlide(slides: any[]) {
    const multiMessageSlides = slides.filter(slide => {
      const contentItems = slide.content?.length || 0
      const elements = slide.elements?.filter((e: any) => e.type === 'text')?.length || 0
      return contentItems + elements > 5
    })
    
    const passed = multiMessageSlides.length === 0
    return {
      passed,
      feedback: passed 
        ? "Each slide focuses on one key message"
        : `${multiMessageSlides.length} slides have too many messages - simplify for clarity`,
      critical: multiMessageSlides.length > slides.length * 0.5
    }
  }
  
  private checkActiveVoice(slides: any[]) {
    const passiveIndicators = ['was', 'were', 'been', 'being', 'is shown', 'can be seen']
    let passiveCount = 0
    
    slides.forEach(slide => {
      const text = JSON.stringify(slide.content || []).toLowerCase()
      passiveIndicators.forEach(indicator => {
        if (text.includes(indicator)) passiveCount++
      })
    })
    
    const passed = passiveCount < slides.length * 0.3
    return {
      passed,
      feedback: passed
        ? "Uses active voice effectively"
        : "Too much passive voice - use active statements for impact",
      critical: false
    }
  }
  
  private checkJargon(slides: any[]) {
    const jargonWords = ['synergy', 'leverage', 'paradigm', 'disrupt', 'ideate', 'utilize']
    let jargonCount = 0
    
    slides.forEach(slide => {
      const text = JSON.stringify(slide.content || []).toLowerCase()
      jargonWords.forEach(word => {
        if (text.includes(word)) jargonCount++
      })
    })
    
    const passed = jargonCount < 3
    return {
      passed,
      feedback: passed
        ? "Language is clear and accessible"
        : "Reduce business jargon for broader audience appeal",
      critical: false
    }
  }
  
  private checkQuantification(slides: any[]) {
    const hasNumbers = slides.some(slide => {
      const text = JSON.stringify(slide.content || [])
      return /[\d]/.test(text) || text.includes('%') || text.includes('$')
    })
    
    return {
      passed: hasNumbers,
      feedback: hasNumbers
        ? "Includes quantified impact and metrics"
        : "Add specific numbers and percentages to strengthen credibility",
      critical: !hasNumbers
    }
  }
  
  // Impact Checks
  private checkBusinessOutcome(slides: any[]) {
    const firstSlide = slides[0]
    if (!firstSlide) {
      return { passed: false, feedback: "No slides to analyze", critical: true }
    }
    
    const text = JSON.stringify(firstSlide.content || []).toLowerCase()
    const hasOutcome = text.includes('revenue') || text.includes('cost') || 
                      text.includes('growth') || text.includes('save') ||
                      text.includes('increase') || text.includes('reduce')
    
    return {
      passed: hasOutcome,
      feedback: hasOutcome
        ? "Opens with clear business outcome"
        : "Start with business impact rather than data observations",
      critical: !hasOutcome
    }
  }
  
  private checkSpecificNumbers(slides: any[]) {
    const numberPattern = /\$[\d,]+|\d+%|\d+\.\d+/
    const hasSpecificNumbers = slides.some(slide => {
      const text = JSON.stringify(slide.content || [])
      return numberPattern.test(text)
    })
    
    return {
      passed: hasSpecificNumbers,
      feedback: hasSpecificNumbers
        ? "Includes specific, quantified metrics"
        : "Add specific dollar amounts and percentages",
      critical: false
    }
  }
  
  private checkROI(slides: any[]) {
    const roiKeywords = ['roi', 'return', 'payback', 'break even', 'investment']
    const hasROI = slides.some(slide => {
      const text = JSON.stringify(slide.content || []).toLowerCase()
      return roiKeywords.some(keyword => text.includes(keyword))
    })
    
    return {
      passed: hasROI,
      feedback: hasROI
        ? "Demonstrates clear return on investment"
        : "Consider adding ROI or payback analysis",
      critical: false
    }
  }
  
  private checkActionOrientation(slides: any[]) {
    const actionWords = ['implement', 'execute', 'launch', 'start', 'begin', 'invest', 'allocate']
    const hasActions = slides.some(slide => {
      const text = JSON.stringify(slide.content || []).toLowerCase()
      return actionWords.some(word => text.includes(word))
    })
    
    return {
      passed: hasActions,
      feedback: hasActions
        ? "Includes clear action items and next steps"
        : "Add specific action items and implementation steps",
      critical: false
    }
  }
  
  // Design Checks
  private checkConsistentStyling(slides: any[]) {
    // Check if slides have consistent styling
    const hasDesign = slides.every(slide => slide.design || slide.elements)
    
    return {
      passed: hasDesign,
      feedback: hasDesign
        ? "Consistent styling and design applied"
        : "Apply consistent styling across all slides",
      critical: false
    }
  }
  
  private checkChartAppropriate(slides: any[]) {
    const chartSlides = slides.filter(slide => slide.charts?.length > 0)
    
    if (chartSlides.length === 0) {
      return {
        passed: true,
        feedback: "No charts to evaluate",
        critical: false
      }
    }
    
    // Basic check - ensure charts have data
    const validCharts = chartSlides.every(slide => 
      slide.charts.every((chart: any) => chart.data || chart.type)
    )
    
    return {
      passed: validCharts,
      feedback: validCharts
        ? "Charts are appropriate and well-configured"
        : "Some charts may need better configuration",
      critical: false
    }
  }
  
  private checkTypography(slides: any[]) {
    // Check if typography rules are applied
    const hasTypography = slides.some(slide => 
      slide.design?.typography || 
      slide.elements?.some((e: any) => e.style?.fontSize)
    )
    
    return {
      passed: hasTypography,
      feedback: hasTypography
        ? "Typography is well-structured and readable"
        : "Apply proper typography hierarchy",
      critical: false
    }
  }
  
  private checkProfessionalColors(slides: any[]) {
    // Check if professional color scheme is applied
    const hasColors = slides.some(slide => 
      slide.design?.colors || 
      slide.elements?.some((e: any) => e.style?.color)
    )
    
    return {
      passed: hasColors,
      feedback: hasColors
        ? "Professional color scheme applied"
        : "Apply professional color scheme",
      critical: false
    }
  }
  
  // Flow Checks
  private checkLogicalFlow(slides: any[]) {
    if (slides.length < 3) {
      return { passed: true, feedback: "Too few slides to assess flow", critical: false }
    }
    
    // Basic flow check - look for logical slide types
    const slideTypes = slides.map(s => s.type || 'content')
    const hasIntro = slideTypes.includes('title') || slideTypes.includes('executiveSummary')
    const hasConclusion = slideTypes.includes('recommendations') || slideTypes.includes('conclusion')
    
    const passed = hasIntro && hasConclusion
    return {
      passed,
      feedback: passed
        ? "Logical flow from introduction to conclusion"
        : "Ensure clear introduction and conclusion slides",
      critical: false
    }
  }
  
  private checkTransitions(slides: any[]) {
    // Check if slides have transition logic
    const hasTransitions = slides.some(slide => slide.transition)
    
    return {
      passed: hasTransitions,
      feedback: hasTransitions
        ? "Smooth transitions between slides"
        : "Consider adding slide transitions",
      critical: false
    }
  }
  
  private checkPacing(slides: any[], deck: any) {
    const totalTime = deck.estimatedDuration || slides.reduce((sum, slide) => sum + (slide.duration || 1), 0)
    const averageTime = totalTime / slides.length
    
    const appropriatePacing = averageTime >= 0.5 && averageTime <= 3
    
    return {
      passed: appropriatePacing,
      feedback: appropriatePacing
        ? "Appropriate pacing for presentation"
        : averageTime < 0.5 
          ? "Slides may be too fast-paced"
          : "Slides may be too slow-paced",
      critical: false
    }
  }
  
  private checkOpeningClosing(slides: any[]) {
    if (slides.length < 2) {
      return { passed: false, feedback: "Needs more slides for proper opening/closing", critical: true }
    }
    
    const firstSlide = slides[0]
    const lastSlide = slides[slides.length - 1]
    
    const hasStrongOpening = firstSlide.type === 'title' || 
                           firstSlide.type === 'executiveSummary' ||
                           JSON.stringify(firstSlide.content || []).length > 10
    
    const hasStrongClosing = lastSlide.type === 'recommendations' ||
                           lastSlide.type === 'conclusion' ||
                           lastSlide.type === 'nextSteps' ||
                           JSON.stringify(lastSlide.content || []).includes('action')
    
    const passed = hasStrongOpening && hasStrongClosing
    return {
      passed,
      feedback: passed
        ? "Strong opening and compelling close"
        : "Strengthen opening hook and closing call-to-action",
      critical: !hasStrongOpening
    }
  }
  
  private assignGrade(score: number): string {
    if (score >= 0.9) return 'World-Class'
    if (score >= 0.8) return 'Executive-Ready'
    if (score >= 0.7) return 'Professional'
    if (score >= 0.6) return 'Adequate'
    return 'Needs Improvement'
  }
  
  private generateRecommendations(scores: any, details: any): string[] {
    const recommendations = []
    
    // Priority recommendations based on scores
    if (scores.impact < 0.7) {
      recommendations.push("Focus on business impact: Start each insight with dollar amounts or percentages")
    }
    
    if (scores.clarity < 0.7) {
      recommendations.push("Simplify messaging: One key point per slide with clear, active language")
    }
    
    if (scores.flow < 0.7) {
      recommendations.push("Improve narrative flow: Ensure logical progression from problem to solution")
    }
    
    if (scores.design < 0.7) {
      recommendations.push("Enhance visual design: Apply consistent colors, fonts, and chart styling")
    }
    
    // Add specific improvements from critical issues
    if (details.criticalIssues.length > 0) {
      recommendations.push(...(details.criticalIssues as any[]).map((issue: any) => `Critical: ${issue}`))
    }
    
    // If score is high, provide advanced tips
    if (Object.values(scores).every((score: any) => typeof score === 'number' && score >= 0.8)) {
      recommendations.push("Consider adding executive coaching notes for presentation delivery")
      recommendations.push("Add industry benchmarks or competitive context where relevant")
    }
    
    return recommendations.slice(0, 5) // Top 5 recommendations
  }
}

export async function scoreDeckQuality(deck: any): Promise<QualityScore> {
  const scorer = new DeckQualityScorer()
  return await scorer.scoreDeck(deck)
}