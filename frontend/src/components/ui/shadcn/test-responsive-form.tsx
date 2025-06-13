import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

/**
 * A test component that demonstrates responsive design and accessibility features
 * using the new Shadcn UI components.
 * 
 * This component shows how to:
 * 1. Create responsive layouts that adapt to different screen sizes
 * 2. Implement proper accessibility patterns
 * 3. Use Shadcn UI components together
 * 4. Replace Material UI components with Shadcn UI equivalents
 */
export function TestResponsiveForm() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Responsive Form Example</h1>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle as="h2">User Registration</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form className="space-y-6">
            {/* Personal Information Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium">Personal Information</legend>
              
              {/* Name fields - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" required>First Name</Label>
                  <Input 
                    id="first-name" 
                    placeholder="Enter your first name" 
                    fullWidth
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name" required>Last Name</Label>
                  <Input 
                    id="last-name" 
                    placeholder="Enter your last name" 
                    fullWidth
                    aria-required="true"
                  />
                </div>
              </div>
              
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" required>Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email address" 
                  fullWidth
                  helperText="We'll never share your email with anyone else"
                  aria-required="true"
                />
              </div>
              
              {/* Phone field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Enter your phone number" 
                  fullWidth
                />
              </div>
            </fieldset>
            
            {/* Address Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium">Address Information</legend>
              
              {/* Street address */}
              <div className="space-y-2">
                <Label htmlFor="street" required>Street Address</Label>
                <Input 
                  id="street" 
                  placeholder="Enter your street address" 
                  fullWidth
                  aria-required="true"
                />
              </div>
              
              {/* City, State, Zip - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" required>City</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter your city" 
                    fullWidth
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state" required>State/Province</Label>
                  <Select>
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="al">Alabama</SelectItem>
                      <SelectItem value="ak">Alaska</SelectItem>
                      <SelectItem value="az">Arizona</SelectItem>
                      <SelectItem value="ca">California</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="tx">Texas</SelectItem>
                      {/* Add more states as needed */}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip" required>ZIP/Postal Code</Label>
                  <Input 
                    id="zip" 
                    placeholder="Enter ZIP code" 
                    fullWidth
                    aria-required="true"
                  />
                </div>
              </div>
              
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" required>Country</Label>
                <Select>
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="mx">Mexico</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    {/* Add more countries as needed */}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
            
            {/* Preferences Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium">Preferences</legend>
              
              {/* Notification preferences */}
              <div className="space-y-2">
                <Label htmlFor="notifications" required>Notification Preferences</Label>
                <Select>
                  <SelectTrigger id="notifications" className="w-full">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="important">Important only</SelectItem>
                    <SelectItem value="none">No notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" size="responsive">Cancel</Button>
          <Button size="responsive">Submit</Button>
        </CardFooter>
      </Card>
      
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
    </div>
  );
}

export default TestResponsiveForm;
