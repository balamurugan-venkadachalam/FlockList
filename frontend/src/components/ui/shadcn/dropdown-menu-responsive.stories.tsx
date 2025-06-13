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
import { User, Settings, LogOut } from "lucide-react";

const meta = {
  title: "UI/Shadcn/DropdownMenu/Responsive",
  component: DropdownMenu,
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
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Responsive dropdown menu
 */
export const ResponsiveDropdownMenu: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Responsive Dropdown Menu</h3>
        <p className="text-sm text-muted-foreground">
          This dropdown menu adapts to different screen sizes.
          Try resizing your browser window to see the effect.
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>User Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] sm:w-[240px] md:w-[280px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut className="hidden sm:inline-block">⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut className="hidden sm:inline-block">⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut className="hidden sm:inline-block">⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Responsive Content</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>View Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Display Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="text-sm hidden md:block">
                This content is only visible on medium and larger screens.
              </div>
              <div className="text-sm hidden sm:block md:hidden">
                This content is only visible on small screens.
              </div>
              <div className="text-sm block sm:hidden">
                This content is only visible on extra small screens.
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dropdown menus can be made responsive using Tailwind's responsive modifiers.",
      },
    },
    viewport: {
      defaultViewport: "md",
    },
  },
};

/**
 * Accessible dropdown menu
 */
export const AccessibleDropdownMenu: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Accessible Dropdown Menu</h3>
        <p className="text-sm text-muted-foreground">
          This dropdown menu follows accessibility best practices.
          Try using Tab, Enter, Arrow keys, and Escape to navigate.
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Accessibility Features</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Focus is trapped within the menu
            </DropdownMenuItem>
            <DropdownMenuItem>
              Arrow keys navigate between items
            </DropdownMenuItem>
            <DropdownMenuItem>
              Escape key closes the menu
            </DropdownMenuItem>
            <DropdownMenuItem>
              Proper ARIA attributes for screen readers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Keyboard controls:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tab: Move focus to the dropdown trigger</li>
          <li>Enter/Space: Open the dropdown when trigger is focused</li>
          <li>Arrow keys: Navigate between menu items</li>
          <li>Enter: Select the focused menu item</li>
          <li>Escape: Close the dropdown menu</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "An accessible dropdown menu with proper keyboard navigation and ARIA attributes.",
      },
    },
  },
};

/**
 * Real-world usage examples
 */
export const UsageExamples: Story = {
  render: () => {
    const [theme, setTheme] = useState("light");
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">User Profile Menu</h3>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    JD
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>John Doe</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Theme Switcher</h3>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {theme === "light" ? "Light Theme" : "Dark Theme"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {theme === "light" && <Check className="mr-2 h-4 w-4" />}
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  {theme === "dark" && <Check className="mr-2 h-4 w-4" />}
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  {theme === "system" && <Check className="mr-2 h-4 w-4" />}
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Mobile Navigation</h3>
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Home</DropdownMenuItem>
                <DropdownMenuItem>Products</DropdownMenuItem>
                <DropdownMenuItem>Services</DropdownMenuItem>
                <DropdownMenuItem>About</DropdownMenuItem>
                <DropdownMenuItem>Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-xs text-muted-foreground mt-2">
              This menu is only visible on mobile screens
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm">
              On larger screens, this would be a horizontal navigation bar instead of a dropdown.
            </p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how dropdown menus can be used: user profile menu, theme switcher, and mobile navigation.",
      },
    },
  },
};

// Import the Check component for the theme switcher example
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
