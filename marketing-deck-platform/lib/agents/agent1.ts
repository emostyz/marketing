import OpenAI from 'openai';
import { EventLogger } from '@/lib/services/event-logger';
import agent1Schema from './schemas/agent1.schema.json';

export class ValidationError extends Error {
  constructor(message: string, public schema?: any, public data?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateAgainstSchema(data: any, schema: any): boolean {
  try {
    // Basic JSON schema validation
    if (schema.type === 'object' && typeof data !== 'object') {
      return false;
    }
    
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          return false;
        }
      }
    }
    
    // Validate properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const propValue = data[key];
          const prop = propSchema as any;
          
          if (prop.type === 'array' && !Array.isArray(propValue)) {
            return false;
          }
          
          if (prop.type === 'string' && typeof propValue !== 'string') {
            return false;
          }
          
          if (prop.type === 'number' && typeof propValue !== 'number') {
            return false;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function agent1(input: any): Promise<any> {
  try {
    await EventLogger.logSystemEvent('agent1_started', { input }, 'info');
    
    const systemPrompt = `You are a senior business analyst. Analyze the provided data and generate a comprehensive business summary with key insights and story arcs for a presentation. 

Your response MUST be valid JSON matching this exact structure:
{
  "summary": "Executive summary of the data analysis",
  "keyInsights": [
    {
      "title": "Insight title",
      "description": "Detailed insight description", 
      "confidence": 85,
      "impact": "high"
    }
  ],
  "storyArcs": [
    {
      "narrative": "Story narrative",
      "theme": "Presentation theme",
      "slides": [
        {
          "title": "Slide title",
          "content": "Slide content"
        }
      ]
    }
  ]
}

Analyze the data patterns, identify key business insights, and create compelling story arcs for presentation slides. Focus on actionable insights and clear narratives.`;

    const userPrompt = `Analyze this business data and provide insights: ${JSON.stringify(input)}

Generate a comprehensive summary with 3-5 key insights and 2-3 story arcs for presentation slides.`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new ValidationError('OpenAI returned empty content');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      await EventLogger.logSystemEvent('agent1_parse_error', { content, error: parseError }, 'error');
      throw new ValidationError('Failed to parse OpenAI response as JSON', agent1Schema, content);
    }

    // Validate against schema
    if (!validateAgainstSchema(parsedResponse, agent1Schema)) {
      await EventLogger.logSystemEvent('agent1_validation_error', { parsedResponse, schema: agent1Schema }, 'error');
      throw new ValidationError('Response does not match expected schema', agent1Schema, parsedResponse);
    }

    await EventLogger.logSystemEvent('agent1_completed', { success: true }, 'info');
    return parsedResponse;

  } catch (error) {
    await EventLogger.logSystemEvent('agent1_error', { error: error.message }, 'error');
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`Agent1 processing failed: ${error.message}`);
  }
}