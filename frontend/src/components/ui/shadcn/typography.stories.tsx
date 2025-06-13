import type { Meta, StoryObj } from "@storybook/react";
import {
  Typography,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Paragraph,
  Blockquote,
  Lead,
  Large,
  Small,
  Muted,
  Subtle,
} from "./typography";

/**
 * # Typography Component
 * 
 * The Typography component provides consistent text styling across the application.
 * It replaces the Material UI Typography component with a fully customizable alternative
 * built with Tailwind CSS.
 * 
 * ## Features
 * - Multiple variants for different text styles (h1-h6, paragraph, blockquote, etc.)
 * - Text alignment options (left, center, right, justify)
 * - Font weight options (light, regular, medium, semibold, bold, extrabold)
 * - Text transform options (uppercase, lowercase, capitalize, normal)
 * - Responsive text sizing
 * - Truncation support
 * - Margin control
 * - Semantic HTML elements
 * 
 * ## Accessibility Considerations
 * - Proper heading hierarchy (h1-h6)
 * - Semantic HTML structure
 * - Sufficient color contrast
 * - Responsive text sizing for readability
 * - Proper line height for readability
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Typography Props to Shadcn Typography Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `variant` | `variant` | Similar options with additional variants |
 * | `align` | `align` | Same options (left, center, right, justify) |
 * | `gutterBottom` | `noMargin={false}` | Inverse logic |
 * | `noWrap` | `truncate` | Similar functionality |
 * | `paragraph` | `variant="p"` | Use variant instead |
 * | `fontWeight` | `weight` | More specific options |
 * | `component` | `as` | Same functionality |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Typography variant="h1" align="center" gutterBottom>
 *   Heading
 * </Typography>
 * <Typography variant="body1" paragraph>
 *   This is a paragraph of text.
 * </Typography>
 * <Typography variant="caption" noWrap>
 *   This text will be truncated if it's too long.
 * </Typography>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Typography variant="h1" align="center">
 *   Heading
 * </Typography>
 * <Typography variant="p">
 *   This is a paragraph of text.
 * </Typography>
 * <Typography variant="small" truncate>
 *   This text will be truncated if it's too long.
 * </Typography>
 * ```
 * 
 * Or using the specialized components:
 * ```tsx
 * <H1 align="center">Heading</H1>
 * <Paragraph>This is a paragraph of text.</Paragraph>
 * <Small truncate>This text will be truncated if it's too long.</Small>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Typography",
  component: Typography,
  parameters: {
    layout: "padded",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "heading-order",
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
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "ul", "ol", "code", "lead", "large", "small", "muted", "subtle"],
      description: "The variant of the typography component",
    },
    align: {
      control: "select",
      options: ["left", "center", "right", "justify"],
      description: "Text alignment",
    },
    weight: {
      control: "select",
      options: ["light", "regular", "medium", "semibold", "bold", "extrabold"],
      description: "Font weight",
    },
    transform: {
      control: "select",
      options: ["uppercase", "lowercase", "capitalize", "normal"],
      description: "Text transformation",
    },
    noMargin: {
      control: "boolean",
      description: "Whether to remove margin",
    },
    truncate: {
      control: "boolean",
      description: "Whether to truncate text with ellipsis",
    },
    responsive: {
      control: "boolean",
      description: "Whether to use responsive text sizing",
    },
    as: {
      control: "text",
      description: "The HTML element to render as",
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic typography example
 */
export const Default: Story = {
  args: {
    children: "The quick brown fox jumps over the lazy dog",
    variant: "p",
  },
};

/**
 * All typography variants
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <H5>Heading 5</H5>
      <H6>Heading 6</H6>
      <Paragraph>
        This is a paragraph of text. It demonstrates the default paragraph styling.
        The paragraph has proper line height and spacing for optimal readability.
      </Paragraph>
      <Blockquote>
        This is a blockquote. It's commonly used for quotations or emphasizing a section of text.
      </Blockquote>
      <Typography variant="ul">
        <li>Unordered list item 1</li>
        <li>Unordered list item 2</li>
        <li>Unordered list item 3</li>
      </Typography>
      <Typography variant="ol">
        <li>Ordered list item 1</li>
        <li>Ordered list item 2</li>
        <li>Ordered list item 3</li>
      </Typography>
      <Typography variant="code">console.log("This is code text");</Typography>
      <Lead>
        This is lead text. It's typically used for introductory paragraphs or highlighted content.
      </Lead>
      <Large>This is large text.</Large>
      <Small>This is small text.</Small>
      <Muted>This is muted text, used for less important information.</Muted>
      <Subtle>This is subtle text, with reduced emphasis.</Subtle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available typography variants, showing the hierarchy and styling of different text elements.",
      },
    },
  },
};

/**
 * Text alignment options
 */
