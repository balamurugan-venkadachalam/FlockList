import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { Progress, ProgressIndeterminate } from "./progress";
import { Button } from "./button";

/**
 * # Progress Component
 * 
 * The Progress component displays the completion status of a task or operation.
 * It replaces the Material UI LinearProgress and CircularProgress components with
 * a fully accessible alternative built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Multiple variants (default, success, warning, destructive)
 * - Multiple sizes (sm, md, lg)
 * - Optional value display
 * - Custom value formatting
 * - Animation control
 * - Indeterminate progress indicator
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Sufficient color contrast for all variants
 * - Visual indication of progress
 * - Proper labeling
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI LinearProgress Props to Shadcn Progress Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `variant` | `variant` and indeterminate component | Different naming, use ProgressIndeterminate for indeterminate |
 * | `value` | `value` | Same functionality |
 * | `color` | `variant` | Different options: "default", "success", "warning", "destructive" |
 * | `valueBuffer` | N/A | Not directly supported |
 * | `sx` | `className` | Use Tailwind classes |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <LinearProgress variant="determinate" value={progress} color="primary" />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Progress value={progress} variant="default" />
 * ```
 */
const meta = {
  title: "UI/Shadcn/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "The current progress value (0-100)",
    },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "destructive"],
      description: "The visual style of the progress bar",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The size/height of the progress bar",
    },
    showValue: {
      control: "boolean",
      description: "Whether to show the progress value",
    },
    animate: {
      control: "boolean",
      description: "Whether to animate progress changes",
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic progress example
 */
export const Default: Story = {
  args: {
    value: 60,
    variant: "default",
    size: "md",
    showValue: false,
    animate: true,
  },
};

/**
 * Progress variants
 */
export const Variants: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default</p>
        <Progress value={60} variant="default" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Success</p>
        <Progress value={80} variant="success" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Warning</p>
        <Progress value={40} variant="warning" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Destructive</p>
        <Progress value={20} variant="destructive" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Progress bars in different variants: default (primary), success, warning, and destructive.",
      },
    },
  },
};

/**
 * Progress sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Small</p>
        <Progress value={60} size="sm" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Medium</p>
        <Progress value={60} size="md" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Large</p>
        <Progress value={60} size="lg" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Progress bars in different sizes: small (4px), medium (8px), and large (12px).",
      },
    },
  },
};

/**
 * Progress with value display
 */
export const WithValue: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default Formatting</p>
        <Progress value={67.5} showValue />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Formatting</p>
        <Progress 
          value={67.5} 
          showValue 
          formatValue={(value) => `${Math.round(value)} of 100 completed`} 
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Progress bars with value display, using default and custom formatting.",
      },
    },
  },
};

/**
 * Animated progress
 */
export const AnimatedProgress: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    
    // Reset and start animation when the story is viewed
    useEffect(() => {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 5;
        });
      }, 500);
      
      return () => {
        clearInterval(timer);
      };
    }, []);
    
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="space-y-2">
          <p className="text-sm font-medium">Animated Progress</p>
          <Progress value={progress} showValue animate />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Non-Animated Progress</p>
          <Progress value={progress} showValue animate={false} />
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setProgress(0)}
          >
            Reset
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Progress bars with and without animation when the value changes.",
      },
    },
  },
};

/**
 * Indeterminate progress
 */
export const Indeterminate: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default Indeterminate</p>
        <ProgressIndeterminate />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Success Variant</p>
        <ProgressIndeterminate variant="success" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Warning Variant</p>
        <ProgressIndeterminate variant="warning" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Destructive Variant</p>
        <ProgressIndeterminate variant="destructive" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Small Size</p>
        <ProgressIndeterminate size="sm" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Large Size</p>
        <ProgressIndeterminate size="lg" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Indeterminate progress indicators for when the progress value is unknown.",
      },
    },
  },
};

/**
 * Interactive progress demo
 */
export const InteractiveDemo: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    
    useEffect(() => {
      let timer: NodeJS.Timeout | null = null;
      
      if (isRunning) {
        timer = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress >= 100) {
              setIsRunning(false);
              return 100;
            }
            return prevProgress + 1;
          });
        }, 100);
      }
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [isRunning]);
    
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Interactive Progress</p>
            <p className="text-sm text-muted-foreground">{progress}%</p>
          </div>
          <Progress value={progress} />
        </div>
        
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsRunning(true);
            }}
            disabled={isRunning || progress >= 100}
          >
            Start
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsRunning(false);
            }}
            disabled={!isRunning}
          >
            Pause
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setProgress(0);
              setIsRunning(false);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "An interactive demo of the Progress component with start, pause, and reset controls.",
      },
    },
  },
};

/**
 * Responsive progress
 */
export const ResponsiveProgress: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Responsive Width</p>
        <Progress 
          value={70} 
          className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2" 
          showValue
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Responsive Size</p>
        <Progress 
          value={70} 
          className="hidden sm:block" 
          size="sm"
          showValue
        />
        <Progress 
          value={70} 
          className="hidden xs:block sm:hidden" 
          size="md"
          showValue
        />
        <Progress 
          value={70} 
          className="block xs:hidden" 
          size="lg"
          showValue
        />
        <p className="text-xs text-muted-foreground mt-1">
          Size changes based on screen width
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Progress bars can be made responsive using Tailwind's responsive modifiers.",
      },
    },
    viewport: {
      defaultViewport: "md",
    },
  },
};

/**
 * Real-world usage examples
 */
export const UsageExamples: Story = {
  render: () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    
    useEffect(() => {
      let timer: NodeJS.Timeout | null = null;
      
      if (isUploading) {
        timer = setInterval(() => {
          setUploadProgress((prevProgress) => {
            const nextProgress = prevProgress + Math.random() * 10;
            if (nextProgress >= 100) {
              setIsUploading(false);
              return 100;
            }
            return nextProgress;
          });
        }, 500);
      }
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [isUploading]);
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">File Upload</h3>
          <div className="p-4 border rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">document.pdf</p>
                  <p className="text-xs text-muted-foreground">2.4 MB</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setUploadProgress(0);
                  setIsUploading(true);
                }}
                disabled={isUploading || uploadProgress === 100}
              >
                {uploadProgress === 100 ? "Uploaded" : isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            
            {(isUploading || uploadProgress === 100) && (
              <div className="space-y-1">
                <Progress 
                  value={uploadProgress} 
                  variant={uploadProgress === 100 ? "success" : "default"} 
                  size="sm"
                />
                <div className="flex justify-between text-xs">
                  <span>{Math.round(uploadProgress)}%</span>
                  <span>{uploadProgress === 100 ? "Complete" : "Uploading..."}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Multi-Step Form</h3>
          <div className="space-y-4">
            <Progress value={66} size="sm" variant="success" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step 2 of 3</span>
              <span>Personal Information</span>
            </div>
            <div className="p-4 border rounded-md">
              <p className="text-sm">Form content would go here...</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Loading State</h3>
          <div className="p-4 border rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Loading Data</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Cancel</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
            <ProgressIndeterminate size="sm" />
            <p className="text-xs text-muted-foreground">This might take a moment...</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how progress indicators can be used: file uploads, multi-step forms, and loading states.",
      },
    },
  },
};
