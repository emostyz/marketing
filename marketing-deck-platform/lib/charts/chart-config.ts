import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register all components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
  zoomPlugin,
  annotationPlugin
);

// Professional color palettes for marketing presentations
export const CHART_THEMES = {
  corporate: {
    primary: ['#1e40af', '#3730a3', '#6d28d9', '#a21caf', '#dc2626'],
    secondary: ['#60a5fa', '#818cf8', '#a78bfa', '#e879f9', '#f87171'],
    gradient: {
      from: ['#1e40af', '#3730a3', '#6d28d9'],
      to: ['#60a5fa', '#818cf8', '#a78bfa']
    }
  },
  modern: {
    primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'],
    secondary: ['#a5b4fc', '#c4b5fd', '#f9a8d4', '#fca5a5', '#fdba74'],
    gradient: {
      from: ['#6366f1', '#8b5cf6', '#ec4899'],
      to: ['#a5b4fc', '#c4b5fd', '#f9a8d4']
    }
  },
  vibrant: {
    primary: ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6', '#a855f7'],
    secondary: ['#67e8f9', '#7dd3fc', '#93bbfc', '#c4b5fd', '#d8b4fe'],
    gradient: {
      from: ['#06b6d4', '#3b82f6', '#8b5cf6'],
      to: ['#67e8f9', '#93bbfc', '#c4b5fd']
    }
  }
};

// Chart.js global defaults for professional appearance
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = '#334155';
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
// Note: Font sizes are configured individually in chart options

// Advanced chart configurations
export const CHART_CONFIGS = {
  line: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 500
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      datalabels: {
        display: false // Enable selectively
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x' as const,
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    }
  },
  
  bar: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      },
      datalabels: {
        display: true,
        align: 'end',
        anchor: 'end',
        formatter: (value: number) => {
          return new Intl.NumberFormat('en-US', {
            notation: 'compact'
          }).format(value);
        },
        font: {
          weight: 'bold',
          size: 11
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              notation: 'compact'
            }).format(value);
          }
        }
      }
    }
  },
  
  pie: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels && data.datasets) {
              const dataset = data.datasets[0];
              const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
              
              return data.labels.map((label: string, i: number) => {
                const value = dataset.data[i] as number;
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor?.[i] || '',
                  strokeStyle: dataset.borderColor?.[i] || '',
                  lineWidth: dataset.borderWidth || 0,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const value = dataset.data[context.dataIndex];
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value: number, ctx: any) => {
          const sum = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(0);
          return `${percentage}%`;
        }
      }
    }
  },
  
  doughnut: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const value = dataset.data[context.dataIndex];
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value: number, ctx: any) => {
          const sum = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(0);
          return `${percentage}%`;
        }
      }
    }
  },
  
  scatter: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: (${context.parsed.x}, ${context.parsed.y})`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      },
      y: {
        type: 'linear'
      }
    }
  },
  
  radar: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100
      }
    }
  }
};

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter';
export type ChartTheme = keyof typeof CHART_THEMES;