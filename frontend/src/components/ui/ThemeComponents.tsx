// Rule applied: Create Shared Component Libraries
// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  SxProps, 
  Theme, 
  styled,
  Container,
  Grid,
  Paper as MuiPaper
} from '@mui/material';

// Rule applied: Always extend existing components rather than creating completely custom ones
// PaperCard - A styled Paper component with consistent elevation and radius
export const PaperCard = styled(MuiPaper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(2),
  // Rule applied: Leverage Breakpoints Utility
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(4.5),
  },
}));

// Rule applied: Use theme spacing for all margins, paddings, and gaps
// ContentCard - A styled card with consistent padding and margins
export const ContentCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 1.5,
  // Rule applied: Leverage Breakpoints Utility
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(4.5),
    marginBottom: theme.spacing(4.5),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
}));

// FormContainer - A consistently styled container for forms
export const FormContainer = styled(Box)(({ theme }) => ({
  maxWidth: '500px',
  width: '100%',
  margin: '0 auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  // Rule applied: Leverage Breakpoints Utility
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '600px',
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: '700px',
    padding: theme.spacing(5),
    gap: theme.spacing(4),
  },
}));

// Rule applied: Use functional components with TypeScript interfaces
// PageHeader - Consistent page header with responsive styling
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  action,
  sx,
  children 
}) => {
  return (
    <Box 
      sx={{ 
        mb: { xs: 2, sm: 3, md: 4, lg: 5 },
        ...sx 
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 2
      }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            {action}
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
};

// ResponsiveContainer - A container with responsive padding
export const ResponsiveContainer = styled(Container)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  // Rule applied: Leverage Breakpoints Utility
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
}));

// Rule applied: Use functional components with TypeScript interfaces
// GridContainer - A responsive grid container with proper spacing
interface GridContainerProps {
  children: React.ReactNode;
  spacing?: number;
  sx?: SxProps<Theme>;
}

export const GridContainer: React.FC<GridContainerProps> = ({ 
  children, 
  spacing = 2,
  sx 
}) => {
  return (
    <Grid 
      container 
      spacing={{ 
        xs: spacing, 
        sm: spacing * 1.5, 
        md: spacing * 2,
        lg: spacing * 2.5,
        xl: spacing * 3 
      }}
      sx={sx}
    >
      {children}
    </Grid>
  );
};
