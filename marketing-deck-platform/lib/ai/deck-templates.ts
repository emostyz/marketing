export interface DeckTemplate {
  name: string
  duration: number // minutes
  slides: SlideTemplate[]
}

export interface SlideTemplate {
  type: string
  title?: string
  duration: number
  layout: string
  charts?: string[]
  contentGuidelines: {
    [key: string]: any
  }
}

export const WORLD_CLASS_TEMPLATES = {
  boardUpdate: {
    name: "Board Update",
    duration: 15, // minutes
    slides: [
      {
        type: "executiveSummary",
        title: "Executive Summary",
        duration: 2,
        layout: "keyPoints",
        contentGuidelines: {
          maxBullets: 4,
          structure: "situation-complication-resolution",
          tone: "confident but realistic"
        }
      },
      {
        type: "kpiDashboard",
        title: "Performance Snapshot",
        duration: 2,
        layout: "metricsGrid",
        charts: ["gauges", "sparklines"],
        contentGuidelines: {
          showVariance: true,
          highlightExceptions: true,
          includeTargets: true
        }
      },
      {
        type: "deepDive",
        title: "[Main Issue/Opportunity]",
        duration: 3,
        layout: "chartFocused",
        contentGuidelines: {
          tellStory: true,
          showTrend: true,
          explainWhy: true
        }
      },
      {
        type: "marketContext",
        title: "Market Dynamics",
        duration: 2,
        layout: "comparison",
        contentGuidelines: {
          showCompetitors: true,
          highlightPosition: true,
          indicateTrends: true
        }
      },
      {
        type: "risks",
        title: "Risk Assessment",
        duration: 2,
        layout: "matrix",
        charts: ["heatmap", "riskMatrix"],
        contentGuidelines: {
          prioritizeByImpact: true,
          includeMitigation: true,
          beTransparent: true
        }
      },
      {
        type: "recommendations",
        title: "Recommended Actions",
        duration: 3,
        layout: "numberedList",
        contentGuidelines: {
          beSpecific: true,
          includeTimeline: true,
          showImpact: true,
          assignOwnership: true
        }
      },
      {
        type: "appendix",
        title: "Appendix",
        duration: 1,
        layout: "index",
        contentGuidelines: {
          includeDetails: true,
          organized: true
        }
      }
    ]
  },
  
  investorPitch: {
    name: "Investor Pitch",
    duration: 10,
    slides: [
      {
        type: "title",
        duration: 0.5,
        layout: "centerTitle",
        contentGuidelines: {
          includeTagline: true,
          showLogo: true
        }
      },
      {
        type: "problem",
        duration: 1,
        layout: "bigStatement",
        contentGuidelines: {
          quantifyPain: true,
          relatable: true,
          urgent: true
        }
      },
      {
        type: "solution",
        duration: 1.5,
        layout: "heroImage",
        contentGuidelines: {
          clearValue: true,
          unique: true,
          defensible: true
        }
      },
      {
        type: "traction",
        duration: 1.5,
        layout: "metricsShowcase",
        charts: ["growthLine", "logoBar"],
        contentGuidelines: {
          showMomentum: true,
          socialProof: true,
          impressive: true
        }
      },
      {
        type: "marketSize",
        duration: 1,
        layout: "tamSamSom",
        charts: ["marketSizing"],
        contentGuidelines: {
          bottomUp: true,
          realistic: true,
          sourced: true
        }
      },
      {
        type: "businessModel",
        duration: 1,
        layout: "flowDiagram",
        contentGuidelines: {
          showUnit: true,
          scalable: true,
          profitable: true
        }
      },
      {
        type: "competition",
        duration: 1,
        layout: "quadrant",
        charts: ["competitiveLandscape"],
        contentGuidelines: {
          honest: true,
          differentiated: true,
          winnable: true
        }
      },
      {
        type: "team",
        duration: 0.5,
        layout: "teamGrid",
        contentGuidelines: {
          credible: true,
          relevant: true,
          complete: true
        }
      },
      {
        type: "ask",
        duration: 1,
        layout: "useOfFunds",
        charts: ["allocation"],
        contentGuidelines: {
          specific: true,
          milestones: true,
          reasonable: true
        }
      },
      {
        type: "vision",
        duration: 1,
        layout: "futureState",
        contentGuidelines: {
          inspiring: true,
          achievable: true,
          memorable: true
        }
      }
    ]
  },

  salesPitch: {
    name: "Sales Pitch",
    duration: 20,
    slides: [
      {
        type: "title",
        duration: 0.5,
        layout: "centerTitle",
        contentGuidelines: {
          includeCompanyLogo: true,
          professionalLook: true
        }
      },
      {
        type: "hook",
        duration: 2,
        layout: "bigStatement",
        contentGuidelines: {
          shockingStatistic: true,
          relateToAudience: true,
          createUrgency: true
        }
      },
      {
        type: "currentState",
        duration: 3,
        layout: "painPoints",
        charts: ["costAnalysis"],
        contentGuidelines: {
          quantifyPain: true,
          showImpact: true,
          makePersonal: true
        }
      },
      {
        type: "solution",
        duration: 4,
        layout: "solutionOverview",
        contentGuidelines: {
          clearBenefits: true,
          differentiators: true,
          easyToUnderstand: true
        }
      },
      {
        type: "roi",
        duration: 3,
        layout: "roiCalculation",
        charts: ["roiChart", "paybackPeriod"],
        contentGuidelines: {
          useTheirNumbers: true,
          conservativeEstimates: true,
          showBreakeven: true
        }
      },
      {
        type: "proof",
        duration: 3,
        layout: "caseStudies",
        contentGuidelines: {
          similarCustomers: true,
          quantifiedResults: true,
          testimonials: true
        }
      },
      {
        type: "implementation",
        duration: 2,
        layout: "timeline",
        contentGuidelines: {
          clearSteps: true,
          fastImplementation: true,
          lowRisk: true
        }
      },
      {
        type: "pricing",
        duration: 1.5,
        layout: "pricingTiers",
        contentGuidelines: {
          valueJustified: true,
          options: true,
          urgency: true
        }
      },
      {
        type: "nextSteps",
        duration: 1,
        layout: "callToAction",
        contentGuidelines: {
          specific: true,
          timebound: true,
          easyToSay: true
        }
      }
    ]
  },

  dataStory: {
    name: "Data Story",
    duration: 25,
    slides: [
      {
        type: "title",
        duration: 0.5,
        layout: "centerTitle",
        contentGuidelines: {
          intriguingTitle: true,
          hintAtStory: true
        }
      },
      {
        type: "context",
        title: "The Current Situation",
        duration: 2,
        layout: "statusQuo",
        charts: ["baseline"],
        contentGuidelines: {
          establishNormal: true,
          setExpectations: true,
          buildTension: true
        }
      },
      {
        type: "discovery",
        title: "What We Found",
        duration: 4,
        layout: "revelation",
        charts: ["trendReveal"],
        contentGuidelines: {
          dramaticReveal: true,
          showSignificance: true,
          createSurprise: true
        }
      },
      {
        type: "exploration",
        title: "Diving Deeper",
        duration: 6,
        layout: "analysis",
        charts: ["drillDown", "correlation"],
        contentGuidelines: {
          exploreWhy: true,
          showPatterns: true,
          buildEvidence: true
        }
      },
      {
        type: "implications",
        title: "What This Means",
        duration: 4,
        layout: "interpretation",
        contentGuidelines: {
          connectToBusiness: true,
          showConsequences: true,
          quantifyImpact: true
        }
      },
      {
        type: "predictions",
        title: "Looking Forward",
        duration: 3,
        layout: "forecast",
        charts: ["projection"],
        contentGuidelines: {
          showTrajectory: true,
          includeScenarios: true,
          beRealistic: true
        }
      },
      {
        type: "recommendations",
        title: "What We Should Do",
        duration: 4,
        layout: "actionPlan",
        contentGuidelines: {
          specificActions: true,
          prioritized: true,
          resourced: true
        }
      },
      {
        type: "conclusion",
        title: "The Path Forward",
        duration: 1.5,
        layout: "summary",
        contentGuidelines: {
          reinforceKey: true,
          inspirational: true,
          memorable: true
        }
      }
    ]
  }
}

