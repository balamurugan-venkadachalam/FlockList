import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent,
  EnhancedPopover 
} from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { CheckIcon, Settings2Icon, HelpCircleIcon, InfoIcon } from "lucide-react";

const meta = {
  title: "UI/Shadcn/Popover/Advanced",
  component: Popover,
  parameters: {
    layout: "centered",
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
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Enhanced popover with simpler API
 */
export const EnhancedPopoverExample: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <EnhancedPopover
        trigger={<Button variant="outline">Basic Enhanced</Button>}
        className="w-60"
      >
        <p className="text-sm">
          This uses the EnhancedPopover component for simpler implementation.
        </p>
      </EnhancedPopover>
      
      <EnhancedPopover
        trigger={<Button variant="outline">With Variant</Button>}
        variant="destructive"
        className="w-60"
      >
        <p className="text-sm">
          Enhanced popover with destructive variant.
        </p>
      </EnhancedPopover>
      
      <EnhancedPopover
        trigger={<Button variant="outline">Custom Size</Button>}
        size="lg"
        align="start"
        className="w-60"
      >
        <p className="text-sm">
          Enhanced popover with large size and start alignment.
        </p>
      </EnhancedPopover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The EnhancedPopover component provides a simpler API for creating popovers.",
      },
    },
  },
};

/**
 * Controlled popover example
 */
export const ControlledPopover: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="flex flex-col items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {open ? "Close Popover" : "Open Popover"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Controlled Popover</h4>
              <p className="text-sm text-muted-foreground">
                This popover's open state is controlled externally.
              </p>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOpen(true)}
          >
            Open
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOpen(!open)}
          >
            Toggle
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A controlled popover where the open/closed state is managed externally with React state.",
      },
    },
  },
};

/**
 * Responsive popover
 */
export const ResponsivePopover: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Responsive Width</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] sm:w-[300px] md:w-[400px]">
            <p className="text-sm">
              This popover has a responsive width that changes based on screen size.
              Try resizing your browser window to see the effect.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Responsive Content</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
              <h4 className="font-medium">Responsive Content</h4>
              <p className="text-sm hidden md:block">
                This content is only visible on medium and larger screens.
              </p>
              <p className="text-sm hidden sm:block md:hidden">
                This content is only visible on small screens.
              </p>
              <p className="text-sm block sm:hidden">
                This content is only visible on extra small screens.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popovers can be made responsive using Tailwind's responsive modifiers.",
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
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Form Field Help</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email Address</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <HelpCircleIcon className="h-4 w-4" />
                    <span className="sr-only">Help</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Email Requirements</h4>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Must be a valid email format</li>
                      <li>Will be used for account verification</li>
                      <li>Will not be shared with third parties</li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Settings Menu</h3>
          <div className="flex justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings2Icon className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-4">
                  <h4 className="font-medium">Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dark Mode</span>
                      <div className="h-4 w-8 bg-primary rounded-full relative">
                        <div className="h-3 w-3 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notifications</span>
                      <div className="h-4 w-8 bg-gray-300 rounded-full relative">
                        <div className="h-3 w-3 bg-white rounded-full absolute top-0.5 left-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sound</span>
                      <div className="h-4 w-8 bg-primary rounded-full relative">
                        <div className="h-3 w-3 bg-white rounded-full absolute top-0.5 right-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Confirmation Dialog</h3>
          <div className="flex justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="destructive">Delete Item</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                      <InfoIcon className="h-4 w-4 text-destructive" />
                    </div>
                    <h4 className="font-medium">Confirm Deletion</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this item? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </PopoverTrigger>
                    <Button variant="destructive" size="sm" onClick={() => setSubmitted(true)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how popovers can be used: form field help, settings menu, and confirmation dialogs.",
      },
    },
  },
};

/**
 * Accessible popover with proper focus management
 */
export const AccessiblePopover: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Accessible Popover</p>
        <p className="text-sm text-muted-foreground">
          This popover has proper focus management and keyboard navigation.
          Try using Tab and Escape keys to navigate and close it.
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open Accessible Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Accessibility Features</h4>
              <ul className="text-sm list-disc pl-4 space-y-1">
                <li>Focus is trapped within the popover when open</li>
                <li>Escape key closes the popover</li>
                <li>Focus returns to the trigger when closed</li>
                <li>Proper ARIA attributes for screen readers</li>
              </ul>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Type something" />
                <Button>Submit</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "An accessible popover with proper focus management and keyboard navigation.",
      },
    },
  },
};
