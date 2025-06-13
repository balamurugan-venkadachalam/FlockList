import type { Meta, StoryObj } from "@storybook/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  PaperCard
} from "./card";
import { Button } from "./button";

/**
 * # Card Component
 * 
 * The Card component is a container that groups related content and actions.
 * It replaces the Material UI Card and Paper components with a fully responsive
 * and accessible alternative built with Tailwind CSS.
 * 
 * ## Features
 * - Semantic structure with header, content, and footer sections
 * - Proper heading hierarchy for accessibility
 * - Responsive padding that adapts to screen sizes
 * - Configurable elevation (shadow depth)
 * - PaperCard variant for simpler use cases
 * 
 * ## Accessibility Considerations
 * - Uses proper heading elements (h1-h6) for card titles
 * - Maintains proper color contrast for text content
 * - Ensures proper spacing for touch targets
 * - Provides clear visual boundaries between content sections
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Card Props to Shadcn Card Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `elevation` | `elevation` | Similar functionality (0-5) |
 * | `variant` | Use different components | Use Card vs PaperCard |
 * | `raised` | `elevation={3}` | Use higher elevation |
 * | `square` | Apply custom class | Use `className="rounded-none"` |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Card elevation={2}>
 *   <CardHeader title="Card Title" subheader="Card Subtitle" />
 *   <CardContent>
 *     <Typography>Card content goes here</Typography>
 *   </CardContent>
 *   <CardActions>
 *     <Button size="small">Action</Button>
 *   </CardActions>
 * </Card>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Card elevation={2}>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Subtitle</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button size="sm">Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Card",
  component: Card,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "heading-order",
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
    elevation: {
      control: { type: "select" },
      options: [0, 1, 2, 3, 4, 5],
      description: "The shadow depth of the card",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic card with header, content, and footer
 */
export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px] sm:w-[450px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description text</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card. It contains the primary information or functionality.</p>
      </CardContent>
      <CardFooter>
        <Button variant="default">Action</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Card with different elevation levels
 */
export const Elevation: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[0, 1, 2, 3, 4, 5].map((elevation) => (
        <Card key={elevation} elevation={elevation as 0 | 1 | 2 | 3 | 4 | 5} className="w-[350px] p-4">
          <p className="font-medium">Elevation {elevation}</p>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Cards with different elevation levels (0-5). Higher values create deeper shadows.",
      },
    },
  },
};

/**
 * Card with proper heading level for accessibility
 */
export const AccessibleHeadings: Story = {
  render: () => (
    <div className="space-y-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle as="h2">Main Section</CardTitle>
          <CardDescription>Using h2 for main sections</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card uses proper heading hierarchy.</p>
        </CardContent>
      </Card>
      
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle as="h3">Subsection</CardTitle>
          <CardDescription>Using h3 for subsections</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Proper heading levels improve screen reader navigation.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Cards with proper heading hierarchy for accessibility. Use the 'as' prop to specify the heading level.",
      },
    },
  },
};

/**
 * PaperCard component for simpler use cases
 */
export const Paper: Story = {
  render: () => (
    <div className="space-y-4">
      <PaperCard elevation={1} className="w-[350px]">
        <p>This is a simple paper card without explicit sections.</p>
        <p className="mt-2">It's useful for simpler content that doesn't need formal structure.</p>
      </PaperCard>
      
      <PaperCard elevation={3} className="w-[350px]">
        <h3 className="text-lg font-semibold mb-2">Simple Note</h3>
        <p>PaperCard is ideal for notes, simple messages, or alerts.</p>
      </PaperCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "PaperCard is a simplified version of Card with built-in padding, useful for simpler content.",
      },
    },
  },
};

/**
 * Responsive card that adapts to different screen sizes
 */
export const ResponsiveCard: Story = {
  render: () => (
    <Card className="w-full max-w-[500px]">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl">Responsive Card</CardTitle>
        <CardDescription>This card adapts to different screen sizes</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm sm:text-base">
          The padding, font sizes, and layout of this card will change based on the viewport size.
          Try viewing this component at different screen sizes to see how it adapts.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-muted p-2 rounded">Feature 1</div>
          <div className="bg-muted p-2 rounded">Feature 2</div>
          <div className="bg-muted p-2 rounded sm:col-span-2">Feature 3</div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Button size="responsive" className="w-full sm:w-auto">Primary Action</Button>
        <Button size="responsive" variant="outline" className="w-full sm:w-auto">Secondary Action</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "A fully responsive card that adapts its layout, spacing, and typography based on screen size.",
      },
    },
  },
};

/**
 * Interactive card with hover and focus states
 */
export const InteractiveCard: Story = {
  render: () => (
    <Card 
      className="w-[350px] transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-ring cursor-pointer"
      onClick={() => console.log('Card clicked')}
      tabIndex={0}
      role="button"
      aria-label="Interactive card example"
    >
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>This card responds to user interaction</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has hover and focus states for better accessibility.</p>
        <p className="mt-2">It also has proper ARIA attributes for screen readers.</p>
      </CardContent>
      <CardFooter>
        <Button>Learn More</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "An interactive card with proper hover and focus states for accessibility. Includes ARIA attributes for screen readers.",
      },
    },
  },
};
