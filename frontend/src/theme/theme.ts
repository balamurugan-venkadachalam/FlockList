// Rule applied: Write concise, technical TypeScript code
import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles/createPalette';

// Define palette options with type safety
const palette: PaletteOptions = {
  primary: {
    main: '#3f51b5',
    light: '#757de8',
    dark: '#002984',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f50057',
    light: '#ff4081',
    dark: '#c51162',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
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
};

// Define theme options
const themeOptions: ThemeOptions = {
  palette,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  // Rule applied: Write concise, technical TypeScript code with accurate examples
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Responsive typography scaling for all breakpoints
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
      '@media (min-width:900px)': {
        fontSize: '3.5rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '4rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '4.5rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      '@media (min-width:600px)': {
        fontSize: '2.25rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2.5rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '2.75rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '2.25rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '2.5rem',
      },
    },
    // Rule applied: Implementation of Material UI for styling
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.3rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.4rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '1.5rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '1.6rem',
      },
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.15rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.25rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '1.35rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '1.45rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.05rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.1rem',
      },
      '@media (min-width:1200px)': {
        fontSize: '1.15rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '1.25rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      '@media (min-width:1200px)': {
        fontSize: '1.1rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '1.15rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      '@media (min-width:1200px)': {
        fontSize: '0.925rem',
      },
      '@media (min-width:1536px)': {
        fontSize: '0.95rem',
      },
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
          },
          [theme.breakpoints.up('md')]: {
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(4),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(2),
          [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(3),
          },
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(4),
          },
        }),
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          whiteSpace: 'nowrap',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem',
        },
        containedPrimary: {
          boxShadow: '0px 3px 6px rgba(63, 81, 181, 0.2)',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(63, 81, 181, 0.3)',
          },
        },
        containedSecondary: {
          boxShadow: '0px 3px 6px rgba(245, 0, 87, 0.2)',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(245, 0, 87, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
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
    MuiFormControl: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginBottom: theme.spacing(2),
        }),
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
        gutterBottom: ({ theme }) => ({
          marginBottom: theme.spacing(1.5),
        }),
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
    MuiGrid: {
      styleOverrides: {
        container: ({ theme }) => ({
          margin: 0,
          width: '100%',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 64,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48,
      },
      '@media (min-width:600px)': {
        minHeight: 64,
      },
    },
  },
};

// Create the base theme
let theme = createTheme(themeOptions);

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme;
