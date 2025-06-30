import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/shadcn/button';
import { Card } from '../components/ui/shadcn/card';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="my-8">
        <Card className="p-8 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl font-bold mb-4">Flock Task Manager</h1>
              
              <h2 className="text-xl text-gray-600 mb-4">
                Organize your flock's tasks and activities in one place.
              </h2>
              
              <p className="text-base mb-6">
                Our application helps families manage tasks, chores, and activities efficiently.
                Stay organized and keep track of everyone's responsibilities.
              </p>
              
              {user ? (
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="font-medium"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="default" 
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="font-medium"
                  >
                    Login
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="font-medium"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
            <div>
              <img
                src="/images/flock-tasks.svg" 
                alt="Flock organizing tasks"
                className="w-full max-w-[400px] h-auto block mx-auto"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home; 