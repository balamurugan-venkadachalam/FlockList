import type { Meta, StoryObj } from "@storybook/react";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent
} from "./accordion";

const meta = {
  title: "UI/Shadcn/Accordion/Variants",
  component: Accordion,
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
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default variant with bottom border
 */
export const DefaultVariant: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1" variant="default">
        <AccordionTrigger>Default Variant</AccordionTrigger>
        <AccordionContent>
          This is the default variant with a bottom border on each item.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" variant="default">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          Another item with the default variant styling.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "The default variant has a bottom border on each accordion item.",
      },
    },
  },
};

/**
 * Bordered variant with full border
 */
export const BorderedVariant: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1" variant="bordered">
        <AccordionTrigger>Bordered Variant</AccordionTrigger>
        <AccordionContent>
          This variant has a full border around each accordion item.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" variant="bordered">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          Another item with the bordered variant styling.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "The bordered variant has a full border around each accordion item with spacing between items.",
      },
    },
  },
};

/**
 * Ghost variant with no borders
 */
export const GhostVariant: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1" variant="ghost">
        <AccordionTrigger>Ghost Variant</AccordionTrigger>
        <AccordionContent>
          This variant has no borders, creating a cleaner look.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" variant="ghost">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          Another item with the ghost variant styling.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "The ghost variant has no borders, creating a cleaner, more minimal look.",
      },
    },
  },
};
