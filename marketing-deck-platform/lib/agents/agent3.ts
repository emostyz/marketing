import OpenAI from 'openai';
import { EventLogger } from '@/lib/services/event-logger';
import { ValidationError } from './agent1';
import agent3Schema from './schemas/agent3.schema.json';

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
          
          if (prop.type === 'object' && typeof propValue !== 'object') {
            return false;
          }
          
          if (prop.type === 'string' && typeof propValue !== 'string') {
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

export async function agent3(input: any): Promise<any> {
  try {
    await EventLogger.logSystemEvent('agent3_started', { input }, 'info');
    
    const systemPrompt = `You are a visual design expert. Transform structured slides into styled slides with layouts and visual design specifications.

Your response MUST be valid JSON matching this exact structure:
{
  "styledSlides": [
    {
      "id": "slide_1",
      "title": "Slide Title",
      "content": "Slide content",
      "layout": {
        "template": "title|content|two-column|chart|image",
        "elements": [
          {
            "type": "text|image|chart|bullet-list",
            "position": {"x": 0, "y": 0, "width": 100, "height": 50},
            "content": "Element content"
          }
        ]
      },
      "styling": {
        "theme": "professional|modern|creative|minimal",
        "colors": {
          "primary": "#1f2937",
          "secondary": "#3b82f6", 
          "background": "#ffffff"
        },
        "fonts": {
          "heading": "Inter",
          "body": "Inter"
        }
      }
    }
  ]
}

Design professional, visually appealing slides with appropriate layouts and styling for business presentations.`;

    const userPrompt = `Transform these structured slides into styled slides with layouts and visual design:

${JSON.stringify(input)}

Create visually appealing layouts with professional styling, appropriate positioning, and modern design elements. Use professional color schemes and typography.`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new ValidationError('OpenAI returned empty content');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      await EventLogger.logSystemEvent('agent3_parse_error', { content, error: parseError }, 'error');
      throw new ValidationError('Failed to parse OpenAI response as JSON', agent3Schema, content);
    }

    if (!validateAgainstSchema(parsedResponse, agent3Schema)) {
      await EventLogger.logSystemEvent('agent3_validation_error', { parsedResponse, schema: agent3Schema }, 'error');
      throw new ValidationError('Response does not match expected schema', agent3Schema, parsedResponse);
    }

    await EventLogger.logSystemEvent('agent3_completed', { success: true }, 'info');
    return parsedResponse;

  } catch (error) {
    await EventLogger.logSystemEvent('agent3_error', { error: error.message }, 'error');
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`Agent3 processing failed: ${error.message}`);
  }
}