export function selectBestTemplate(data: any, context: any): DeckTemplate {
  // Smart template selection based on data and context
  const scores = Object.entries(WORLD_CLASS_TEMPLATES).map(([key, template]) => {
    let score = 0
    
    // Match based on context
    if (context.audience?.includes('board') && key === 'boardUpdate') score += 10
    if (context.audience?.includes('investor') && key === 'investorPitch') score += 10
    if (context.goal?.includes('funding') && key === 'investorPitch') score += 8
    if (context.goal?.includes('sales') || context.audience?.includes('prospect') && key === 'salesPitch') score += 8
    if (context.goal?.includes('analyze') || context.goal?.includes('understand') && key === 'dataStory') score += 6
    
    // Match based on data characteristics
    if (data.hasTimeSeries && template.slides.some(s => s.charts?.includes('growthLine'))) score += 5
    if (data.hasComparisons && template.slides.some(s => s.layout === 'comparison')) score += 5
    if (data.complexity === 'high' && key === 'dataStory') score += 4
    
    // Match based on time constraints
    const timeDiff = Math.abs(template.duration - (context.timeLimit || 15))
    score -= timeDiff // Penalize templates that don't fit time limit
    
    return { template: key, score, templateData: template }
  })
  
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0]
  return bestMatch.templateData as DeckTemplate
}

export function adaptTemplateToContext(template: DeckTemplate, context: any, data: any): DeckTemplate {
  // Customize template based on specific context
  const adaptedSlides = template.slides.map(slide => {
    const adaptedSlide = { ...slide }
    
    // Adjust titles based on context
    if (slide.title?.includes('[') && slide.title?.includes(']')) {
      if (context.industry === 'retail' && slide.type === 'deepDive') {
        adaptedSlide.title = "Customer Acquisition Opportunity"
      } else if (context.industry === 'manufacturing' && slide.type === 'deepDive') {
        adaptedSlide.title = "Operational Efficiency Gap"
      } else if (context.industry === 'SaaS' && slide.type === 'deepDive') {
        adaptedSlide.title = "Revenue Growth Potential"
      }
    }
    
    // Adjust content guidelines based on audience
    if (context.audience?.includes('technical')) {
      adaptedSlide.contentGuidelines = {
        ...adaptedSlide.contentGuidelines,
        includeMethodology: true,
        showDataSources: true
      }
    }
    
    if (context.audience?.includes('executive')) {
      adaptedSlide.contentGuidelines = {
        ...adaptedSlide.contentGuidelines,
        highlightROI: true,
        showCompetitiveImplications: true
      }
    }
    
    return adaptedSlide
  })
  
  return {
    ...template,
    slides: adaptedSlides
  }
}