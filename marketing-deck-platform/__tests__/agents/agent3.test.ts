import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { agent3 } from '@/lib/agents/agent3';
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

describe('Agent3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should return valid styled slides with layouts and styling', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            styledSlides: [
              {
                id: "slide_1",
                title: "Executive Summary",
                content: "Key findings and recommendations",
                layout: {
                  template: "title",
                  elements: [
                    {
                      type: "text",
                      position: { x: 100, y: 150, width: 800, height: 100 },
                      content: "Executive Summary Content"
                    }
                  ]
                },
                styling: {
                  theme: "professional",
                  colors: {
                    primary: "#1f2937",
                    secondary: "#3b82f6",
                    background: "#ffffff"
                  },
                  fonts: {
                    heading: "Inter",
                    body: "Inter"
                  }
                }
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = {
      slides: [
        { id: "slide_1", title: "Test", content: "Test content", type: "title" }
      ]
    };
    
    const result = await agent3(input);

    expect(result).toHaveProperty('styledSlides');
    expect(Array.isArray(result.styledSlides)).toBe(true);
    expect(result.styledSlides).toHaveLength(1);
    
    const slide = result.styledSlides[0];
    expect(slide).toHaveProperty('id');
    expect(slide).toHaveProperty('title');
    expect(slide).toHaveProperty('content');
    expect(slide).toHaveProperty('layout');
    expect(slide).toHaveProperty('styling');
  });

  it('should validate layout structure correctly', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            styledSlides: [
              {
                id: "slide_1",
                title: "Test Slide",
                content: "Test content",
                layout: {
                  template: "two-column",
                  elements: [
                    {
                      type: "text",
                      position: { x: 50, y: 100, width: 400, height: 200 },
                      content: "Left column content"
                    },
                    {
                      type: "chart", 
                      position: { x: 500, y: 100, width: 400, height: 200 },
                      content: "Chart placeholder"
                    }
                  ]
                },
                styling: {
                  theme: "modern",
                  colors: {
                    primary: "#2563eb",
                    secondary: "#7c3aed", 
                    background: "#f8fafc"
                  },
                  fonts: {
                    heading: "Inter",
                    body: "Inter"
                  }
                }
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { slides: [{ id: "slide_1", title: "Test" }] };
    const result = await agent3(input);

    const slide = result.styledSlides[0];
    expect(slide.layout).toHaveProperty('template');
    expect(slide.layout).toHaveProperty('elements');
    expect(slide.layout.template).toBe('two-column');
    expect(Array.isArray(slide.layout.elements)).toBe(true);
    expect(slide.layout.elements).toHaveLength(2);
    
    const element = slide.layout.elements[0];
    expect(element).toHaveProperty('type');
    expect(element).toHaveProperty('position');
    expect(element.position).toHaveProperty('x');
    expect(element.position).toHaveProperty('y');
    expect(element.position).toHaveProperty('width');
    expect(element.position).toHaveProperty('height');
  });

  it('should validate styling structure correctly', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            styledSlides: [
              {
                id: "slide_1",
                title: "Styled Slide",
                content: "Content with styling",
                layout: {
                  template: "content",
                  elements: [
                    {
                      type: "text",
                      position: { x: 0, y: 0, width: 100, height: 50 },
                      content: "Text content"
                    }
                  ]
                },
                styling: {
                  theme: "creative",
                  colors: {
                    primary: "#dc2626",
                    secondary: "#f59e0b",
                    background: "#fef3c7"
                  },
                  fonts: {
                    heading: "Poppins",
                    body: "Source Sans Pro"
                  }
                }
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { slides: [{ id: "slide_1" }] };
    const result = await agent3(input);

    const styling = result.styledSlides[0].styling;
    expect(styling).toHaveProperty('theme');
    expect(styling).toHaveProperty('colors');
    expect(styling).toHaveProperty('fonts');
    expect(styling.theme).toBe('creative');
    expect(styling.colors).toHaveProperty('primary');
    expect(styling.colors).toHaveProperty('secondary');
    expect(styling.colors).toHaveProperty('background');
    expect(styling.fonts).toHaveProperty('heading');
    expect(styling.fonts).toHaveProperty('body');
  });

  it('should handle different template types', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            styledSlides: [
              {
                id: "slide_title",
                title: "Title Slide",
                content: "Title content",
                layout: {
                  template: "title",
                  elements: []
                },
                styling: {
                  theme: "professional",
                  colors: { primary: "#000", secondary: "#666", background: "#fff" },
                  fonts: { heading: "Inter", body: "Inter" }
                }
              },
              {
                id: "slide_chart",
                title: "Chart Slide", 
                content: "Chart content",
                layout: {
                  template: "chart",
                  elements: []
                },
                styling: {
                  theme: "modern",
                  colors: { primary: "#000", secondary: "#666", background: "#fff" },
                  fonts: { heading: "Inter", body: "Inter" }
                }
              },
              {
                id: "slide_image",
                title: "Image Slide",
                content: "Image content", 
                layout: {
                  template: "image",
                  elements: []
                },
                styling: {
                  theme: "minimal",
                  colors: { primary: "#000", secondary: "#666", background: "#fff" },
                  fonts: { heading: "Inter", body: "Inter" }
                }
              }
            ]
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { slides: [{ id: "slide_1" }, { id: "slide_2" }, { id: "slide_3" }] };
    const result = await agent3(input);

    expect(result.styledSlides).toHaveLength(3);
    expect(result.styledSlides[0].layout.template).toBe('title');
    expect(result.styledSlides[1].layout.template).toBe('chart');
    expect(result.styledSlides[2].layout.template).toBe('image');
  });

  it('should throw ValidationError when response is invalid JSON', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON response'
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { slides: [] };
    
    await expect(agent3(input)).rejects.toThrow(ValidationError);
    await expect(agent3(input)).rejects.toThrow('Failed to parse OpenAI response as JSON');
  });

  it('should throw ValidationError when schema validation fails', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            // Missing styledSlides field
            invalidField: "test"
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { slides: [] };
    
    await expect(agent3(input)).rejects.toThrow(ValidationError);
    await expect(agent3(input)).rejects.toThrow('Response does not match expected schema');
  });

  it('should handle API errors', async () => {
    mockCreate.mockRejectedValue(new Error('OpenAI API Error'));

    const input = { slides: [] };
    
    await expect(agent3(input)).rejects.toThrow(ValidationError);
    await expect(agent3(input)).rejects.toThrow('Agent3 processing failed: OpenAI API Error');
  });
});