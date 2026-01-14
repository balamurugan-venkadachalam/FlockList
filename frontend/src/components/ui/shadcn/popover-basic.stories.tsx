import type { Meta, StoryObj } from "@storybook/react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent,
  EnhancedPopover 
} from "./popover";
import { Button } from "./button";

/**
 * # Popover Component
 * 
 * The Popover component displays floating content in relation to a trigger element.
 * It replaces the Material UI Popover component with a fully accessible
 * alternative built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Multiple variants (default, destructive, outline)
 * - Multiple sizes (sm, md, lg)
 * - Customizable positioning (align, sideOffset)
 * - Animated transitions
 * - Enhanced API for simpler usage
 * 
 * ## Accessibility Considerations
 * - Proper focus management
 * - Keyboard navigation support
 * - Proper ARIA attributes for screen readers
 * - Dismissible with Escape key
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Popover Props to Shadcn Popover Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `open` | `open` | Same functionality |
 * | `anchorEl` | N/A | Use `PopoverTrigger` instead |
 * | `onClose` | `onOpenChange` | Different signature |
 * | `anchorOrigin` | `align` and `side` | Different options |
 * | `transformOrigin` | N/A | Automatically handled |
 * | `elevation` | N/A | Use `className` with Tailwind |
 * | `sx` | `className` | Use Tailwind classes |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Popover
 *   open={open}
 *   anchorEl={anchorEl}
 *   onClose={handleClose}
 *   anchorOrigin={{
 *     vertical: 'bottom',
 *     horizontal: 'center',
 *   }}
 * >
 *   <Box sx={{ p: 2 }}>Popover content</Box>
 * </Popover>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Popover open={open} onOpenChange={setOpen}>
 *   <PopoverTrigger asChild>
 *     <Button>Click me</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     Popover content
 *   </PopoverContent>
 * </Popover>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Popover/Basic",
  component: Popover,
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
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic popover example
 */
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm">Width</span>
              <input
                className="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                placeholder="100%"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm">Height</span>
              <input
                className="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                placeholder="25px"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story: "A basic popover with a trigger button and content.",
      },
    },
  },
};

/**
 * Popover with different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Small</Button>
        </PopoverTrigger>
        <PopoverContent size="sm" className="w-60">
          <p className="text-sm">
            This is a small popover with less padding.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Medium</Button>
        </PopoverTrigger>
        <PopoverContent size="md" className="w-60">
          <p className="text-sm">
            This is a medium popover with default padding.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Large</Button>
        </PopoverTrigger>
        <PopoverContent size="lg" className="w-60">
          <p className="text-sm">
            This is a large popover with more padding.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popovers in different sizes: small, medium, and large.",
      },
    },
  },
};

/**
 * Popover with different variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Default</Button>
        </PopoverTrigger>
        <PopoverContent variant="default" className="w-60">
          <p className="text-sm">
            This is the default popover variant.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Destructive</Button>
        </PopoverTrigger>
        <PopoverContent variant="destructive" className="w-60">
          <p className="text-sm">
            This is a destructive popover for warnings or errors.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Outline</Button>
        </PopoverTrigger>
        <PopoverContent variant="outline" className="w-60">
          <p className="text-sm">
            This is an outline popover with a thicker border.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popovers in different variants: default, destructive, and outline.",
      },
    },
  },
};
