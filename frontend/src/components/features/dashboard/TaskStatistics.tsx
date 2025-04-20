import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  LinearProgress,
  Chip
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  DirectionsRun as InProgressIcon
} from '@mui/icons-material';

interface TaskStatisticsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({
  totalTasks,
  completedTasks,
  pendingTasks,
  inProgressTasks
}) => {
  // Calculate percentages
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingPercentage = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Total Tasks
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
            {totalTasks}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CompletedIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Completed
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'success.main' }}>
            {completedTasks}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({completedPercentage}%)
            </Typography>
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completedPercentage} 
            color="success" 
            sx={{ mt: 1, height: 8, borderRadius: 4 }} 
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <InProgressIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              In Progress
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'warning.main' }}>
            {inProgressTasks}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({inProgressPercentage}%)
            </Typography>
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={inProgressPercentage} 
            color="warning" 
            sx={{ mt: 1, height: 8, borderRadius: 4 }} 
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PendingIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Pending
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'info.main' }}>
            {pendingTasks}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({pendingPercentage}%)
            </Typography>
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={pendingPercentage} 
            color="info" 
            sx={{ mt: 1, height: 8, borderRadius: 4 }} 
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TaskStatistics; 