import type { Meta, StoryObj } from "@storybook/react";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent,
  EnhancedAccordionItem
} from "./accordion";
import { PlusCircleIcon, MinusCircleIcon, HelpCircleIcon } from "lucide-react";

/**
 * # Accordion Component
 * 
 * The Accordion component displays collapsible content panels for presenting information in a limited space.
 * It replaces the Material UI Accordion/ExpansionPanel with a fully accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Multiple variants (default, bordered, ghost)
 * - Customizable icon position (start, end) or no icon
 * - Animated transitions
 * - Support for controlled and uncontrolled usage
 * - Enhanced accordion item wrapper for convenience
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Keyboard navigation support
 * - Focus management
 * - Proper semantic structure
 * - Animated transitions with reduced motion support
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Accordion Props to Shadcn Accordion Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `expanded` | `value` and `defaultValue` | Use with type="single" |
 * | `onChange` | `onValueChange` | Similar functionality |
 * | `disabled` | `disabled` | Same functionality |
 * | `TransitionProps` | N/A | Built-in transitions |
 * | `elevation` | `variant` | Use "bordered" for elevation-like styling |
 * | `square` | N/A | Use custom styling if needed |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
 *   <AccordionSummary expandIcon={<ExpandMoreIcon />}>
 *     <Typography>Accordion 1</Typography>
 *   </AccordionSummary>
 *   <AccordionDetails>
 *     <Typography>Content goes here</Typography>
 *   </AccordionDetails>
 * </Accordion>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Accordion type="single" value={value} onValueChange={setValue}>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Accordion 1</AccordionTrigger>
 *     <AccordionContent>Content goes here</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Accordion",
  component: Accordion,
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
    type: {
      control: "select",
      options: ["single", "multiple"],
      description: "Whether a single item or multiple items can be opened at once",
    },
    collapsible: {
      control: "boolean",
      description: "Whether the open item can be closed (only applies to type='single')",
    },
    defaultValue: {
      control: "text",
      description: "The value of the item to open by default (uncontrolled)",
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;
