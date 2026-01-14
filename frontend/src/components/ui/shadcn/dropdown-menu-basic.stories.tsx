import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "./dropdown-menu";
import { Button } from "./button";

/**
 * # Dropdown Menu Component
 * 
 * The Dropdown Menu component displays a menu to the user—such as a set of actions or functions—triggered by a button.
 * It replaces the Material UI Menu component with a fully accessible
 * alternative built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Multiple sizes (sm, md, lg)
 * - Keyboard navigation
 * - Supports submenus
 * - Supports checkbox and radio items
 * - Supports keyboard shortcuts
 * - Animated transitions
 * 
 * ## Accessibility Considerations
 * - Proper focus management
 * - Keyboard navigation support
 * - Proper ARIA attributes for screen readers
 * - Dismissible with Escape key
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Menu Props to Shadcn Dropdown Menu Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `open` | N/A | Use controlled state pattern |
 * | `anchorEl` | N/A | Use `DropdownMenuTrigger` instead |
 * | `onClose` | N/A | Use controlled state pattern |
 * | `MenuListProps` | N/A | Apply directly to `DropdownMenuContent` |
 * | `TransitionComponent` | N/A | Transitions are built-in |
 * | `anchorOrigin` | N/A | Use `align` and `side` props |
 * | `transformOrigin` | N/A | Automatically handled |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Button onClick={handleClick}>Open Menu</Button>
 * <Menu
 *   anchorEl={anchorEl}
 *   open={Boolean(anchorEl)}
 *   onClose={handleClose}
 * >
 *   <MenuItem onClick={handleClose}>Profile</MenuItem>
 *   <MenuItem onClick={handleClose}>My account</MenuItem>
 *   <MenuItem onClick={handleClose}>Logout</MenuItem>
 * </Menu>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button>Open Menu</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Profile</DropdownMenuItem>
 *     <DropdownMenuItem>My account</DropdownMenuItem>
 *     <DropdownMenuItem>Logout</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
const meta = {
  title: "UI/Shadcn/DropdownMenu/Basic",
  component: DropdownMenu,
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
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic dropdown menu example
 */
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    docs: {
      description: {
        story: "A basic dropdown menu with a label, separators, and menu items.",
      },
    },
  },
};

/**
 * Dropdown menu with different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Small</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent size="sm">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Medium</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent size="md">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Large</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent size="lg">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dropdown menus in different sizes: small, medium, and large.",
      },
    },
  },
};

/**
 * Dropdown menu with keyboard shortcuts
 */
export const WithShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          New Tab
          <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          New Window
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          New Private Window
          <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Save Page As...
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Print...
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    docs: {
      description: {
        story: "A dropdown menu with keyboard shortcuts displayed next to menu items.",
      },
    },
  },
};

/**
 * Dropdown menu with destructive item
 */
export const WithDestructiveItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    docs: {
      description: {
        story: "A dropdown menu with a destructive item for dangerous actions.",
      },
    },
  },
};
