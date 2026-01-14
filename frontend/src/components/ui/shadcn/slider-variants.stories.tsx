import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";

const meta = {
  title: "UI/Shadcn/Slider/Variants",
  component: Slider,
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
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Different color variants for the slider
 */
export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default</p>
        <Slider defaultValue={[60]} variant="default" showValue />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Success</p>
        <Slider defaultValue={[70]} variant="success" showValue />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Warning</p>
        <Slider defaultValue={[40]} variant="warning" showValue />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Destructive</p>
        <Slider defaultValue={[20]} variant="destructive" showValue />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Sliders in different color variants: default (primary), success, warning, and destructive.",
      },
    },
  },
};

/**
 * Range slider with two thumbs
 */
export const RangeSlider: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Range</p>
        <Slider 
          defaultValue={[25, 75]} 
          min={0} 
          max={100} 
          step={1} 
          showValue 
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Formatted Range</p>
        <Slider 
          defaultValue={[30, 70]} 
          min={0} 
          max={100} 
          step={1} 
          showValue 
          formatValue={(value) => `${value[0]} - ${value[1]} (Range: ${value[1] - value[0]})`}
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Price Range</p>
        <Slider 
          defaultValue={[50, 200]} 
          min={0} 
          max={500} 
          step={10} 
          showValue 
          formatValue={(value) => `$${value[0]} - $${value[1]}`}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Range sliders with two thumbs for selecting a range of values.",
      },
    },
  },
};

/**
 * Custom styled sliders
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Track Height</p>
        <Slider 
          defaultValue={[50]} 
          trackClassName="h-1" 
          showValue 
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Thumb</p>
        <Slider 
          defaultValue={[60]} 
          thumbClassName="h-6 w-6 bg-primary border-0" 
          showValue 
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Colors</p>
        <Slider 
          defaultValue={[70]} 
          trackClassName="bg-gray-200" 
          rangeClassName="bg-blue-600" 
          thumbClassName="border-blue-600" 
          showValue 
          valueDisplayClassName="text-blue-600"
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Gradient Track</p>
        <Slider 
          defaultValue={[80]} 
          rangeClassName="bg-gradient-to-r from-blue-500 to-purple-500" 
          thumbClassName="border-purple-500" 
          showValue 
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Sliders with custom styling applied to different parts using the className props.",
      },
    },
  },
};
