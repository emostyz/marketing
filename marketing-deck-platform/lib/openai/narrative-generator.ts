import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateNarrative(
  slideType: string,
  slideData: any,
  dataSources: any[],
  questionnaire: {
    description: string
    keyVariables: string
    context: string
    goal: string
    keyPoint: string
  }
): Promise<string> {
  // Extract actual data from uploaded files
  const extractedData = extractDataFromSources(dataSources)

  const prompt = buildPrompt(slideType, extractedData, questionnaire)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a senior marketing strategist. Create compelling, data-driven narratives for executive presentations.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  })

  return completion.choices[0]?.message?.content || ''
}

// NEW: Generate a full deck plan from user goals/context/data
export async function generatePromptProposal({ dataSources, goals, context, keyQuestions, brand, pptxStructure, referenceSlides, questionnaire, userEdits, analysisResults }: any) {
  const prompt = `You are a world-class LLM prompt engineer. Given the following user data, write a proposal/overview for a prompt that will instruct an LLM to generate an executive-ready marketing deck. Summarize your approach, what the LLM will do, and how you will use the user's skeleton/reference slides, brand, and data. Do NOT write the raw prompt, just a clear proposal for the user to review.\n\nUser Data: ${JSON.stringify({ dataSources, goals, context, keyQuestions, brand, pptxStructure, referenceSlides, questionnaire, userEdits, analysisResults })}`
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a world-class LLM prompt engineer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 800,
  })
  return completion.choices[0]?.message?.content || ''
}

export async function validateDeckPlan({ deckPlan, context, goals, keyQuestions, brand, pptxStructure, referenceSlides }: any) {
  const prompt = `You are a world-class executive presentation reviewer. Given the following deck plan (JSON), user context, and requirements, review the plan for:\n- Stunning, executive-ready visuals\n- Compelling, concise narratives\n- Use of user-provided .pptx backgrounds and structure if available\n- Alignment with business goals and context\nIf the plan is not world-class, return passed: false and clear feedback/instructions for improvement.\n\nDeck Plan: ${JSON.stringify(deckPlan)}\nContext: ${context}\nGoals: ${goals}\nKey Questions: ${keyQuestions}\nBrand: ${JSON.stringify(brand)}\nSkeleton Deck: ${JSON.stringify(pptxStructure)}\nReference Slides: ${JSON.stringify(referenceSlides)}\n\nRespond as JSON: { passed: boolean, feedback: string }.`
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a world-class executive presentation reviewer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 600,
  })
  try {
    const json = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return json
  } catch {
    return { passed: false, feedback: 'Validation failed: Could not parse response.' }
  }
}

export async function generateDeckPlan({
  dataSources,
  goals,
  context,
  keyQuestions,
  brand,
  pptxStructure,
  referenceSlides,
  questionnaire,
  userEdits,
  approvedPrompt,
  analysisResults,
}: {
  dataSources: any[],
  goals: string,
  context: string,
  keyQuestions: string,
  brand?: { logo?: string; color?: string },
  pptxStructure?: any,
  referenceSlides?: any,
  questionnaire?: any,
  userEdits?: string,
  approvedPrompt?: string,
  analysisResults?: any,
}): Promise<any> {
  let prompt = ''
  if (approvedPrompt) {
    prompt = approvedPrompt
  } else {
    prompt = `You are a world-class marketing strategist and executive presentation designer. Given the following:\n- Data: ${JSON.stringify(dataSources)}\n- Business Goals: ${goals}\n- Context: ${context}\n- Key Questions: ${keyQuestions}\n- Brand: ${brand?.logo ? 'Logo provided' : 'No logo'}, Color: ${brand?.color || 'default'}\n${pptxStructure ? `\n- Skeleton Deck Structure: ${JSON.stringify(pptxStructure)}` : ''}\n${referenceSlides ? `\n- Reference Slides: ${JSON.stringify(referenceSlides)}` : ''}\n${userEdits ? `\n- User Edits: ${userEdits}` : ''}\n${analysisResults ? `\n- Data Analysis Results: ${JSON.stringify(analysisResults)}` : ''}\n\n1. Propose a full slide-by-slide deck plan for an executive audience.\n2. For each slide, specify:\n   - Slide type (e.g., title, executive-summary, trend-analysis, chart, recommendations, etc)\n   - Slide title\n   - Purpose/story\n   - Key data or narrative to include\n   - Chart or visual (if any)\n   - Which key question(s) it addresses\n   - Visual style (use user .pptx backgrounds if provided)\n3. Make the plan tailored to the goals, context, and data. Use best practices for executive storytelling.\n4. Output as a JSON array of slides, each with: { type, title, purpose, keyQuestions, chartType, notes, visualStyle, background }\n5. If the user provided a brand color or logo, note where to use them.\n\nFor each slide, specify:\n- type (e.g., chart, table, text, image)\n- chartType (bar, line, pie, etc)\n- table (boolean)\n- data (array of objects, for chart/table)\n- colors (array of hex)\n- narrative (string)\n- editable (boolean)\n- drivers (string[])\n\nWhen generating a slide, instruct the LLM to output a 'drivers' array of bullet points based on the data analysis. For each slide, the output should include: narrative (string), drivers (string[])\n\nFor each slide, specify:\n- type (e.g., chart, table, text, image)\n- chartType (bar, line, pie, etc)\n- table (boolean)\n- data (array of objects, for chart/table)\n- colors (array of hex)\n- narrative (string)\n- editable (boolean)`
  }
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a world-class marketing strategist and executive presentation designer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 1200,
  })
  // Try to parse JSON from the response
  const text = completion.choices[0]?.message?.content || ''
  try {
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']') + 1
    const json = text.slice(jsonStart, jsonEnd)
    return JSON.parse(json)
  } catch {
    return text
  }
}

