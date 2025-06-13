import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * # Dialog Component
 * 
 * The Dialog component is a modal overlay that presents content over the page.
 * It replaces the Material UI Dialog/Modal component with a fully responsive and accessible alternative
 * built with Radix UI primitives and Tailwind CSS.
 * 
 * ## Features
 * - Built on Radix UI's accessible dialog primitive
 * - Focus management and keyboard navigation
 * - Multiple size variants
 * - Customizable header, body, and footer sections
 * - Responsive design for all screen sizes
 * - Animated transitions
 * 
 * ## Accessibility Considerations
 * - Proper ARIA attributes for screen readers
 * - Focus is trapped within the dialog when open
 * - Keyboard navigation support (Tab, Escape)
 * - Returns focus to the trigger element when closed
 * - Proper heading structure
 * - Close button has proper aria-label
 * 
 * ## Migration from Material UI
 * 
 * ### Material UI Dialog Props to Shadcn Dialog Props
 * | Material UI Prop | Shadcn UI Equivalent | Notes |
 * | --------------- | -------------------- | ----- |
 * | `open` | `open` | Same functionality |
 * | `onClose` | `onOpenChange` | Different callback signature |
 * | `maxWidth` | `size` | Use "sm", "md", "lg", "xl", "full" |
 * | `fullWidth` | N/A | Use size="full" instead |
 * | `DialogTitle` | `DialogTitle` | Similar functionality |
 * | `DialogContent` | `DialogContent` | Similar functionality |
 * | `DialogActions` | `DialogFooter` | Similar functionality |
 * | `aria-labelledby` | Handled automatically | |
 * | `aria-describedby` | Handled automatically | |
 * 
 * ### Example Migration
 * 
 * Material UI:
 * ```tsx
 * <Dialog open={open} onClose={handleClose} maxWidth="sm">
 *   <DialogTitle>Subscribe</DialogTitle>
 *   <DialogContent>
 *     <DialogContentText>
 *       Subscribe to our newsletter to receive updates.
 *     </DialogContentText>
 *     <TextField
 *       autoFocus
 *       margin="dense"
 *       id="email"
 *       label="Email Address"
 *       type="email"
 *       fullWidth
 *     />
 *   </DialogContent>
 *   <DialogActions>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button onClick={handleSubscribe} variant="contained">Subscribe</Button>
 *   </DialogActions>
 * </Dialog>
 * ```
 * 
 * Shadcn UI:
 * ```tsx
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogContent size="sm">
 *     <DialogHeader>
 *       <DialogTitle>Subscribe</DialogTitle>
 *       <DialogDescription>
 *         Subscribe to our newsletter to receive updates.
 *       </DialogDescription>
 *     </DialogHeader>
 *     <div className="py-4">
 *       <div className="space-y-2">
 *         <Label htmlFor="email">Email Address</Label>
 *         <Input id="email" type="email" autoFocus />
 *       </div>
 *     </div>
 *     <DialogFooter>
 *       <DialogClose asChild>
 *         <Button variant="outline">Cancel</Button>
 *       </DialogClose>
 *       <Button onClick={handleSubscribe}>Subscribe</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
const meta = {
  title: "UI/Shadcn/Dialog",
  component: DialogContent,
  parameters: {
    layout: "centered",
    // Enable a11y checks for this component
    a11y: {
      config: {
        rules: [
          {
            id: "aria-dialog-name",
            enabled: true,
          },
          {
            id: "dialog-role",
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
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "The size of the dialog",
    },
    hideCloseButton: {
      control: "boolean",
      description: "Whether to hide the close button",
    },
  },
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic dialog with title, description, and actions
 */
export const Default: Story = {
  render: (args) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent {...args}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is a description of the dialog content and purpose.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Dialog content goes here. This can contain any components or text.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
  args: {
    size: "md",
  },
};

/**
 * Dialog with form inputs
 */
export const FormDialog: Story = {
  render: (args) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Form</Button>
        </DialogTrigger>
        <DialogContent {...args}>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
  args: {
    size: "md",
  },
};

/**
 * Dialog with different sizes
 */
export const Sizes: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Small</Button>
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Small Dialog</DialogTitle>
              <DialogDescription>
                This is a small dialog (max-width: 384px).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Content for a small dialog.</p>
            </div>
            <DialogFooter>
              <Button>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Medium</Button>
          </DialogTrigger>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>Medium Dialog</DialogTitle>
              <DialogDescription>
                This is a medium dialog (max-width: 448px).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Content for a medium dialog.</p>
            </div>
            <DialogFooter>
              <Button>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Large</Button>
          </DialogTrigger>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Large Dialog</DialogTitle>
              <DialogDescription>
                This is a large dialog (max-width: 512px).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Content for a large dialog.</p>
            </div>
            <DialogFooter>
              <Button>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Extra Large</Button>
          </DialogTrigger>
          <DialogContent size="xl">
            <DialogHeader>
              <DialogTitle>Extra Large Dialog</DialogTitle>
              <DialogDescription>
                This is an extra large dialog (max-width: 576px).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Content for an extra large dialog.</p>
            </div>
            <DialogFooter>
              <Button>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Full Width</Button>
          </DialogTrigger>
          <DialogContent size="full">
            <DialogHeader>
              <DialogTitle>Full Width Dialog</DialogTitle>
              <DialogDescription>
                This dialog takes up most of the screen width.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Content for a full width dialog.</p>
            </div>
            <DialogFooter>
              <Button>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
  parameters: {
    layout: "padded",
  },
};

/**
 * Dialog without a close button
 */
export const NoCloseButton: Story = {
  render: () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent hideCloseButton>
          <DialogHeader>
            <DialogTitle>Important Notice</DialogTitle>
            <DialogDescription>
              This dialog has no close button and must be closed using the actions below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>You must make a choice to proceed.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Decline</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Accept</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

/**
 * Controlled dialog example
 */
export const ControlledDialog: Story = {
  render: () => {
    // Use useState to control the dialog open state
    const [open, setOpen] = useState(false);
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Controlled Dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <DialogDescription>
                This dialog's open state is controlled programmatically.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>You can control when this dialog opens and closes through state.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

/**
 * Responsive dialog with complex content
 */
export const ResponsiveDialog: Story = {
  render: () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Responsive Dialog</Button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View and edit product information
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" defaultValue="Premium Headphones" />
              </div>
              <div>
                <Label htmlFor="product-category">Category</Label>
                <Input id="product-category" defaultValue="Electronics" />
              </div>
              <div>
                <Label htmlFor="product-price">Price</Label>
                <Input id="product-price" defaultValue="$299.99" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-stock">Stock</Label>
                <Input id="product-stock" defaultValue="150" type="number" />
              </div>
              <div>
                <Label htmlFor="product-sku">SKU</Label>
                <Input id="product-sku" defaultValue="HDPHN-PRO-123" />
              </div>
              <div>
                <Label htmlFor="product-status">Status</Label>
                <Input id="product-status" defaultValue="In Stock" />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <textarea
                id="product-description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                defaultValue="Premium noise-cancelling headphones with high-fidelity sound and comfortable ear cups for extended listening sessions."
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <div className="flex gap-2">
              <Button variant="outline">Delete</Button>
              <Button>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "A responsive dialog with a complex form layout that adapts to different screen sizes. On small screens, form fields stack vertically; on larger screens, they display in a two-column grid.",
      },
    },
  },
};
