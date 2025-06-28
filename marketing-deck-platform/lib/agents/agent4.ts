import OpenAI from 'openai';
import { EventLogger } from '@/lib/services/event-logger';
import { ValidationError } from './agent1';
import agent4Schema from './schemas/agent4.schema.json';

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

export async function agent4(input: any): Promise<any> {
  try {
    await EventLogger.logSystemEvent('agent4_started', { input }, 'info');
    
    const systemPrompt = `You are a data visualization expert. Generate chart configurations for presentation slides based on the provided data and styled slides.

Your response MUST be valid JSON matching this exact structure:
{
  "chartData": {
    "charts": [
      {
        "id": "chart_1",
        "type": "bar|line|pie|scatter|area|treemap",
        "title": "Chart Title", 
        "data": {
          "labels": ["Label 1", "Label 2", "Label 3"],
          "datasets": [
            {
              "label": "Dataset Label",
              "data": [10, 20, 30],
              "backgroundColor": "#3b82f6",
              "borderColor": "#1d4ed8"
            }
          ]
        },
        "config": {
          "responsive": true,
          "maintainAspectRatio": false,
          "animation": true
        },
        "slideId": "slide_1"
      }
    ],
    "metadata": {
      "totalCharts": 3,
      "primaryInsight": "Key insight from charts",
      "dataSource": "Business data analysis"
    }
  }
}

Create interactive, professional charts that support the presentation narrative and highlight key business insights.`;

    const userPrompt = `Generate chart configurations for these styled slides and business data:

Styled Slides: ${JSON.stringify(input.styledSlides || input)}
Original Data: ${JSON.stringify(input.originalData || {})}

Create 2-4 relevant charts that visualize key data points and support the presentation story. Use appropriate chart types for the data and ensure professional styling.`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
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
      await EventLogger.logSystemEvent('agent4_parse_error', { content, error: parseError }, 'error');
      throw new ValidationError('Failed to parse OpenAI response as JSON', agent4Schema, content);
    }

    if (!validateAgainstSchema(parsedResponse, agent4Schema)) {
      await EventLogger.logSystemEvent('agent4_validation_error', { parsedResponse, schema: agent4Schema }, 'error');
      throw new ValidationError('Response does not match expected schema', agent4Schema, parsedResponse);
    }

    await EventLogger.logSystemEvent('agent4_completed', { success: true }, 'info');
    return parsedResponse;

  } catch (error) {
    await EventLogger.logSystemEvent('agent4_error', { error: error.message }, 'error');
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`Agent4 processing failed: ${error.message}`);
  }
}