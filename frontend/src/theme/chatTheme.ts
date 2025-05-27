import { createTheme } from '@mui/material';

export const chatTheme = createTheme({
  components: {
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.chat-window': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});
