import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent,
  EnhancedAccordionItem
} from "./accordion";
import { PlusCircleIcon, MinusCircleIcon, HelpCircleIcon } from "lucide-react";

const meta = {
  title: "UI/Shadcn/Accordion/Features",
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
 * Multiple items can be open simultaneously
 */
export const MultipleType: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>
          This accordion can have multiple items open at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          Try opening this while the first item is still open.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>
          All items can be open simultaneously.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "With type='multiple', users can open multiple accordion items at the same time.",
      },
    },
  },
};

/**
 * Custom icon position
 */
export const IconPositions: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div>
        <h3 className="text-sm font-medium mb-2">Icon at End (Default)</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger iconPosition="end">
              Icon at the end
            </AccordionTrigger>
            <AccordionContent>
              This is the default icon position.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Icon at Start</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger iconPosition="start">
              Icon at the start
            </AccordionTrigger>
            <AccordionContent>
              The icon is positioned at the start of the trigger.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">No Icon</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger hideIcon>
              No icon
            </AccordionTrigger>
            <AccordionContent>
              This trigger has no icon.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The chevron icon can be positioned at the start or end of the trigger, or hidden completely.",
      },
    },
  },
};

/**
 * Enhanced accordion item
 */
export const EnhancedItems: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <EnhancedAccordionItem
        value="item-1"
        trigger="Basic Enhanced Item"
        variant="bordered"
      >
        This uses the EnhancedAccordionItem component for simpler implementation.
      </EnhancedAccordionItem>
      
      <EnhancedAccordionItem
        value="item-2"
        trigger="Custom Icon Position"
        variant="bordered"
        iconPosition="start"
      >
        This item has the icon at the start position.
      </EnhancedAccordionItem>
      
      <EnhancedAccordionItem
        value="item-3"
        trigger="No Icon"
        variant="bordered"
        hideIcon
      >
        This item has no icon.
      </EnhancedAccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "The EnhancedAccordionItem component provides a simpler API for creating accordion items.",
      },
    },
  },
};

/**
 * Responsive accordion
 */
export const ResponsiveAccordion: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-medium mb-2">Responsive Styling</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm sm:text-base md:text-lg">
            Responsive Text Size
          </AccordionTrigger>
          <AccordionContent className="text-xs sm:text-sm md:text-base">
            This accordion uses responsive text sizes that adapt to different screen widths.
            Try resizing your browser window to see the effect.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="py-2 sm:py-3 md:py-4">
            Responsive Padding
          </AccordionTrigger>
          <AccordionContent>
            This item has padding that increases on larger screens.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordions can be made responsive using Tailwind's responsive modifiers.",
      },
    },
    viewport: {
      defaultViewport: "md",
    },
  },
};
