export const designTokens = {
  colors: {
    // Modern palette inspired by Google Workspace
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#f1f3f4',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    
    surface: {
      default: '#ffffff',
      hover: '#f8f9fa',
      active: '#e8eaed',
      selected: '#e8f0fe',
      disabled: '#f8f9fa'
    },
    
    border: {
      default: '#dadce0',
      hover: '#5f6368',
      focus: '#1a73e8',
      error: '#d93025'
    },
    
    text: {
      primary: '#202124',
      secondary: '#5f6368',
      tertiary: '#80868b',
      disabled: '#80868b',
      inverse: '#ffffff',
      link: '#1a73e8'
    },
    
    brand: {
      primary: '#1a73e8',
      primaryHover: '#1765cc',
      primaryActive: '#1557b0',
      secondary: '#34a853',
      warning: '#fbbc04',
      error: '#ea4335',
      info: '#4285f4'
    },
    
    semantic: {
      success: {
        background: '#e6f4ea',
        border: '#34a853',
        text: '#137333'
      },
      warning: {
        background: '#fef7e0',
        border: '#fbbc04',
        text: '#b06000'
      },
      error: {
        background: '#fce8e6',
        border: '#ea4335',
        text: '#c5221f'
      },
      info: {
        background: '#e8f0fe',
        border: '#4285f4',
        text: '#1967d2'
      }
    }
  },
  
  typography: {
    fontFamily: {
      sans: '"Google Sans", "Helvetica Neue", Arial, sans-serif',
      mono: '"Google Sans Mono", "Roboto Mono", monospace'
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },
  
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    full: '9999px'
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
    base: '0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
    md: '0 2px 6px 2px rgba(60, 64, 67, 0.15)',
    lg: '0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
    xl: '0 4px 16px 6px rgba(60, 64, 67, 0.15)',
    '2xl': '0 8px 24px 8px rgba(60, 64, 67, 0.15)',
    floating: '0 12px 32px 0 rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    slower: '500ms ease'
  },
  
  zIndices: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700
  }
}