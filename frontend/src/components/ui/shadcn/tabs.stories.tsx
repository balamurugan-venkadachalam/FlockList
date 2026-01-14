import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent, ResponsiveTabs } from "./tabs";
import { Card, CardContent } from "./card";

/**
 * # Tabs Component
 * 
 * The Tabs component is a UI element that allows users to switch between different sections of content.
 * It replaces the Material UI Tabs component with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible tabs primitive
 * - Keyboard navigation support
 * - Proper focus management
 * - Responsive design options (horizontal, vertical, or responsive)
 * - Full width support
 * - Customizable styling
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Keyboard navigation support (Tab, Arrow keys)
 * - Visual indicators for focus and selection states
 * - Proper color contrast for all states
 * - Semantic HTML structure
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Tabs Props to Shadcn Tabs Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `value` | `defaultValue` or `value` | Same functionality |
 * | `onChange` | `onValueChange` | Different callback signature |
 * | `orientation` | Use `ResponsiveTabs` | Use orientation prop on ResponsiveTabs |
 * | `variant="fullWidth"` | `fullWidth` | Apply to TabsList and TabsTrigger |
 * | `centered` | Use className | Apply "justify-center" to TabsList |
 * | `TabIndicatorProps` | N/A | Styling handled via Tailwind |
 * | `scrollButtons` | N/A | Not directly supported, use custom styling |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
 *   <Tab label="Item One" />
 *   <Tab label="Item Two" />
 *   <Tab label="Item Three" />
 * </Tabs>
 * <TabPanel value={value} index={0}>Item One Content</TabPanel>
 * <TabPanel value={value} index={1}>Item Two Content</TabPanel>
 * <TabPanel value={value} index={2}>Item Three Content</TabPanel>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Tabs defaultValue="item1" aria-label="basic tabs example">
 *   <TabsList>
 *     <TabsTrigger value="item1">Item One</TabsTrigger>
 *     <TabsTrigger value="item2">Item Two</TabsTrigger>
 *     <TabsTrigger value="item3">Item Three</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="item1">Item One Content</TabsContent>
 *   <TabsContent value="item2">Item Two Content</TabsContent>
 *   <TabsContent value="item3">Item Three Content</TabsContent>
 * </Tabs>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "tabindex",
            enabled: true,
          },
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
    defaultValue: {
      control: "text",
      description: "The default selected tab value",
    },
    value: {
      control: "text",
      description: "The controlled value of the tab to activate",
    },
    onValueChange: {
      action: "valueChanged",
      description: "Callback fired when the tab changes",
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic tabs with content
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-[400px]">
      <Tabs defaultValue="account" {...args}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardContent className="pt-6">
              <p>Account settings and preferences.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardContent className="pt-6">
              <p>Change your password here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <p>App settings and configuration.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * Full width tabs that expand to fill the container
 */
export const FullWidth: Story = {
  render: (args) => (
    <div className="w-[400px]">
      <Tabs defaultValue="tab1" {...args}>
        <TabsList fullWidth>
          <TabsTrigger value="tab1" fullWidth>Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" fullWidth>Tab 2</TabsTrigger>
          <TabsTrigger value="tab3" fullWidth>Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <Card>
            <CardContent className="pt-6">
              <p>Content for Tab 1</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab2">
          <Card>
            <CardContent className="pt-6">
              <p>Content for Tab 2</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab3">
          <Card>
            <CardContent className="pt-6">
              <p>Content for Tab 3</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs that expand to fill the full width of their container. Each tab trigger takes an equal amount of space.",
      },
    },
  },
};

/**
 * Vertical tabs layout
 */
export const Vertical: Story = {
  render: (args) => (
    <div className="w-[600px]">
      <ResponsiveTabs defaultValue="tab1" orientation="vertical" {...args}>
        <TabsList className="w-[200px] flex-col h-auto">
          <TabsTrigger value="tab1" className="justify-start w-full">Profile Information</TabsTrigger>
          <TabsTrigger value="tab2" className="justify-start w-full">Security Settings</TabsTrigger>
          <TabsTrigger value="tab3" className="justify-start w-full">Notification Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="flex-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Profile Information</h3>
              <p>Edit your personal information and profile settings.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab2" className="flex-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Security Settings</h3>
              <p>Manage your password, two-factor authentication, and security preferences.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab3" className="flex-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
              <p>Control how and when you receive notifications from the application.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </ResponsiveTabs>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Tabs arranged in a vertical layout with tabs on the left and content on the right. This layout is useful for settings pages or dashboards with many sections.",
      },
    },
  },
};

/**
 * Responsive tabs that change orientation based on screen size
 */
export const Responsive: Story = {
  render: (args) => (
    <div className="w-full max-w-[600px]">
      <ResponsiveTabs defaultValue="tab1" orientation="responsive" {...args}>
        <TabsList className="flex-col sm:flex-row h-auto sm:h-10 w-full">
          <TabsTrigger value="tab1" className="justify-start sm:justify-center w-full">Overview</TabsTrigger>
          <TabsTrigger value="tab2" className="justify-start sm:justify-center w-full">Features</TabsTrigger>
          <TabsTrigger value="tab3" className="justify-start sm:justify-center w-full">Specifications</TabsTrigger>
          <TabsTrigger value="tab4" className="justify-start sm:justify-center w-full">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Product Overview</h3>
              <p>General information about the product.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Key Features</h3>
              <p>Detailed list of product features and capabilities.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Technical Specifications</h3>
              <p>Technical details and specifications of the product.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tab4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
              <p>Reviews and ratings from customers who purchased this product.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </ResponsiveTabs>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Tabs that adapt to different screen sizes. On small screens, tabs stack vertically; on larger screens, they display horizontally. This provides optimal user experience across devices.",
      },
    },
  },
};

/**
 * Tabs with custom styling
 */
export const CustomStyling: Story = {
  render: (args) => (
    <div className="w-[400px]">
      <Tabs defaultValue="personal" {...args}>
        <TabsList className="grid grid-cols-3 bg-primary/10">
          <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Personal
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Business
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Team
          </TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p>Personal account settings and preferences.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="business">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p>Business account settings and billing information.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p>Team management and collaboration settings.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs with custom styling using Tailwind CSS classes. The active tab has a different background color and text color.",
      },
    },
  },
};

/**
 * Complex tabs with rich content
 */
export const ComplexContent: Story = {
  render: (args) => (
    <div className="w-full max-w-[800px]">
      <Tabs defaultValue="dashboard" {...args}>
        <TabsList className="w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Dashboard Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Total Users</h4>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Revenue</h4>
                    <p className="text-2xl font-bold">$12,345</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Active Tasks</h4>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Your dashboard summary for the current month. View detailed analytics for more information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Analytics Data</h3>
                <div className="h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                </div>
                <p className="text-muted-foreground">
                  Detailed analytics and metrics for your application usage and performance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Generated Reports</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Monthly Performance Report</span>
                    <span className="text-xs text-muted-foreground">June 10, 2025</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Quarterly Financial Summary</span>
                    <span className="text-xs text-muted-foreground">May 15, 2025</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Annual Review</span>
                    <span className="text-xs text-muted-foreground">January 5, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Application Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Enable notifications</span>
                    <div className="h-5 w-10 bg-primary/20 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dark mode</span>
                    <div className="h-5 w-10 bg-primary/20 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-save changes</span>
                    <div className="h-5 w-10 bg-primary/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Tabs with complex content including data visualizations, lists, and settings controls. This demonstrates how tabs can be used to organize different types of content in a single interface.",
      },
    },
  },
};
