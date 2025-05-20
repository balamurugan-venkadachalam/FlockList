// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
// Rule applied: Use theme-based styling
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// Rule applied: Use absolute imports for all files @/...
import { useAuth } from '@/context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import TaskIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationCenter from '@/components/features/notifications/NotificationCenter';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    handleCloseUserMenu();
    navigate('/login');
  };
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        <ListItem component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        
        {user ? (
          <>
            <ListItem component={RouterLink} to="/dashboard" sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            
            <ListItem component={RouterLink} to="/tasks/dashboard" sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemIcon>
                <TaskIcon />
              </ListItemIcon>
              <ListItemText primary="Task Dashboard" />
            </ListItem>
            
            <Divider />
            
            <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem component={RouterLink} to="/login" sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            
            <ListItem component={RouterLink} to="/register" sx={{ color: 'inherit', textDecoration: 'none' }}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* Rule applied: Use theme spacing for all margins, paddings, and gaps */}
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: theme.spacing(2) }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Rule applied: Use theme typography */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              fontWeight: theme.typography.fontWeightMedium
            }}
          >
            Flock Task Manager
          </Typography>
          
          {/* Rule applied: Use responsive design implementation */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex',
              gap: theme.spacing(1)
            }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
              >
                Home
              </Button>
              
              {user ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/dashboard">
                    Dashboard
                  </Button>
                  
                  <Button color="inherit" component={RouterLink} to="/tasks/dashboard">
                    Task Dashboard
                  </Button>
                  
                  <NotificationCenter />
                  
                  <IconButton
                    onClick={handleOpenUserMenu}
                    color="inherit"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem disabled>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      component={RouterLink} 
                      to="/settings/notifications"
                      onClick={handleCloseUserMenu}
                    >
                      Notification Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 