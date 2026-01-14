# TaskMaster Frontend

This is the frontend for the TaskMaster application, built with React, TypeScript, and Vite.

## Tech Stack

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library built on Radix UI primitives
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **React Router**: Client-side routing
- **Storybook**: Component documentation and testing

## UI Component Migration

This project has been migrated from Material UI to Tailwind CSS and Shadcn UI components. The migration provides several benefits:

- **Improved performance**: Reduced bundle size and better runtime performance
- **Enhanced customization**: More flexible styling with Tailwind's utility classes
- **Better accessibility**: Improved keyboard navigation and screen reader support
- **Consistent design system**: Based on Radix UI primitives for reliable, accessible components

### Migration Status

- ✅ NotificationPreferencesPage.tsx
- ✅ NotificationPreferencesForm.tsx
- ✅ Unauthorized.tsx

### Migration Guidelines

When migrating components from Material UI to Shadcn UI and Tailwind CSS:

1. Replace Material UI components with equivalent Shadcn UI components
2. Use Tailwind CSS utility classes for styling
3. Implement proper accessibility attributes (ARIA)
4. Ensure responsive design with Tailwind's responsive utilities
5. Create Storybook stories for component documentation and testing

### Accessibility

All migrated components follow WCAG 2.1 AA standards with:

- Proper keyboard navigation
- ARIA attributes for screen readers
- Sufficient color contrast
- Focus management
- Responsive design for all screen sizes

Refer to `src/docs/accessibility-guide.md` for detailed accessibility guidelines.

## Development

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

### Storybook

```bash
npm run storybook
```

## Adding New Shadcn UI Components

To add new Shadcn UI components:

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add button
```
