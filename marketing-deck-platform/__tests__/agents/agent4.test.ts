import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { agent4 } from '@/lib/agents/agent4';
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

describe('Agent4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should return valid chart data configurations', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            chartData: {
              charts: [
                {
                  id: "chart_1",
                  type: "bar",
                  title: "Revenue by Quarter",
                  data: {
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: [
                      {
                        label: "Revenue",
                        data: [100000, 120000, 150000, 180000],
                        backgroundColor: "#3b82f6",
                        borderColor: "#1d4ed8"
                      }
                    ]
                  },
                  config: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: true
                  },
                  slideId: "slide_2"
                }
              ],
              metadata: {
                totalCharts: 1,
                primaryInsight: "Strong revenue growth across all quarters",
                dataSource: "Business analytics"
              }
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = {
      styledSlides: [
        { id: "slide_1", title: "Overview" },
        { id: "slide_2", title: "Revenue Analysis" }
      ],
      originalData: [
        { quarter: "Q1", revenue: 100000 },
        { quarter: "Q2", revenue: 120000 }
      ]
    };
    
    const result = await agent4(input);

    expect(result).toHaveProperty('chartData');
    expect(result.chartData).toHaveProperty('charts');
    expect(result.chartData).toHaveProperty('metadata');
    expect(Array.isArray(result.chartData.charts)).toBe(true);
    expect(result.chartData.charts).toHaveLength(1);
  });

  it('should validate chart structure correctly', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            chartData: {
              charts: [
                {
                  id: "chart_revenue",
                  type: "line",
                  title: "Revenue Trend",
                  data: {
                    labels: ["Jan", "Feb", "Mar"],
                    datasets: [
                      {
                        label: "Monthly Revenue",
                        data: [50000, 60000, 75000],
                        backgroundColor: "#10b981",
                        borderColor: "#059669"
                      }
                    ]
                  },
                  config: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: false
                  },
                  slideId: "slide_1"
                }
              ],
              metadata: {
                totalCharts: 1,
                primaryInsight: "Steady revenue growth",
                dataSource: "Financial data"
              }
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    const result = await agent4(input);

    const chart = result.chartData.charts[0];
    expect(chart).toHaveProperty('id');
    expect(chart).toHaveProperty('type');
    expect(chart).toHaveProperty('title');
    expect(chart).toHaveProperty('data');
    expect(chart).toHaveProperty('config');
    expect(chart).toHaveProperty('slideId');
    
    expect(chart.data).toHaveProperty('labels');
    expect(chart.data).toHaveProperty('datasets');
    expect(Array.isArray(chart.data.labels)).toBe(true);
    expect(Array.isArray(chart.data.datasets)).toBe(true);
    
    const dataset = chart.data.datasets[0];
    expect(dataset).toHaveProperty('label');
    expect(dataset).toHaveProperty('data');
    expect(Array.isArray(dataset.data)).toBe(true);
  });

  it('should handle multiple chart types', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            chartData: {
              charts: [
                {
                  id: "chart_pie",
                  type: "pie",
                  title: "Market Share",
                  data: {
                    labels: ["Product A", "Product B", "Product C"],
                    datasets: [
                      {
                        label: "Market Share",
                        data: [40, 35, 25]
                      }
                    ]
                  },
                  config: { responsive: true, maintainAspectRatio: false, animation: true },
                  slideId: "slide_1"
                },
                {
                  id: "chart_scatter",
                  type: "scatter",
                  title: "Performance vs Cost",
                  data: {
                    labels: ["Data Points"],
                    datasets: [
                      {
                        label: "Performance",
                        data: [10, 15, 20, 25]
                      }
                    ]
                  },
                  config: { responsive: true, maintainAspectRatio: false, animation: true },
                  slideId: "slide_2"
                },
                {
                  id: "chart_area",
                  type: "area",
                  title: "Growth Trend",
                  data: {
                    labels: ["2021", "2022", "2023", "2024"],
                    datasets: [
                      {
                        label: "Growth",
                        data: [100, 150, 200, 300]
                      }
                    ]
                  },
                  config: { responsive: true, maintainAspectRatio: false, animation: true },
                  slideId: "slide_3"
                }
              ],
              metadata: {
                totalCharts: 3,
                primaryInsight: "Multi-dimensional analysis shows strong performance",
                dataSource: "Comprehensive business data"
              }
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    const result = await agent4(input);

    expect(result.chartData.charts).toHaveLength(3);
    expect(result.chartData.charts[0].type).toBe('pie');
    expect(result.chartData.charts[1].type).toBe('scatter');
    expect(result.chartData.charts[2].type).toBe('area');
    expect(result.chartData.metadata.totalCharts).toBe(3);
  });

  it('should validate metadata structure', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            chartData: {
              charts: [
                {
                  id: "chart_1",
                  type: "bar",
                  title: "Test Chart",
                  data: {
                    labels: ["A", "B"],
                    datasets: [{ label: "Test", data: [1, 2] }]
                  },
                  config: { responsive: true, maintainAspectRatio: false, animation: true },
                  slideId: "slide_1"
                }
              ],
              metadata: {
                totalCharts: 1,
                primaryInsight: "Key insight from data visualization",
                dataSource: "Business intelligence platform"
              }
            }
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    const result = await agent4(input);

    const metadata = result.chartData.metadata;
    expect(metadata).toHaveProperty('totalCharts');
    expect(metadata).toHaveProperty('primaryInsight');
    expect(metadata).toHaveProperty('dataSource');
    expect(typeof metadata.totalCharts).toBe('number');
    expect(typeof metadata.primaryInsight).toBe('string');
    expect(typeof metadata.dataSource).toBe('string');
  });

  it('should throw ValidationError when response is invalid JSON', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'This is not valid JSON'
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    
    await expect(agent4(input)).rejects.toThrow(ValidationError);
    await expect(agent4(input)).rejects.toThrow('Failed to parse OpenAI response as JSON');
  });

  it('should throw ValidationError when schema validation fails', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            // Missing chartData field
            invalidStructure: "test"
          })
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    
    await expect(agent4(input)).rejects.toThrow(ValidationError);
    await expect(agent4(input)).rejects.toThrow('Response does not match expected schema');
  });

  it('should handle OpenAI API errors', async () => {
    mockCreate.mockRejectedValue(new Error('Rate limit exceeded'));

    const input = { styledSlides: [] };
    
    await expect(agent4(input)).rejects.toThrow(ValidationError);
    await expect(agent4(input)).rejects.toThrow('Agent4 processing failed: Rate limit exceeded');
  });

  it('should handle empty content from OpenAI', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: null
        }
      }]
    };

    mockCreate.mockResolvedValue(mockResponse);

    const input = { styledSlides: [] };
    
    await expect(agent4(input)).rejects.toThrow(ValidationError);
    await expect(agent4(input)).rejects.toThrow('OpenAI returned empty content');
  });
});