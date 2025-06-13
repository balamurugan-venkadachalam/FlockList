import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./slider";

/**
 * # Slider Component
 * 
 * The Slider component is used for selecting a value from a range.
 * It replaces the Material UI Slider component with a fully accessible
 * alternative built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Multiple variants (default, success, warning, destructive)
 * - Single and range sliders
 * - Optional value display
 * - Custom value formatting
 * - Customizable styling
 * 
 * ## Accessibility Considerations
 * - Keyboard navigation support
 * - Proper ARIA attributes for screen readers
 * - Focus indicators
 * - Sufficient color contrast
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Slider Props to Shadcn Slider Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `value` | `value` | Same functionality |
 * | `defaultValue` | `defaultValue` | Same functionality |
 * | `min` | `min` | Same functionality |
 * | `max` | `max` | Same functionality |
 * | `step` | `step` | Same functionality |
 * | `marks` | N/A | Not directly supported, can be implemented with custom styling |
 * | `valueLabelDisplay` | `showValue` | Different naming |
 * | `color` | `variant` | Different options: "default", "success", "warning", "destructive" |
 * | `sx` | `className` | Use Tailwind classes |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Slider
 *   value={value}
 *   min={0}
 *   max={100}
 *   step={1}
 *   valueLabelDisplay="auto"
 *   color="primary"
 * />
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Slider
 *   value={[value]}
 *   min={0}
 *   max={100}
 *   step={1}
 *   showValue
 *   variant="default"
 * />
 * ```
 */
const meta = {
  title: "UI/Shadcn/Slider/Basic",
  component: Slider,
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
    value: {
      control: "object",
      description: "The controlled value of the slider",
    },
    defaultValue: {
      control: "object",
      description: "The default value of the slider",
    },
    min: {
      control: { type: "number" },
      description: "The minimum value of the slider",
    },
    max: {
      control: { type: "number" },
      description: "The maximum value of the slider",
    },
    step: {
      control: { type: "number" },
      description: "The step increment value",
    },
    disabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
    },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "destructive"],
      description: "The visual style of the slider",
    },
    showValue: {
      control: "boolean",
      description: "Whether to show the current value",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic slider example with default settings
 */
export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
  },
};

/**
 * Slider with value display
 */
export const WithValueDisplay: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
  },
};

/**
 * Disabled slider
 */
export const Disabled: Story = {
  args: {
    defaultValue: [30],
    min: 0,
    max: 100,
    step: 1,
    disabled: true,
  },
};

/**
 * Slider with custom step
 */
export const CustomStep: Story = {
  args: {
    defaultValue: [25],
    min: 0,
    max: 100,
    step: 25,
    showValue: true,
  },
};
