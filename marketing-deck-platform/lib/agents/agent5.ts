import OpenAI from 'openai';
import { EventLogger } from '@/lib/services/event-logger';
import { ValidationError } from './agent1';
import agent5Schema from './schemas/agent5.schema.json';

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

export async function agent5(input: any): Promise<any> {
  try {
    await EventLogger.logSystemEvent('agent5_started', { input }, 'info');
    
    const systemPrompt = `You are a presentation finalizer. Combine styled slides and chart data into final, production-ready presentation slides with complete specifications.

Your response MUST be valid JSON matching this exact structure:
{
  "finalSlides": [
    {
      "id": "slide_1",
      "title": "Slide Title",
      "content": "Main slide content",
      "layout": {
        "template": "title|content|two-column|chart|image|conclusion",
        "dimensions": {"width": 1920, "height": 1080}
      },
      "styling": {
        "theme": "professional|modern|creative|minimal",
        "colors": {
          "primary": "#1f2937",
          "secondary": "#3b82f6",
          "background": "#ffffff", 
          "text": "#111827"
        },
        "typography": {
          "heading": {"family": "Inter", "size": "24px", "weight": "600"},
          "body": {"family": "Inter", "size": "16px", "weight": "400"}
        }
      },
      "elements": [
        {
          "id": "element_1",
          "type": "text|image|chart|bullet-list|shape|table",
          "position": {"x": 100, "y": 150, "width": 800, "height": 400},
          "content": "Element content or structured data",
          "styling": {
            "color": "#111827",
            "fontSize": "16px",
            "fontWeight": "400",
            "textAlign": "left"
          }
        }
      ],
      "animations": {
        "entrance": "fade-in",
        "emphasis": "pulse",
        "exit": "fade-out"
      },
      "speakerNotes": "Speaker notes for this slide"
    }
  ],
  "metadata": {
    "totalSlides": 8,
    "presentationTitle": "Business Analysis Presentation",
    "createdAt": "2024-01-01T00:00:00Z",
    "theme": "professional"
  }
}

Create polished, production-ready slides with complete styling, positioning, and content specifications.`;

    const userPrompt = `Finalize these presentation elements into production-ready slides:

Styled Slides: ${JSON.stringify(input.styledSlides || [])}
Chart Data: ${JSON.stringify(input.chartData || {})}
Additional Context: ${JSON.stringify(input.context || {})}

Create complete, final slides with precise positioning, professional styling, animations, and speaker notes. Integrate charts where appropriate and ensure consistent design across all slides.`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new ValidationError('OpenAI returned empty content');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      await EventLogger.logSystemEvent('agent5_parse_error', { content, error: parseError }, 'error');
      throw new ValidationError('Failed to parse OpenAI response as JSON', agent5Schema, content);
    }

    if (!validateAgainstSchema(parsedResponse, agent5Schema)) {
      await EventLogger.logSystemEvent('agent5_validation_error', { parsedResponse, schema: agent5Schema }, 'error');
      throw new ValidationError('Response does not match expected schema', agent5Schema, parsedResponse);
    }

    await EventLogger.logSystemEvent('agent5_completed', { success: true }, 'info');
    return parsedResponse;

  } catch (error) {
    await EventLogger.logSystemEvent('agent5_error', { error: error.message }, 'error');
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`Agent5 processing failed: ${error.message}`);
  }
}