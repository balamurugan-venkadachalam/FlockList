import React from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';

// Rule applied: Use TypeScript for all code
interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="container max-w-md mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full shadow-md">
          <CardContent className="p-6 flex flex-col items-center">
            {/* Rule applied: Use Tailwind classes for layout */}
            <div className="w-14 h-14 mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-center">
              {message}
            </h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoadingScreen;