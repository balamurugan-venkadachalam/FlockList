import type { Meta, StoryObj } from "@storybook/react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent
} from "./popover";
import { Button } from "./button";

const meta = {
  title: "UI/Shadcn/Popover/Positioning",
  component: Popover,
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
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Different alignment options for the popover
 */
export const Alignment: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-60">
          <p className="text-sm">
            This popover is centered relative to the trigger.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60">
          <p className="text-sm">
            This popover is aligned to the start of the trigger.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align End</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60">
          <p className="text-sm">
            This popover is aligned to the end of the trigger.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popovers with different alignment options: center, start, and end.",
      },
    },
  },
};

/**
 * Different side offset values for the popover
 */
export const SideOffset: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Offset: 4px</Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={4} className="w-60">
          <p className="text-sm">
            This popover has a 4px offset from the trigger (default).
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Offset: 10px</Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={10} className="w-60">
          <p className="text-sm">
            This popover has a 10px offset from the trigger.
          </p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Offset: 20px</Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={20} className="w-60">
          <p className="text-sm">
            This popover has a 20px offset from the trigger.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Popovers with different side offset values: 4px (default), 10px, and 20px.",
      },
    },
  },
};

/**
 * Popover positioning grid
 */
export const PositioningGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex justify-start">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Top-Left</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-40">
            <p className="text-xs">Top-left position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Top</Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-40">
            <p className="text-xs">Top position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Top-Right</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40">
            <p className="text-xs">Top-right position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-start">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Left</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-40">
            <p className="text-xs">Left position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Center</Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-40">
            <p className="text-xs">Center position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Right</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40">
            <p className="text-xs">Right position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-start">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Bottom-Left</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-40">
            <p className="text-xs">Bottom-left position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Bottom</Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-40">
            <p className="text-xs">Bottom position</p>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Bottom-Right</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40">
            <p className="text-xs">Bottom-right position</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A grid of popovers demonstrating different positioning combinations.",
      },
    },
  },
};
