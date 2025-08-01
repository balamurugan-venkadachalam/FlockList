import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Rule applied: Use absolute imports for all files @/...
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { AlertCircle } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  
  // Focus on the heading when component mounts for better screen reader experience
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    <main className="container mx-auto max-w-md px-4 py-8">
      <div className="mt-8 mb-4 text-center">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4" role="alert" aria-live="assertive">
              <AlertCircle className="h-8 w-8 text-destructive mr-2" aria-hidden="true" />
              <h1 
                ref={headingRef} 
                tabIndex={-1} 
                className="text-2xl font-bold text-destructive focus:outline-none"
              >
                Access Denied
              </h1>
            </div>
            
            <p className="text-center mb-6">
              You do not have permission to access this page.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="default" 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto"
                aria-label="Go to dashboard page"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
                aria-label="Return to previous page"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Unauthorized;
