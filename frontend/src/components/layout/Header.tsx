// Rule applied: Use TypeScript for all code; prefer interfaces over types
// Rule applied: Use functional components with TypeScript interfaces
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// Rule applied: Use absolute imports for all files @/...
import { useAuth } from '@/context/AuthContext';
import NotificationCenter from '@/components/features/notifications/NotificationCenter';

// Shadcn UI components
import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/shadcn/dialog';
import { Separator } from '@/components/ui/shadcn/separator';

// Lucide React icons
import { Menu, User, Home, LogOut, LayoutDashboard, CheckSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Mobile navigation drawer content
  const drawerContent = (
    <div className="w-64 p-4" role="navigation">
      <nav className="space-y-2">
        <RouterLink to="/" className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
          <Home className="mr-2 h-4 w-4" />
          <span>Home</span>
        </RouterLink>
        
        {user ? (
          <>
            <RouterLink to="/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </RouterLink>
            
            <RouterLink to="/tasks/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Task Dashboard</span>
            </RouterLink>
            
            <Separator className="my-2" />
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <RouterLink to="/login" className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
              <User className="mr-2 h-4 w-4" />
              <span>Login</span>
            </RouterLink>
            
            <RouterLink to="/register" className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700">
              <User className="mr-2 h-4 w-4" />
              <span>Register</span>
            </RouterLink>
          </>
        )}
      </nav>
    </div>
  );

  return (
    <header className="bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 sm:max-w-[250px] left-0">
                {drawerContent}
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Logo/Title */}
          <RouterLink to="/" className="text-xl font-semibold text-primary-foreground no-underline flex-1 md:flex-none">
            Flock Task Manager
          </RouterLink>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <RouterLink to="/" className="text-primary-foreground">
                Home
              </RouterLink>
            </Button>
            
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <RouterLink to="/dashboard" className="text-primary-foreground">
                    Dashboard
                  </RouterLink>
                </Button>
                
                <Button variant="ghost" asChild>
                  <RouterLink to="/tasks/dashboard" className="text-primary-foreground">
                    Task Dashboard
                  </RouterLink>
                </Button>
                
                <NotificationCenter />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <RouterLink to="/settings/notifications" className="w-full cursor-pointer">
                        Notification Settings
                      </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <RouterLink to="/login" className="text-primary-foreground">
                    Login
                  </RouterLink>
                </Button>
                <Button variant="ghost" asChild>
                  <RouterLink to="/register" className="text-primary-foreground">
                    Register
                  </RouterLink>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 