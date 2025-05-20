import { createTheme, responsiveFontSizes } from '@mui/material';
import type { ThemeOptions } from '@mui/material/styles';

// Extend the theme to include custom properties
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

// Define theme options
const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      letterSpacing: '-0.015625em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.015625em',
      lineHeight: 1.2
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      letterSpacing: '-0.015625em',
      lineHeight: 1.2
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '-0.015625em',
      lineHeight: 1.2
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '-0.015625em',
      lineHeight: 1.2
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '-0.015625em',
      lineHeight: 1.2
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43
    },
    button: {
      fontWeight: 500,
      textTransform: 'none'
    }
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width:600px)': {
            paddingLeft: '24px',
            paddingRight: '24px'
          },
          '@media (min-width:960px)': {
            paddingLeft: '32px',
            paddingRight: '32px'
          }
        }
      },
      variants: [
        {
          props: { maxWidth: 'lg' },
          style: {
            '@media (min-width:1280px)': {
              maxWidth: '1280px'
            },
            '@media (min-width:1536px)': {
              maxWidth: '1400px'
            }
          }
        },
        {
          props: { maxWidth: 'xl' },
          style: {
            '@media (min-width:1536px)': {
              maxWidth: '1500px'
            }
          }
        }
      ]
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderRadius: '4px',
          '@media (min-width:600px)': {
            padding: '24px'
          },
          '@media (min-width:960px)': {
            padding: '32px'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          borderRadius: '8px',
          marginBottom: '16px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          '@media (min-width:600px)': {
            padding: '24px'
          },
          '@media (min-width:960px)': {
            marginBottom: '24px'
          },
          '@media (min-width:1280px)': {
            marginBottom: '32px',
            padding: '32px'
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          padding: 16,
          '@media (min-width:1280px)': {
            padding: 24,
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        container: {
          margin: 0,
          width: '100%',
          '@media (min-width:1280px)': {
            rowGap: 24,
            columnGap: 24
          },
          '@media (min-width:1536px)': {
            rowGap: 32,
            columnGap: 32
          }
        }
      }
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'normal',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          marginBottom: '1rem',
          '@media (min-width:960px)': {
            marginBottom: '1.25rem'
          },
          '@media (min-width:1280px)': {
            marginBottom: '1.5rem'
          }
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-gutterBottom': {
            marginBottom: '1.5rem',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
  },
};

// Create the base theme with proper typing
const baseTheme = createTheme(themeOptions);

// Apply responsive font sizes to the theme
const theme = responsiveFontSizes(baseTheme);

// Export the theme with proper typing
export type AppTheme = typeof theme;
export default theme;
