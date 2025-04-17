# TaskMaster Cursor Rules

These rules provide guidance for maintaining consistency and avoiding common errors in the TaskMaster project.

## Rule File Format
- All rule files use the `.mdc` extension
- Rules are located in the `.cursor/rules` directory at the project root
- See `cursor-rules-management.mdc` for complete guidelines on creating and managing rules

## Rule Auto-Attachment
Rules with properly configured frontmatter will be automatically attached to conversations when you're working with relevant files. For example:
- When working with a test file (`*.test.ts`), the `testing-guidelines.mdc` rule will be attached
- When working with auth-related files, the `jwt.mdc` rule will be attached
- The `directory-structure.mdc` rule applies to all directories

## Rule Usage in Conversations
When explicitly referencing rules, use the `fetch_rules` tool:
```
fetch_rules(["rule-name"]);
```

When implementing features, explicitly mention which rules guided your implementation:
```
// Following the jwt.mdc rule, using JWT_ACCESS_SECRET for token verification
```

See `rule-usage-example.mdc` for more detailed examples.

## Available Rules

### Project Structure
- **directory-structure.mdc**: Guidelines for project directory structure and command execution to avoid issues like nested folders and incorrect paths.
- **project-structure.mdc**: Detailed organization of files and directories across the project.

### API Development
- **api-documentation.mdc**: Comprehensive rules for maintaining API documentation using OpenAPI specification.
- **api-routes.mdc**: Guidelines for implementing Next.js API routes.
- **get-api-route.mdc**: Specific guidelines for implementing GET API routes in Next.js.

### Authentication
- **jwt.mdc**: Standards for JWT implementation, including secret keys, token generation, and verification.

### Data Management
- **data-fetching.mdc**: Guidelines for fetching data from the API using SWR.
- **prisma.mdc**: Rules for using Prisma in the project.

### Testing
- **testing-guidelines.mdc**: Comprehensive testing guidelines including framework selection, structure, workflow, coverage requirements, mocking strategies, and best practices. (Consolidates previous testing rules)

### UI Development
- **ui-components.mdc**: UI component and styling guidelines using Shadcn UI, Radix UI, and Tailwind.
- **form-handling.mdc**: Standards for form handling in the application.
- **page-structure.mdc**: Guidelines for structuring pages.

### Server Features
- **server-actions.mdc**: Guidelines for implementing Next.js server actions.
- **environment-variables.mdc**: Guidelines for adding and using environment variables.
- **logging.mdc**: Standards for backend logging.
- **llm.mdc**: Guidelines for implementing LLM functionality.
- **gmail-api.mdc**: Guidelines for working with Gmail API.

### Utilities
- **utilities.mdc**: Guidelines for utility functions.
- **installing-packages.mdc**: Standards for installing packages.

### Meta Rules
- **cursor-rules-management.mdc**: Comprehensive standards for managing Cursor rules, including file location, naming, structure, and maintenance. (Consolidates previous cursor rules)
- **rule-usage-example.mdc**: Examples showing how to properly reference and use Cursor rules in your work.

## Rules are automatically loaded when working with files in the project. 