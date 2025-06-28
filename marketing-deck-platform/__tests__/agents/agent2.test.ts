import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { agent2 } from '@/lib/agents/agent2';
import { ValidationError } from '@/lib/agents/agent1';

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
jest.mock('@/lib/services/event-logger', () => ({
  EventLogger: {
    logSystemEvent: jest.fn()
  }
}));

describe('Agent2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should return valid JSON with storyArc and slides', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            storyArc: {
              narrative: "Comprehensive business growth narrative",
              theme: "Growth and Innovation",
              objectives: ["Increase revenue", "Improve efficiency", "Expand market share"]
            },
            slides: [
              {
                id: "slide_1",
                title: "Executive Summary",
                content: "Overview of key findings and recommendations",
                type: "title",
                bulletPoints: ["Key finding 1", "Key finding 2", "Key finding 3"]
              },
              {
                id: "slide_2", 
                title: "Market Analysis",
                content: "Detailed market analysis and trends",
                type: "content",
                bulletPoints: ["Market trend 1", "Market trend 2"]
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = {
      summary: "Business analysis summary",
      keyInsights: [{ title: "Growth opportunity", description: "25% growth potential" }]
    };
    
    const result = await agent2(input);

    expect(result).toHaveProperty('storyArc');
    expect(result).toHaveProperty('slides');
    expect(result.storyArc).toHaveProperty('narrative');
    expect(result.storyArc).toHaveProperty('theme');
    expect(result.storyArc).toHaveProperty('objectives');
    expect(Array.isArray(result.storyArc.objectives)).toBe(true);
    expect(Array.isArray(result.slides)).toBe(true);
    expect(result.slides).toHaveLength(2);
  });

  it('should validate slide structure correctly', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            storyArc: {
              narrative: "Test narrative",
              theme: "Test theme", 
              objectives: ["Objective 1", "Objective 2"]
            },
            slides: [
              {
                id: "slide_1",
                title: "Test Slide",
                content: "Test content",
                type: "content",
                bulletPoints: ["Point 1", "Point 2"]
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { summary: "test" };
    const result = await agent2(input);

    expect(result.slides[0]).toHaveProperty('id');
    expect(result.slides[0]).toHaveProperty('title');
    expect(result.slides[0]).toHaveProperty('content');
    expect(result.slides[0]).toHaveProperty('type');
    expect(result.slides[0].type).toBe('content');
    expect(Array.isArray(result.slides[0].bulletPoints)).toBe(true);
  });

  it('should throw ValidationError when OpenAI returns invalid JSON', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON'
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { summary: "test summary" };
    
    await expect(agent2(input)).rejects.toThrow(ValidationError);
    await expect(agent2(input)).rejects.toThrow('Failed to parse OpenAI response as JSON');
  });

  it('should throw ValidationError when missing required fields', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            // Missing storyArc and slides
            invalidField: "test"
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { summary: "test" };
    
    await expect(agent2(input)).rejects.toThrow(ValidationError);
    await expect(agent2(input)).rejects.toThrow('Response does not match expected schema');
  });

  it('should handle different slide types', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            storyArc: {
              narrative: "Multi-slide narrative",
              theme: "Professional",
              objectives: ["Objective 1"]
            },
            slides: [
              {
                id: "slide_title",
                title: "Title Slide",
                content: "Presentation title",
                type: "title",
                bulletPoints: []
              },
              {
                id: "slide_chart",
                title: "Chart Analysis",
                content: "Data visualization",
                type: "chart",
                bulletPoints: ["Data point 1", "Data point 2"]
              },
              {
                id: "slide_conclusion",
                title: "Conclusions",
                content: "Key takeaways",
                type: "conclusion",
                bulletPoints: ["Takeaway 1", "Takeaway 2"]
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { summary: "comprehensive analysis" };
    const result = await agent2(input);

    expect(result.slides).toHaveLength(3);
    expect(result.slides[0].type).toBe('title');
    expect(result.slides[1].type).toBe('chart'); 
    expect(result.slides[2].type).toBe('conclusion');
  });

  it('should handle API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const input = { summary: "test" };
    
    await expect(agent2(input)).rejects.toThrow(ValidationError);
    await expect(agent2(input)).rejects.toThrow('Agent2 processing failed: Network error');
  });
});