export const TextAlignment: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h3" align="left">Left Aligned</Typography>
      <Typography variant="h3" align="center">Center Aligned</Typography>
      <Typography variant="h3" align="right">Right Aligned</Typography>
      <Typography variant="p" align="justify">
        Justify Aligned. This paragraph has longer text to demonstrate justified alignment.
        When text is justified, it spreads out to fill the entire width of the container,
        creating even edges on both the left and right sides. This is commonly used in print
        media like books and newspapers.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different text alignment options: left, center, right, and justify.",
      },
    },
  },
};

/**
 * Font weight options
 */
export const FontWeights: Story = {
  render: () => (
    <div className="space-y-2">
      <Typography weight="light">Light weight text (300)</Typography>
      <Typography weight="regular">Regular weight text (400)</Typography>
      <Typography weight="medium">Medium weight text (500)</Typography>
      <Typography weight="semibold">Semibold weight text (600)</Typography>
      <Typography weight="bold">Bold weight text (700)</Typography>
      <Typography weight="extrabold">Extrabold weight text (800)</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different font weight options from light to extrabold.",
      },
    },
  },
};

/**
 * Text transformation options
 */
export const TextTransform: Story = {
  render: () => (
    <div className="space-y-2">
      <Typography transform="uppercase">Uppercase text</Typography>
      <Typography transform="lowercase">Lowercase Text That Was Originally Mixed Case</Typography>
      <Typography transform="capitalize">capitalized text where each word starts with a capital letter</Typography>
      <Typography transform="normal">Normal case text</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different text transformation options: uppercase, lowercase, capitalize, and normal.",
      },
    },
  },
};

/**
 * Truncated text
 */
export const Truncated: Story = {
  render: () => (
    <div className="max-w-xs space-y-4">
      <Typography truncate>
        This is a very long text that will be truncated with an ellipsis because it doesn't fit in the container.
        The truncate property adds an ellipsis when the text overflows its container.
      </Typography>
      <Typography>
        This is a very long text that will wrap normally because it doesn't have the truncate property.
        It will continue onto multiple lines as needed to fit within its container.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Text truncation with ellipsis when the text is too long for its container.",
      },
    },
  },
};

/**
 * Responsive text
 */
export const ResponsiveText: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h2">Non-responsive heading</Typography>
      <Typography variant="h2" responsive>Responsive heading</Typography>
      
      <Typography>Non-responsive paragraph text. The size remains the same across all screen sizes.</Typography>
      <Typography responsive>
        Responsive paragraph text. The size changes based on the screen size:
        base size on mobile, smaller on small screens, base on medium screens,
        larger on large screens, and extra large on extra large screens.
      </Typography>
      
      <div className="p-4 border rounded-md">
        <Typography variant="small">
          Try resizing your browser window to see how the responsive text adapts to different screen sizes.
          The responsive property applies these Tailwind classes: "text-base sm:text-sm md:text-base lg:text-lg xl:text-xl"
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Responsive text that changes size based on the screen size, providing optimal readability across devices.",
      },
    },
  },
};

/**
 * Custom element type
 */
export const CustomElement: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1" as="h2">
        This looks like an H1 but is actually an H2 element
      </Typography>
      <Typography variant="p" as="div">
        This looks like a paragraph but is actually a div element
      </Typography>
      <Typography variant="h3" as="label" htmlFor="example-input">
        This looks like an H3 but is actually a label element
      </Typography>
      <input id="example-input" className="border p-2 rounded" placeholder="Input with label above" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Using the 'as' prop to render a different HTML element while keeping the same styling.",
      },
    },
  },
};

/**
 * Typography in a real-world example
 */
export const RealWorldExample: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <H1 align="center">Getting Started with Shadcn UI</H1>
      
      <Lead>
        A comprehensive guide to using Shadcn UI components in your React applications.
        Learn how to install, configure, and use these accessible and customizable components.
      </Lead>
      
      <H2>Installation</H2>
      <Paragraph>
        To get started with Shadcn UI, you'll need to install the necessary dependencies and set up your project.
        Follow these steps to integrate Shadcn UI into your React application.
      </Paragraph>
      
      <Typography variant="code">npm install tailwindcss postcss autoprefixer</Typography>
      
      <H3>Configuration</H3>
      <Paragraph>
        After installing the dependencies, you'll need to configure Tailwind CSS and create the necessary utility files.
        This ensures that all components work correctly and maintain consistent styling.
      </Paragraph>
      
      <Blockquote>
        Shadcn UI is not a component library. It's a collection of re-usable components built using Radix UI and Tailwind CSS.
      </Blockquote>
      
      <H3>Component Usage</H3>
      <Paragraph>
        Once you've set up your project, you can start using the components. Here's an example of how to use the Button component:
      </Paragraph>
      
      <Typography variant="code">
        {`import { Button } from "./components/ui/button";\n\nfunction App() {\n  return <Button>Click me</Button>;\n}`}
      </Typography>
      
      <H4>Customization</H4>
      <Paragraph>
        All components can be customized using Tailwind CSS classes or by modifying the component files directly.
        This gives you complete control over the appearance and behavior of your UI.
      </Paragraph>
      
      <Small>Last updated: June 13, 2025</Small>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A real-world example showing how different typography components can be used together to create a cohesive and readable document.",
      },
    },
  },
};
