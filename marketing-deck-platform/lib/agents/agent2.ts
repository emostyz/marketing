import OpenAI from 'openai';
import { EventLogger } from '@/lib/services/event-logger';
import { ValidationError } from './agent1';
import agent2Schema from './schemas/agent2.schema.json';

function validateAgainstSchema(data: any, schema: any): boolean {
  try {
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
          
          if (prop.type === 'object' && typeof propValue !== 'object') {
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

export async function agent2(input: any): Promise<any> {
  try {
    await EventLogger.logSystemEvent('agent2_started', { input }, 'info');
    
    const systemPrompt = `You are a presentation architect. Transform business insights into a structured story arc with detailed slides.

Your response MUST be valid JSON matching this exact structure:
{
  "storyArc": {
    "narrative": "Main story narrative connecting all insights",
    "theme": "Professional presentation theme",
    "objectives": ["objective 1", "objective 2", "objective 3"]
  },
  "slides": [
    {
      "id": "slide_1",
      "title": "Slide Title",
      "content": "Main slide content that tells part of the story",
      "type": "title|content|chart|conclusion", 
      "bulletPoints": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ]
}

Create a coherent narrative flow and structure slides that build upon each other to tell a compelling business story.`;

    const userPrompt = `Based on these business insights, create a structured presentation with story arc and detailed slides:

${JSON.stringify(input)}

Create 6-8 slides that follow a logical narrative flow, starting with context, building through insights, and concluding with recommendations.`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new ValidationError('OpenAI returned empty content');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      await EventLogger.logSystemEvent('agent2_parse_error', { content, error: parseError }, 'error');
      throw new ValidationError('Failed to parse OpenAI response as JSON', agent2Schema, content);
    }

    if (!validateAgainstSchema(parsedResponse, agent2Schema)) {
      await EventLogger.logSystemEvent('agent2_validation_error', { parsedResponse, schema: agent2Schema }, 'error');
      throw new ValidationError('Response does not match expected schema', agent2Schema, parsedResponse);
    }

    await EventLogger.logSystemEvent('agent2_completed', { success: true }, 'info');
    return parsedResponse;

  } catch (error) {
    await EventLogger.logSystemEvent('agent2_error', { error: error.message }, 'error');
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`Agent2 processing failed: ${error.message}`);
  }
}