import type { Meta, StoryObj } from "@storybook/react";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  EnhancedAvatar
} from "./avatar";

/**
 * # Avatar Component
 * 
 * The Avatar component is used to represent users with profile pictures or initials.
 * It replaces the Material UI Avatar component with a fully accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Multiple shapes (circle, rounded, square)
 * - Fallback support for when images fail to load
 * - Automatic initials generation from names
 * - Fallback styling variants
 * - Enhanced avatar wrapper for convenience
 * 
 * ## Accessibility Considerations
 * - Proper alt text for images
 * - Appropriate color contrast for fallback text
 * - Fallback content for when images are unavailable
 * - Proper ARIA attributes
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Avatar Props to Shadcn Avatar Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `alt` | `alt` | Same functionality |
 * | `src` | `src` | Same functionality |
 * | `variant` | `variant` | Different options: "circle", "rounded", "square" |
 * | `children` | `fallback` | Used for fallback content |
 * | `sizes` | `size` | Different options: "xs", "sm", "md", "lg", "xl" |
 * | `imgProps` | `imageClassName` | Use for image-specific styling |
 * | `sx` | `className` | Use Tailwind classes |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Avatar
 *   alt="John Doe"
 *   src="/path/to/image.jpg"
 *   variant="rounded"
 *   sx={{ width: 56, height: 56 }}
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <EnhancedAvatar
 *   alt="John Doe"
 *   src="/path/to/image.jpg"
 *   variant="rounded"
 *   size="lg"
 * />
 * ```
 */
const meta = {
  title: "UI/Shadcn/Avatar",
  component: Avatar,
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
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "The size of the avatar",
    },
    variant: {
      control: "select",
      options: ["circle", "rounded", "square"],
      description: "The shape of the avatar",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic avatar example with image
 */
export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: "md",
    variant: "circle",
  },
};

/**
 * Avatar with fallback (no image)
 */
export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  args: {
    size: "md",
    variant: "circle",
  },
};

/**
 * Avatar sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="xs">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>XS</AvatarFallback>
      </Avatar>
      
      <Avatar size="sm">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      
      <Avatar size="md">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      
      <Avatar size="xl">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatars in different sizes: xs (24px), sm (32px), md (40px), lg (48px), and xl (64px).",
      },
    },
  },
};

/**
 * Avatar variants (shapes)
 */
export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar variant="circle">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      
      <Avatar variant="rounded">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      
      <Avatar variant="square">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatars in different shapes: circle (fully rounded), rounded (rounded corners), and square (no rounding).",
      },
    },
  },
};

/**
 * Fallback variants
 */
export const FallbackVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback variant="default">AB</AvatarFallback>
      </Avatar>
      
      <Avatar>
        <AvatarFallback variant="primary">CD</AvatarFallback>
      </Avatar>
      
      <Avatar>
        <AvatarFallback variant="secondary">EF</AvatarFallback>
      </Avatar>
      
      <Avatar>
        <AvatarFallback variant="muted">GH</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatars with different fallback styling variants: default, primary, secondary, and muted.",
      },
    },
  },
};

/**
 * Enhanced avatar component
 */
export const EnhancedAvatars: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <EnhancedAvatar 
          src="https://github.com/shadcn.png" 
          alt="John Doe" 
        />
        
        <EnhancedAvatar 
          alt="Jane Smith" 
        />
        
        <EnhancedAvatar 
          fallback="AB" 
          fallbackVariant="primary" 
        />
      </div>
      
      <div className="flex gap-4">
        <EnhancedAvatar 
          src="https://github.com/shadcn.png" 
          alt="John Doe" 
          size="lg"
          variant="rounded"
        />
        
        <EnhancedAvatar 
          alt="Jane Smith" 
          size="lg"
          variant="rounded"
          fallbackVariant="secondary"
        />
        
        <EnhancedAvatar 
          fallback="AB" 
          size="lg"
          variant="rounded"
          fallbackVariant="muted"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "EnhancedAvatar component provides a simpler API for creating avatars with automatic fallback to initials.",
      },
    },
  },
};

/**
 * Responsive avatars
 */
export const ResponsiveAvatars: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Responsive Size</h3>
        <div className="flex items-center">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="ml-4 text-sm text-muted-foreground">
            This avatar changes size based on screen width
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Responsive Group</h3>
        <div className="flex -space-x-2">
          {["JD", "AB", "YZ", "MS", "TW"].map((initials, i) => (
            <Avatar 
              key={i} 
              className="border-2 border-background ring-0"
              size={i === 0 ? "md" : "sm"}
            >
              <AvatarFallback variant={i % 2 === 0 ? "primary" : "secondary"}>
                {initials}
              </AvatarFallback>
            </Avatar>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
            +3
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Avatars can be made responsive using Tailwind's responsive modifiers.",
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
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">User Profile</h3>
        <div className="flex items-center gap-4">
          <EnhancedAvatar 
            src="https://github.com/shadcn.png" 
            alt="John Doe" 
            size="lg"
          />
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-muted-foreground">Product Designer</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Comment Thread</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <EnhancedAvatar 
              alt="Jane Smith" 
              size="sm"
              fallbackVariant="primary"
            />
            <div className="flex-1 rounded-md bg-muted p-2">
              <p className="text-xs font-medium">Jane Smith</p>
              <p className="text-xs">This looks great! I love the new design.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <EnhancedAvatar 
              src="https://github.com/shadcn.png" 
              alt="John Doe" 
              size="sm"
            />
            <div className="flex-1 rounded-md bg-muted p-2">
              <p className="text-xs font-medium">John Doe</p>
              <p className="text-xs">Thanks for the feedback!</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Team Members</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { name: "Alex Brown", src: null, variant: "primary" },
            { name: "Taylor Wilson", src: "https://github.com/shadcn.png", variant: "default" },
            { name: "Morgan Smith", src: null, variant: "secondary" },
            { name: "Jamie Davis", src: null, variant: "muted" },
          ].map((user, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <EnhancedAvatar 
                src={user.src} 
                alt={user.name} 
                fallbackVariant={user.variant as any}
              />
              <span className="text-xs">{user.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how avatars can be used in different contexts: user profiles, comment threads, and team member lists.",
      },
    },
  },
};
