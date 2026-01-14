import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge } from "./badge";
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  InfoIcon, 
  TagIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon
} from "lucide-react";

/**
 * # Badge Component
 * 
 * The Badge component is used to highlight and display statuses, labels, counts, or categories.
 * It replaces the Material UI Chip and Badge components with a fully customizable alternative
 * built with Tailwind CSS.
 * 
 * ## Features
 * - Multiple variants (default, secondary, destructive, outline, success, warning, info)
 * - Multiple sizes (sm, default, lg)
 * - Different border radius options (none, sm, md, default/full)
 * - Support for icons
 * - Deletable badges
 * - Interactive badges
 * 
 * ## Accessibility Considerations
 * - Proper color contrast for all variants
 * - Appropriate text size for readability
 * - Interactive badges have proper focus states
 * - Delete buttons have screen reader text
 * - Keyboard navigation support
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Chip Props to Shadcn Badge Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `color` | `variant` | Different naming: "primary" → "default", etc. |
 * | `size` | `size` | Similar options: "small" → "sm", etc. |
 * | `variant` | N/A | Use `variant="outline"` for outlined style |
 * | `label` | `children` | Pass as children |
 * | `icon` | `icon` | Similar functionality |
 * | `onDelete` | `onDelete` | Similar functionality |
 * | `clickable` | `interactive` | Set to true for clickable badges |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Chip
 *   label="Deletable"
 *   color="primary"
 *   onDelete={handleDelete}
 *   icon={<FaceIcon />}
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Badge
 *   variant="default"
 *   onDelete={handleDelete}
 *   icon={<FaceIcon className="h-3 w-3" />}
 * >
 *   Deletable
 * </Badge>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Badge",
  component: Badge,
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
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "info"],
      description: "The visual style of the badge",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
      description: "The size of the badge",
    },
    rounded: {
      control: "select",
      options: ["default", "md", "sm", "none"],
      description: "The border radius of the badge",
    },
    interactive: {
      control: "boolean",
      description: "Whether the badge is interactive (clickable)",
    },
    icon: {
      control: "boolean",
      description: "Whether to show an icon",
    },
    onDelete: {
      control: "boolean",
      description: "Whether to show a delete button",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic badge example
 */
export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
    size: "default",
    rounded: "default",
    interactive: false,
  },
};

/**
 * Badge variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different badge variants: default (primary), secondary, destructive, outline, success, warning, and info.",
      },
    },
  },
};

/**
 * Badge sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different badge sizes: small, default, and large.",
      },
    },
  },
};

/**
 * Badge border radius options
 */
export const BorderRadius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge rounded="default">Full Rounded</Badge>
      <Badge rounded="md">Medium Rounded</Badge>
      <Badge rounded="sm">Small Rounded</Badge>
      <Badge rounded="none">No Rounding</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different border radius options: default (full), medium, small, and none.",
      },
    },
  },
};

/**
 * Badges with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" icon={<CheckCircleIcon className="h-3 w-3" />}>
        Completed
      </Badge>
      <Badge variant="destructive" icon={<AlertCircleIcon className="h-3 w-3" />}>
        Error
      </Badge>
      <Badge variant="info" icon={<InfoIcon className="h-3 w-3" />}>
        Information
      </Badge>
      <Badge variant="warning" icon={<AlertCircleIcon className="h-3 w-3" />}>
        Warning
      </Badge>
      <Badge variant="success" icon={<CheckCircleIcon className="h-3 w-3" />}>
        Success
      </Badge>
      <Badge variant="outline" icon={<TagIcon className="h-3 w-3" />}>
        Tag
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Badges with icons to provide additional visual context.",
      },
    },
  },
};

/**
 * Deletable badges
 */
