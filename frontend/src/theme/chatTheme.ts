// Rule applied: Use TypeScript for all code
import { theme } from './theme';

// Chat-specific theme extensions
export const chatTheme = {
  // Extend the base theme
  ...theme,
  
  // Chat-specific styling
  chat: {
    button: {
      shadow: '0 4px 12px rgba(0,0,0,0.15)',
      hoverShadow: '0 6px 16px rgba(0,0,0,0.2)',
    },
    window: {
      shadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
    message: {
      user: {
        bg: theme.colors.primary.light,
        text: '#ffffff',
      },
      bot: {
        bg: '#f0f0f0',
        text: theme.colors.text.primary,
      },
    },
  },
};

export default chatTheme;
