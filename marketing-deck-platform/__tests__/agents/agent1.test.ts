import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { agent1, ValidationError } from '../../lib/agents/agent1';

// Mock OpenAI
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

// Mock EventLogger
jest.mock('../../lib/services/event-logger', () => ({
  EventLogger: {
    logSystemEvent: jest.fn()
  }
}));

describe('Agent1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should return valid JSON when OpenAI responds correctly', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            summary: "Test executive summary",
            keyInsights: [
              {
                title: "Revenue Growth Opportunity",
                description: "Analysis shows 25% growth potential",
                confidence: 85,
                impact: "high"
              }
            ],
            storyArcs: [
              {
                narrative: "Growth story narrative",
                theme: "Professional growth",
                slides: [
                  {
                    title: "Revenue Analysis",
                    content: "Detailed revenue breakdown"
                  }
                ]
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { data: [{ revenue: 100000, quarter: "Q1" }] };
    const result = await agent1(input);

    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('keyInsights');
    expect(result).toHaveProperty('storyArcs');
    expect(Array.isArray(result.keyInsights)).toBe(true);
    expect(Array.isArray(result.storyArcs)).toBe(true);
    expect(result.summary).toBe("Test executive summary");
  });

  it('should throw ValidationError when OpenAI returns invalid JSON', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON response'
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { data: [{ revenue: 100000 }] };
    
    await expect(agent1(input)).rejects.toThrow(ValidationError);
    await expect(agent1(input)).rejects.toThrow('Failed to parse OpenAI response as JSON');
  });

  it('should throw ValidationError when response does not match schema', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            // Missing required fields
            invalidField: "test"
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { data: [{ revenue: 100000 }] };
    
    await expect(agent1(input)).rejects.toThrow(ValidationError);
    await expect(agent1(input)).rejects.toThrow('Response does not match expected schema');
  });

  it('should throw ValidationError when OpenAI returns empty content', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: null
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { data: [{ revenue: 100000 }] };
    
    await expect(agent1(input)).rejects.toThrow(ValidationError);
    await expect(agent1(input)).rejects.toThrow('OpenAI returned empty content');
  });

  it('should handle OpenAI API errors', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));

    const input = { data: [{ revenue: 100000 }] };
    
    await expect(agent1(input)).rejects.toThrow(ValidationError);
    await expect(agent1(input)).rejects.toThrow('Agent1 processing failed: API Error');
  });

  it('should validate keyInsights structure correctly', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            summary: "Test summary",
            keyInsights: [
              {
                title: "Test Insight",
                description: "Test description",
                confidence: 90,
                impact: "medium"
              },
              {
                title: "Another Insight", 
                description: "Another description",
                confidence: 75,
                impact: "high"
              }
            ],
            storyArcs: [
              {
                narrative: "Test narrative",
                theme: "Test theme",
                slides: [
                  {
                    title: "Test slide",
                    content: "Test content"
                  }
                ]
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { data: [{ revenue: 100000, quarter: "Q1" }] };
    const result = await agent1(input);

    expect(result.keyInsights).toHaveLength(2);
    expect(result.keyInsights[0]).toHaveProperty('title');
    expect(result.keyInsights[0]).toHaveProperty('description');
    expect(result.keyInsights[0]).toHaveProperty('confidence');
    expect(result.keyInsights[0]).toHaveProperty('impact');
    expect(typeof result.keyInsights[0].confidence).toBe('number');
  });
});