export const Deletable: Story = {
  render: () => {
    // Use useState to track which badges are visible
    const [badges, setBadges] = useState([
      { id: 1, label: "React", variant: "default" as const },
      { id: 2, label: "TypeScript", variant: "info" as const },
      { id: 3, label: "Tailwind CSS", variant: "secondary" as const },
      { id: 4, label: "Shadcn UI", variant: "success" as const },
    ]);
    
    const handleDelete = (id: number) => {
      setBadges(badges.filter(badge => badge.id !== id));
    };
    
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge 
              key={badge.id} 
              variant={badge.variant}
              onDelete={() => handleDelete(badge.id)}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
        
        {badges.length === 0 && (
          <p className="text-sm text-muted-foreground">All badges have been deleted. Refresh to reset.</p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Badges with delete buttons that can be clicked to remove the badge.",
      },
    },
  },
};

/**
 * Interactive badges
 */
export const Interactive: Story = {
  render: () => {
    const handleClick = (label: string) => {
      alert(`Clicked on badge: ${label}`);
    };
    
    return (
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="default" 
          interactive 
          onClick={() => handleClick("Default")}
        >
          Default
        </Badge>
        <Badge 
          variant="secondary" 
          interactive 
          onClick={() => handleClick("Secondary")}
        >
          Secondary
        </Badge>
        <Badge 
          variant="outline" 
          interactive 
          onClick={() => handleClick("Outline")}
        >
          Outline
        </Badge>
        <Badge 
          variant="destructive" 
          interactive 
          onClick={() => handleClick("Destructive")}
        >
          Destructive
        </Badge>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive badges that can be clicked to trigger actions.",
      },
    },
  },
};

/**
 * Badges with both icons and delete buttons
 */
export const IconsAndDelete: Story = {
  render: () => {
    // Use useState to track which badges are visible
    const [badges, setBadges] = useState([
      { id: 1, label: "User", icon: <UserIcon className="h-3 w-3" />, variant: "default" as const },
      { id: 2, label: "Calendar", icon: <CalendarIcon className="h-3 w-3" />, variant: "secondary" as const },
      { id: 3, label: "Time", icon: <ClockIcon className="h-3 w-3" />, variant: "outline" as const },
      { id: 4, label: "Favorite", icon: <StarIcon className="h-3 w-3" />, variant: "info" as const },
    ]);
    
    const handleDelete = (id: number) => {
      setBadges(badges.filter(badge => badge.id !== id));
    };
    
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge 
              key={badge.id} 
              variant={badge.variant}
              icon={badge.icon}
              onDelete={() => handleDelete(badge.id)}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
        
        {badges.length === 0 && (
          <p className="text-sm text-muted-foreground">All badges have been deleted. Refresh to reset.</p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Badges with both icons and delete buttons, combining visual context with the ability to remove badges.",
      },
    },
  },
};

/**
 * Real-world usage examples
 */
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Status Indicators</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<CheckCircleIcon className="h-3 w-3" />}>Active</Badge>
          <Badge variant="warning" icon={<AlertCircleIcon className="h-3 w-3" />}>Pending</Badge>
          <Badge variant="destructive" icon={<AlertCircleIcon className="h-3 w-3" />}>Failed</Badge>
          <Badge variant="secondary">Inactive</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Category Labels</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Frontend</Badge>
          <Badge variant="default">Backend</Badge>
          <Badge variant="default">Design</Badge>
          <Badge variant="default">DevOps</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Tag Input</h3>
        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
          <Badge variant="secondary" onDelete={() => {}}>React</Badge>
          <Badge variant="secondary" onDelete={() => {}}>TypeScript</Badge>
          <Badge variant="secondary" onDelete={() => {}}>Tailwind CSS</Badge>
          <span className="inline-flex items-center text-sm text-muted-foreground">+ Add tag</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Notification Counts</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="i-lucide-bell h-5 w-5" />
            <Badge size="sm" className="absolute -top-1 -right-2">5</Badge>
          </div>
          <div className="relative">
            <span className="i-lucide-mail h-5 w-5" />
            <Badge size="sm" variant="destructive" className="absolute -top-1 -right-2">12</Badge>
          </div>
          <div className="relative">
            <span className="i-lucide-message-square h-5 w-5" />
            <Badge size="sm" variant="secondary" className="absolute -top-1 -right-2">3</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how badges can be used in different contexts: status indicators, category labels, tag inputs, and notification counts.",
      },
    },
  },
};
