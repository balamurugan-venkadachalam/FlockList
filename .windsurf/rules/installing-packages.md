---
trigger: model_decision
description: How to install packages
globs: 
---
- Use `pnpm`.
- Don't install in root. Install in `apps/web`:

```sh
cd apps/web
pnpm add ...
```
