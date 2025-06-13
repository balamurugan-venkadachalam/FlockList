# Accessibility Guide for Shadcn UI Migration

This guide outlines the accessibility standards and best practices to follow when migrating components from Material UI to Shadcn UI. All migrated components must adhere to these guidelines to ensure a fully accessible user experience.

## WCAG Compliance Standards

All components must meet WCAG 2.1 AA standards at minimum, with AAA compliance where possible:

- **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
- **Operable**: UI components and navigation must be operable
- **Understandable**: Information and operation of the UI must be understandable
- **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents

## Component-Specific Guidelines

### Buttons

- Use semantic `<button>` elements for clickable actions
- Provide descriptive text that explains the button's purpose
- Include `aria-label` for icon-only buttons
- Ensure focus states are clearly visible
- Maintain minimum touch target size of 44×44px for mobile
- Use `aria-disabled="true"` alongside `disabled` attribute

```tsx
// Good example
<Button 
  variant="default"
  aria-label="Save document" // For icon-only buttons
  disabled={isDisabled}
  aria-disabled={isDisabled}
>
  Save
</Button>
```

### Form Controls (Input, Select)

- Always associate labels with form controls using `htmlFor` and `id`
- Provide error messages with `aria-invalid` and `aria-describedby`
- Use `required` attribute and visual indicators for required fields
- Ensure form validation errors are announced to screen readers
- Group related form elements with `fieldset` and `legend`

```tsx
// Good example
<div>
  <Label htmlFor="email" required>Email</Label>
  <Input 
    id="email" 
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
    error={!!error}
    errorMessage={error}
  />
  {error && <p id="email-error" className="text-destructive text-sm">{error}</p>}
</div>
```

### Cards and Containers

- Use proper heading hierarchy (`h1`-`h6`)
- Ensure sufficient color contrast for text content
- Provide focus management for interactive cards
- Use semantic HTML structure within cards

```tsx
// Good example
<Card>
  <CardHeader>
    <CardTitle as="h2">Section Title</CardTitle>
    <CardDescription>Description text with proper contrast</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content with semantic structure</p>
  </CardContent>
</Card>
```

## Keyboard Navigation

All components must be fully keyboard accessible:

- Ensure all interactive elements are focusable
- Implement logical tab order following visual layout
- Support arrow key navigation in complex widgets
- Provide keyboard shortcuts for common actions
- Ensure focus is visible and prominent
- Implement focus trapping for modals and dialogs

## Screen Reader Support

Components must work with popular screen readers (NVDA, JAWS, VoiceOver):

- Use appropriate ARIA roles, states, and properties
- Provide text alternatives for non-text content
- Announce dynamic content changes
- Test with actual screen readers

## Color and Contrast

- Maintain minimum contrast ratio of 4.5:1 for normal text
- Maintain minimum contrast ratio of 3:1 for large text
- Don't rely solely on color to convey information
- Provide visual indicators alongside color changes
- Test with color blindness simulators

## Responsive Accessibility

- Ensure accessibility across all screen sizes
- Maintain touch target sizes on mobile
- Adjust font sizes appropriately across breakpoints
- Test zoom functionality up to 200%

```tsx
// Good example of responsive accessibility
<Button 
  className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2"
  size="responsive"
>
  Submit
</Button>
```

## Testing Checklist

For each component, verify:

- [ ] Keyboard navigation works as expected
- [ ] Screen readers announce all relevant information
- [ ] Color contrast meets WCAG AA standards
- [ ] Component works at different zoom levels and screen sizes
- [ ] All interactive elements have visible focus states
- [ ] Error states are properly communicated
- [ ] Touch targets are appropriately sized

## Tools for Testing

- **Automated Testing**: Use Storybook's a11y addon
- **Screen Readers**: Test with NVDA (Windows), VoiceOver (Mac), or JAWS
- **Contrast Checkers**: WebAIM Contrast Checker or browser dev tools
- **Keyboard Testing**: Navigate using Tab, Shift+Tab, Enter, Space, and arrow keys

## Migration Process

1. Identify accessibility issues in current Material UI implementation
2. Create accessible Shadcn UI component with proper ARIA attributes
3. Test component with keyboard navigation
4. Test component with screen readers
5. Verify color contrast and responsive behavior
6. Document accessibility features in Storybook stories
7. Include accessibility tests in component test suite

By following these guidelines, we ensure that our migration from Material UI to Shadcn UI not only maintains but improves the accessibility of our application.
