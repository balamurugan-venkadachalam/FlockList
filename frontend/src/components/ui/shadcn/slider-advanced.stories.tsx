import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { Slider } from "./slider";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";

const meta = {
  title: "UI/Shadcn/Slider/Advanced",
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
 * Controlled slider example
 */
export const ControlledSlider: Story = {
  render: () => {
    // Use useState to control the slider value
    const [value, setValue] = useState<number[]>([50]);
    
    return (
      <div className="space-y-4 w-full max-w-md">
        <Slider 
          value={value} 
          onValueChange={setValue}
          min={0}
          max={100}
          step={1}
          showValue
        />
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value[0]}
            onChange={(e) => setValue([Number(e.target.value)])}
            className="w-20"
            min={0}
            max={100}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setValue([0])}
          >
            Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setValue([100])}
          >
            Max
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A controlled slider where the value is managed with React state and can be manipulated through other UI elements.",
      },
    },
  },
};

/**
 * Responsive slider
 */
export const ResponsiveSlider: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-medium">Responsive Width</p>
        <Slider 
          defaultValue={[60]} 
          className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2" 
          showValue
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Responsive Styling</p>
        <Slider 
          defaultValue={[70]} 
          trackClassName="h-1 sm:h-2 md:h-3" 
          thumbClassName="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" 
          showValue
        />
        <p className="text-xs text-muted-foreground mt-1">
          Track height and thumb size change based on screen width
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Sliders can be made responsive using Tailwind's responsive modifiers.",
      },
    },
    viewport: {
      defaultViewport: "md",
    },
  },
};

/**
 * Real-world usage examples
 */
export const UsageExamples: Story = {
  render: () => {
    const [volume, setVolume] = useState<number[]>([75]);
    const [brightness, setBrightness] = useState<number[]>([60]);
    const [priceRange, setPriceRange] = useState<number[]>([50, 200]);
    const [rating, setRating] = useState<number[]>([4]);
    
    return (
      <div className="space-y-10 w-full max-w-md">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Media Controls</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume">Volume</Label>
                <span className="text-sm">{volume[0]}%</span>
              </div>
              <Slider 
                id="volume"
                value={volume} 
                onValueChange={setVolume}
                className="w-full"
                aria-label="Volume"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="brightness">Brightness</Label>
                <span className="text-sm">{brightness[0]}%</span>
              </div>
              <Slider 
                id="brightness"
                value={brightness} 
                onValueChange={setBrightness}
                className="w-full"
                aria-label="Brightness"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Product Filters</h3>
          <div className="space-y-6 p-4 border rounded-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-range">Price Range</Label>
                <span className="text-sm">${priceRange[0]} - ${priceRange[1]}</span>
              </div>
              <Slider 
                id="price-range"
                value={priceRange} 
                onValueChange={setPriceRange}
                min={0}
                max={500}
                step={10}
                className="w-full"
                aria-label="Price Range"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rating">Minimum Rating</Label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill={star <= rating[0] ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={star <= rating[0] ? "text-yellow-400" : "text-gray-300"}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <Slider 
                id="rating"
                value={rating} 
                onValueChange={setRating}
                min={1}
                max={5}
                step={1}
                className="w-full"
                aria-label="Minimum Rating"
              />
            </div>
            
            <div className="flex justify-end">
              <Button size="sm">Apply Filters</Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Image Editor</h3>
          <div className="space-y-4 p-4 border rounded-md">
            <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
              Image Preview
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contrast">Contrast</Label>
                <Slider 
                  id="contrast"
                  defaultValue={[100]} 
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                  aria-label="Contrast"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="saturation">Saturation</Label>
                <Slider 
                  id="saturation"
                  defaultValue={[100]} 
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                  aria-label="Saturation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brightness">Brightness</Label>
                <Slider 
                  id="brightness-editor"
                  defaultValue={[100]} 
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                  aria-label="Brightness"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blur">Blur</Label>
                <Slider 
                  id="blur"
                  defaultValue={[0]} 
                  min={0}
                  max={20}
                  step={0.5}
                  className="w-full"
                  aria-label="Blur"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how sliders can be used: media controls, product filters, and image editing.",
      },
    },
  },
};

/**
 * Accessible slider with ARIA labels and keyboard navigation
 */
export const AccessibleSlider: Story = {
  render: () => {
    const [value, setValue] = useState<number[]>([50]);
    
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="space-y-2">
          <Label htmlFor="a11y-slider" className="text-sm font-medium">
            Accessible Slider
          </Label>
          <p className="text-sm text-muted-foreground">
            This slider has proper labeling and keyboard navigation. 
            Try using arrow keys, Home, and End to control it.
          </p>
          <Slider 
            id="a11y-slider"
            value={value} 
            onValueChange={setValue}
            min={0}
            max={100}
            step={10}
            showValue
            aria-valuetext={`${value[0]} percent`}
            aria-label="Percentage"
          />
          <div className="text-xs text-muted-foreground mt-2">
            <p><strong>Keyboard controls:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Arrow Right/Up: Increase by one step</li>
              <li>Arrow Left/Down: Decrease by one step</li>
              <li>Page Up: Increase by 10 steps</li>
              <li>Page Down: Decrease by 10 steps</li>
              <li>Home: Set to minimum value</li>
              <li>End: Set to maximum value</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "An accessible slider with proper ARIA attributes and keyboard navigation instructions.",
      },
    },
  },
};
