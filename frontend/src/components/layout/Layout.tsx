// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React, { ReactNode } from 'react';
import { Box, Container, useTheme } from '@mui/material';
// Rule applied: Use absolute imports for all files @/...
import Header from '@/components/layout/Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Rule applied: Use theme-based styling
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <Header />
      {/* Rule applied: Use variant props over sx when available */}
      {/* Rule applied: Use theme-based grid and container configurations */}
      <Container 
        component="main" 
        maxWidth="lg"
        sx={{ 
          flex: 1, 
          py: theme.spacing(4)
          // Container padding and max-width now handled in theme.ts
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 