// NEW: Update an existing deck plan with user edits (without redoing the whole deck)
export async function updateDeckPlan({
  currentPlan,
  userEdit,
  goals,
  context,
  keyQuestions
}: {
  currentPlan: any[],
  userEdit: string,
  goals?: string,
  context?: string,
  keyQuestions?: string
}): Promise<any> {
  const prompt = `
You are a world-class marketing strategist and executive presentation designer.
Given the current deck plan (JSON below) and the user's edit request, update ONLY the relevant slides or sections. Do NOT redo the whole plan—make minimal, precise changes.

Current Plan:
${JSON.stringify(currentPlan, null, 2)}

User Edit (plain English):
${userEdit}

${goals ? `Updated Goals: ${goals}` : ''}
${context ? `Updated Context: ${context}` : ''}
${keyQuestions ? `Updated Key Questions: ${keyQuestions}` : ''}

Output the updated plan as a JSON array of slides, each with: { type, title, purpose, keyQuestions, chartType, notes }
`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a world-class marketing strategist and executive presentation designer.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.4,
    max_tokens: 1200
  })
  // Try to parse JSON from the response
  const text = completion.choices[0]?.message?.content || ''
  try {
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']') + 1
    const json = text.slice(jsonStart, jsonEnd)
    return JSON.parse(json)
  } catch {
    return text
  }
}

// Feedback loop: up to 20 rounds of user feedback for deck refinement
export async function feedbackLoopDeckPlan({
  initialPlan,
  feedbacks,
  goals,
  context,
  keyQuestions
}: {
  initialPlan: any[],
  feedbacks: string[],
  goals?: string,
  context?: string,
  keyQuestions?: string
}): Promise<any[]> {
  let plan = initialPlan;
  for (let i = 0; i < Math.min(feedbacks.length, 20); i++) {
    const userEdit = feedbacks[i];
    plan = await updateDeckPlan({
      currentPlan: plan,
      userEdit,
      goals,
      context,
      keyQuestions,
    });
  }
  return plan;
}

// Helper functions to extract and analyze data
function extractDataFromSources(dataSources: any[]) {
  // TODO: Parse CSV/Excel data, calculate metrics, return structured data
  return {}
}

function buildPrompt(slideType: string, data: any, q: any) {
  return `
    Slide Type: ${slideType}
    Data: ${JSON.stringify(data)}
    Description: ${q.description}
    Key Variables: ${q.keyVariables}
    Context: ${q.context}
    Goal: ${q.goal}
    Key Point: ${q.keyPoint}
    ---
    Write a compelling, data-driven narrative for this slide, tailored for an executive audience. Use the data and context above. If the data is insufficient, explain what is missing.`
}