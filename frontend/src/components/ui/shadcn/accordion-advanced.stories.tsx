import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent
} from "./accordion";
import { Button } from "./button";
import { PlusCircleIcon, MinusCircleIcon, HelpCircleIcon } from "lucide-react";

const meta = {
  title: "UI/Shadcn/Accordion/Advanced",
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
 * Controlled accordion example
 */
export const ControlledAccordion: Story = {
  render: () => {
    // Use useState to control the accordion value
    const [value, setValue] = useState<string | string[]>("item-1");
    
    return (
      <div className="space-y-4 w-full max-w-md">
        <Accordion 
          type="single" 
          value={value as string} 
          onValueChange={(val) => setValue(val)}
          className="w-full"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item</AccordionTrigger>
            <AccordionContent>
              This is a controlled accordion. The current value is: {value}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item</AccordionTrigger>
            <AccordionContent>
              The value state is managed externally.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Third Item</AccordionTrigger>
            <AccordionContent>
              Try using the buttons below to control this accordion.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setValue("item-1")}
          >
            Open Item 1
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setValue("item-2")}
          >
            Open Item 2
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setValue("item-3")}
          >
            Open Item 3
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setValue("")}
          >
            Close All
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A controlled accordion where the open/closed state is managed externally with React state.",
      },
    },
  },
};

/**
 * Custom styled accordion
 */
export const CustomStyled: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem 
        value="item-1"
        className="border-primary/20 bg-primary/5 rounded-lg mb-2"
      >
        <AccordionTrigger 
          className="px-4 text-primary font-medium"
          iconClassName="text-primary"
        >
          Custom Styled Item
        </AccordionTrigger>
        <AccordionContent className="px-4 text-primary/80">
          This accordion item has custom styling applied using Tailwind classes.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem 
        value="item-2"
        className="border-destructive/20 bg-destructive/5 rounded-lg"
      >
        <AccordionTrigger 
          className="px-4 text-destructive font-medium"
          iconClassName="text-destructive"
        >
          Another Custom Style
        </AccordionTrigger>
        <AccordionContent className="px-4 text-destructive/80">
          Different styling can be applied to each accordion item.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordion items can be customized with Tailwind classes for different visual styles.",
      },
    },
  },
};

/**
 * Nested accordions
 */
export const NestedAccordions: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Main Category</AccordionTrigger>
        <AccordionContent>
          <Accordion type="multiple" className="border-l-2 pl-4 mt-2">
            <AccordionItem value="nested-1">
              <AccordionTrigger className="text-sm">Subcategory 1</AccordionTrigger>
              <AccordionContent className="text-sm">
                Content for subcategory 1.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="nested-2">
              <AccordionTrigger className="text-sm">Subcategory 2</AccordionTrigger>
              <AccordionContent className="text-sm">
                Content for subcategory 2.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-2">
        <AccordionTrigger>Another Category</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">Some content before the nested accordion.</p>
          <Accordion type="single" collapsible className="border-l-2 pl-4">
            <AccordionItem value="nested-3">
              <AccordionTrigger className="text-sm">Nested Item</AccordionTrigger>
              <AccordionContent className="text-sm">
                Deeply nested content.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: "Accordions can be nested within each other to create hierarchical content structures.",
      },
    },
  },
};

/**
 * Real-world usage example: FAQ
 */
export const FAQExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="faq-1">
          <AccordionTrigger>
            <div className="flex items-center">
              <HelpCircleIcon className="h-4 w-4 mr-2 text-primary" />
              <span>How do I create an account?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p>
              To create an account, click the "Sign Up" button in the top right corner
              of the homepage. Fill out the required information and follow the
              verification steps sent to your email.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="faq-2">
          <AccordionTrigger>
            <div className="flex items-center">
              <HelpCircleIcon className="h-4 w-4 mr-2 text-primary" />
              <span>How do I reset my password?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p>
              To reset your password, click on the "Forgot Password" link on the login
              page. Enter your email address, and we'll send you instructions to reset
              your password.
            </p>
            <div className="mt-2 p-2 bg-muted rounded-md text-sm">
              <strong>Tip:</strong> Make sure to check your spam folder if you don't
              receive the email within a few minutes.
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="faq-3">
          <AccordionTrigger>
            <div className="flex items-center">
              <HelpCircleIcon className="h-4 w-4 mr-2 text-primary" />
              <span>What payment methods do you accept?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p>We accept the following payment methods:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
              <li>Bank Transfer</li>
              <li>Apple Pay</li>
              <li>Google Pay</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A real-world example of using accordions for a Frequently Asked Questions (FAQ) section.",
      },
    },
  },
};
