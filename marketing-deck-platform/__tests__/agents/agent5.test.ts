import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { agent5 } from '@/lib/agents/agent5';
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

describe('Agent5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should return complete final slides with all specifications', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            finalSlides: [
              {
                id: "slide_1",
                title: "Executive Summary",
                content: "Comprehensive overview of business analysis",
                layout: {
                  template: "title",
                  dimensions: { width: 1920, height: 1080 }
                },
                styling: {
                  theme: "professional",
                  colors: {
                    primary: "#1f2937",
                    secondary: "#3b82f6",
                    background: "#ffffff",
                    text: "#111827"
                  },
                  typography: {
                    heading: { family: "Inter", size: "32px", weight: "600" },
                    body: { family: "Inter", size: "16px", weight: "400" }
                  }
                },
                elements: [
                  {
                    id: "title_element",
                    type: "text",
                    position: { x: 100, y: 200, width: 1720, height: 100 },
                    content: "Executive Summary",
                    styling: {
                      color: "#1f2937",
                      fontSize: "32px",
                      fontWeight: "600",
                      textAlign: "center"
                    }
                  }
                ],
                animations: {
                  entrance: "fade-in",
                  emphasis: "pulse",
                  exit: "fade-out"
                },
                speakerNotes: "Introduction to the business analysis presentation"
              }
            ],
            metadata: {
              totalSlides: 1,
              presentationTitle: "Business Analysis 2024",
              createdAt: "2024-01-01T00:00:00Z",
              theme: "professional"
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = {
      styledSlides: [
        { id: "slide_1", title: "Summary", content: "Overview" }
      ],
      chartData: {
        charts: [
          { id: "chart_1", type: "bar", title: "Revenue" }
        ]
      }
    };
    
    const result = await agent5(input);

    expect(result).toHaveProperty('finalSlides');
    expect(result).toHaveProperty('metadata');
    expect(Array.isArray(result.finalSlides)).toBe(true);
    expect(result.finalSlides).toHaveLength(1);
    expect(result.metadata.totalSlides).toBe(1);
  });

  it('should validate complete slide structure', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            finalSlides: [
              {
                id: "slide_complete",
                title: "Complete Slide",
                content: "Fully specified slide content",
                layout: {
                  template: "two-column",
                  dimensions: { width: 1920, height: 1080 }
                },
                styling: {
                  theme: "modern",
                  colors: {
                    primary: "#2563eb",
                    secondary: "#7c3aed",
                    background: "#f8fafc",
                    text: "#1e293b"
                  },
                  typography: {
                    heading: { family: "Poppins", size: "28px", weight: "700" },
                    body: { family: "Open Sans", size: "14px", weight: "400" }
                  }
                },
                elements: [
                  {
                    id: "text_element",
                    type: "text",
                    position: { x: 50, y: 150, width: 800, height: 300 },
                    content: "Left column text content",
                    styling: {
                      color: "#1e293b",
                      fontSize: "16px",
                      fontWeight: "400",
                      textAlign: "left"
                    }
                  },
                  {
                    id: "chart_element",
                    type: "chart",
                    position: { x: 900, y: 150, width: 900, height: 400 },
                    content: { chartId: "chart_1" },
                    styling: {
                      color: "#2563eb",
                      fontSize: "14px",
                      fontWeight: "400",
                      textAlign: "center"
                    }
                  }
                ],
                animations: {
                  entrance: "slide-in-left",
                  emphasis: "bounce",
                  exit: "slide-out-right"
                },
                speakerNotes: "Detailed explanation of the two-column layout and chart analysis"
              }
            ],
            metadata: {
              totalSlides: 1,
              presentationTitle: "Advanced Business Analytics",
              createdAt: "2024-01-15T10:30:00Z",
              theme: "modern"
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [], chartData: {} };
    const result = await agent5(input);

    const slide = result.finalSlides[0];
    
    // Validate required fields
    expect(slide).toHaveProperty('id');
    expect(slide).toHaveProperty('title');
    expect(slide).toHaveProperty('content');
    expect(slide).toHaveProperty('layout');
    expect(slide).toHaveProperty('styling');
    expect(slide).toHaveProperty('elements');
    
    // Validate layout
    expect(slide.layout).toHaveProperty('template');
    expect(slide.layout).toHaveProperty('dimensions');
    expect(slide.layout.dimensions).toHaveProperty('width');
    expect(slide.layout.dimensions).toHaveProperty('height');
    
    // Validate styling
    expect(slide.styling).toHaveProperty('theme');
    expect(slide.styling).toHaveProperty('colors');
    expect(slide.styling).toHaveProperty('typography');
    expect(slide.styling.colors).toHaveProperty('primary');
    expect(slide.styling.colors).toHaveProperty('secondary');
    expect(slide.styling.colors).toHaveProperty('background');
    expect(slide.styling.colors).toHaveProperty('text');
    
    // Validate elements
    expect(Array.isArray(slide.elements)).toBe(true);
    expect(slide.elements).toHaveLength(2);
    
    const element = slide.elements[0];
    expect(element).toHaveProperty('id');
    expect(element).toHaveProperty('type');
    expect(element).toHaveProperty('position');
    expect(element).toHaveProperty('content');
    expect(element).toHaveProperty('styling');
  });

  it('should handle different element types', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            finalSlides: [
              {
                id: "slide_elements",
                title: "Multiple Elements",
                content: "Slide with various elements",
                layout: {
                  template: "content",
                  dimensions: { width: 1920, height: 1080 }
                },
                styling: {
                  theme: "creative",
                  colors: {
                    primary: "#dc2626",
                    secondary: "#f59e0b",
                    background: "#fef3c7",
                    text: "#92400e"
                  },
                  typography: {
                    heading: { family: "Playfair Display", size: "30px", weight: "700" },
                    body: { family: "Source Sans Pro", size: "16px", weight: "400" }
                  }
                },
                elements: [
                  {
                    id: "text_elem",
                    type: "text",
                    position: { x: 100, y: 100, width: 600, height: 100 },
                    content: "Text element content",
                    styling: { color: "#92400e", fontSize: "16px", fontWeight: "400", textAlign: "left" }
                  },
                  {
                    id: "bullet_elem", 
                    type: "bullet-list",
                    position: { x: 100, y: 250, width: 600, height: 200 },
                    content: ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
                    styling: { color: "#92400e", fontSize: "14px", fontWeight: "400", textAlign: "left" }
                  },
                  {
                    id: "shape_elem",
                    type: "shape",
                    position: { x: 800, y: 300, width: 200, height: 100 },
                    content: "rectangle",
                    styling: { color: "#dc2626", fontSize: "12px", fontWeight: "400", textAlign: "center" }
                  },
                  {
                    id: "table_elem",
                    type: "table",
                    position: { x: 100, y: 500, width: 800, height: 300 },
                    content: {
                      headers: ["Metric", "Q1", "Q2", "Q3"],
                      rows: [["Revenue", "100K", "120K", "150K"], ["Profit", "20K", "25K", "35K"]]
                    },
                    styling: { color: "#92400e", fontSize: "12px", fontWeight: "400", textAlign: "center" }
                  }
                ],
                animations: {
                  entrance: "zoom-in",
                  emphasis: "shake",
                  exit: "zoom-out"
                },
                speakerNotes: "Slide demonstrating various element types and creative styling"
              }
            ],
            metadata: {
              totalSlides: 1,
              presentationTitle: "Creative Elements Demo",
              createdAt: "2024-01-20T15:45:00Z",
              theme: "creative"
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    const result = await agent5(input);

    const elements = result.finalSlides[0].elements;
    expect(elements).toHaveLength(4);
    expect(elements[0].type).toBe('text');
    expect(elements[1].type).toBe('bullet-list');
    expect(elements[2].type).toBe('shape');
    expect(elements[3].type).toBe('table');
    
    // Validate bullet list content
    expect(Array.isArray(elements[1].content)).toBe(true);
    
    // Validate table content
    expect(elements[3].content).toHaveProperty('headers');
    expect(elements[3].content).toHaveProperty('rows');
  });

  it('should validate metadata structure', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            finalSlides: [
              {
                id: "slide_1",
                title: "Test",
                content: "Test content",
                layout: { template: "title", dimensions: { width: 1920, height: 1080 } },
                styling: {
                  theme: "minimal",
                  colors: { primary: "#000", secondary: "#666", background: "#fff", text: "#333" },
                  typography: {
                    heading: { family: "Arial", size: "24px", weight: "600" },
                    body: { family: "Arial", size: "16px", weight: "400" }
                  }
                },
                elements: [],
                animations: { entrance: "fade-in", emphasis: "pulse", exit: "fade-out" },
                speakerNotes: "Test notes"
              }
            ],
            metadata: {
              totalSlides: 1,
              presentationTitle: "Test Presentation",
              createdAt: "2024-01-01T12:00:00Z",
              theme: "minimal"
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    const result = await agent5(input);

    const metadata = result.metadata;
    expect(metadata).toHaveProperty('totalSlides');
    expect(metadata).toHaveProperty('presentationTitle');
    expect(metadata).toHaveProperty('createdAt');
    expect(metadata).toHaveProperty('theme');
    expect(typeof metadata.totalSlides).toBe('number');
    expect(typeof metadata.presentationTitle).toBe('string');
    expect(typeof metadata.createdAt).toBe('string');
    expect(typeof metadata.theme).toBe('string');
  });

  it('should throw ValidationError when response is invalid JSON', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Not a valid JSON response'
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    
    await expect(agent5(input)).rejects.toThrow(ValidationError);
    await expect(agent5(input)).rejects.toThrow('Failed to parse OpenAI response as JSON');
  });

  it('should throw ValidationError when schema validation fails', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            // Missing finalSlides field
            wrongStructure: "test"
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    
    await expect(agent5(input)).rejects.toThrow(ValidationError);
    await expect(agent5(input)).rejects.toThrow('Response does not match expected schema');
  });

  it('should handle API errors', async () => {
    mockCreate.mockRejectedValue(new Error('Service unavailable'));

    const input = { styledSlides: [] };
    
    await expect(agent5(input)).rejects.toThrow(ValidationError);
    await expect(agent5(input)).rejects.toThrow('Agent5 processing failed: Service unavailable');
  });

  it('should handle empty content response', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: null
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    
    await expect(agent5(input)).rejects.toThrow(ValidationError);
    await expect(agent5(input)).rejects.toThrow('OpenAI returned empty content');
  });
});