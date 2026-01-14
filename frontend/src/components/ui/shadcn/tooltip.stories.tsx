import type { Meta, StoryObj } from "@storybook/react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger,
  EnhancedTooltip
} from "./tooltip";
import { Button } from "./button";
import { InfoIcon, AlertTriangleIcon, AlertCircleIcon } from "lucide-react";

/**
 * # Tooltip Component
 * 
 * The Tooltip component displays informative text when users hover over, focus on, or tap an element.
 * It replaces the Material UI Tooltip component with a fully accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible tooltip primitive
 * - Multiple sizes (sm, md, lg)
 * - Multiple variants (default, info, warning, error)
 * - Customizable positioning (side, alignment)
 * - Configurable delay duration
 * - Animated transitions
 * - Enhanced tooltip wrapper for convenience
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Keyboard focus support
 * - Sufficient color contrast for all variants
 * - Proper timing for appearance/disappearance
 * - Appropriate text size for readability
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Tooltip Props to Shadcn Tooltip Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `title` | `content` in EnhancedTooltip | Pass as content prop |
 * | `placement` | `side` and `align` | More specific positioning |
 * | `arrow` | N/A | No arrow by default, can be added with CSS |
 * | `enterDelay` | `delayDuration` | In milliseconds |
 * | `leaveDelay` | N/A | Not directly supported |
 * | `children` | `children` | Same functionality |
 * | `classes` | `className` and `contentClassName` | Use Tailwind classes |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Tooltip title="Delete" placement="top">
 *   <Button>Delete</Button>
 * </Tooltip>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button>Delete</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       Delete
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 * 
 * Or using the EnhancedTooltip component:
 * ```tsx
 * <TooltipProvider>
 *   <EnhancedTooltip content="Delete">
 *     <Button>Delete</Button>
 *   </EnhancedTooltip>
 * </TooltipProvider>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Tooltip",
  component: TooltipContent,
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
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "The side of the trigger where the tooltip appears",
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "The alignment of the tooltip relative to the trigger",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The size of the tooltip",
    },
    variant: {
      control: "select",
      options: ["default", "info", "warning", "error"],
      description: "The visual style of the tooltip",
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof TooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic tooltip example
 */
export const Default: Story = {
  render: (args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent {...args}>
        This is a tooltip
      </TooltipContent>
    </Tooltip>
  ),
  args: {
    side: "top",
    align: "center",
  },
};

/**
 * Tooltip sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Small Tooltip</Button>
        </TooltipTrigger>
        <TooltipContent size="sm">
          This is a small tooltip with limited width
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Medium Tooltip</Button>
        </TooltipTrigger>
        <TooltipContent size="md">
          This is a medium tooltip with standard width
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Large Tooltip</Button>
        </TooltipTrigger>
        <TooltipContent size="lg">
          This is a large tooltip that can contain more text and information when needed
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips in different sizes: small (200px max-width), medium (250px max-width), and large (350px max-width).",
      },
    },
  },
};

/**
 * Tooltip variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Default</Button>
        </TooltipTrigger>
        <TooltipContent variant="default">
          Default tooltip style
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <InfoIcon className="h-4 w-4 mr-2" />
            Info
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="info">
          Information tooltip with helpful details
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <AlertTriangleIcon className="h-4 w-4 mr-2" />
            Warning
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="warning">
          Warning tooltip for cautionary information
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <AlertCircleIcon className="h-4 w-4 mr-2" />
            Error
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="error">
          Error tooltip for critical information
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips in different variants: default, info, warning, and error.",
      },
    },
  },
};

/**
 * Tooltip positions
 */
export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 items-center justify-center">
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Tooltip appears above the trigger
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Tooltip appears to the right of the trigger
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Tooltip appears below the trigger
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Tooltip appears to the left of the trigger
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips positioned on different sides of the trigger: top, right, bottom, and left.",
      },
    },
  },
};

/**
 * Tooltip alignments
 */
export const Alignments: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top Start</Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">
            Aligned to the start
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top Center</Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            Aligned to the center
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top End</Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end">
            Aligned to the end
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom Start</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            Aligned to the start
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom Center</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Aligned to the center
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom End</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Aligned to the end
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips with different alignments relative to the trigger: start, center, and end.",
      },
    },
  },
};

/**
 * Enhanced tooltip component for simpler usage
 */
export const EnhancedTooltips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <EnhancedTooltip content="Default tooltip">
        <Button variant="outline">Default</Button>
      </EnhancedTooltip>
      
      <EnhancedTooltip 
        content="Information tooltip" 
        variant="info"
        side="bottom"
      >
        <Button variant="outline">
          <InfoIcon className="h-4 w-4 mr-2" />
          Info
        </Button>
      </EnhancedTooltip>
      
      <EnhancedTooltip 
        content="Warning tooltip with longer text that demonstrates the medium size constraint" 
        variant="warning"
        side="right"
        size="md"
      >
        <Button variant="outline">
          <AlertTriangleIcon className="h-4 w-4 mr-2" />
          Warning
        </Button>
      </EnhancedTooltip>
      
      <EnhancedTooltip 
        content="Error tooltip with custom delay" 
        variant="error"
        side="left"
        delayDuration={500}
      >
        <Button variant="outline">
          <AlertCircleIcon className="h-4 w-4 mr-2" />
          Error
        </Button>
      </EnhancedTooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "EnhancedTooltip component provides a simpler API for creating tooltips with all the customization options.",
      },
    },
  },
};

/**
 * Rich content in tooltips
 */
export const RichContent: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">With List</Button>
        </TooltipTrigger>
        <TooltipContent size="lg">
          <div>
            <p className="font-medium mb-1">Available options:</p>
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li>Edit document</li>
              <li>Share with others</li>
              <li>Download as PDF</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">With Image</Button>
        </TooltipTrigger>
        <TooltipContent size="lg" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <InfoIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">Profile Image</p>
            <p className="text-xs text-muted-foreground">Click to change your avatar</p>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Keyboard Shortcut</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="mb-1">Save document</p>
            <div className="flex justify-center gap-1">
              <kbd className="px-1 bg-muted rounded text-[10px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1 bg-muted rounded text-[10px]">S</kbd>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips can contain rich content like lists, images, and keyboard shortcuts.",
      },
    },
  },
};

/**
 * Tooltip with HTML elements as triggers
 */
export const NonButtonTriggers: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 items-center">
      <EnhancedTooltip 
        content="Click to edit your profile" 
        asChild
      >
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer">
          <span className="text-lg font-bold">JD</span>
        </div>
      </EnhancedTooltip>
      
      <EnhancedTooltip 
        content="This text has additional information" 
        variant="info"
      >
        <span className="underline decoration-dotted cursor-help">
          Hover over this text for more details
        </span>
      </EnhancedTooltip>
      
      <EnhancedTooltip 
        content="Click to sort by name" 
        side="bottom"
      >
        <div className="flex items-center gap-1 cursor-pointer">
          <span className="font-medium">Name</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 3L9.5 5H5.5L7.5 3Z" fill="currentColor" />
            <path d="M7.5 12L5.5 10H9.5L7.5 12Z" fill="currentColor" />
          </svg>
        </div>
      </EnhancedTooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tooltips can be triggered by various HTML elements, not just buttons.",
      },
    },
  },
};
