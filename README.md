# Material Icons List

This is a simple tool to generate a list of Material Icons available in the [Material Icons](https://fonts.google.com/icons) font. It uses [This Repo](https://github.com/google/material-design-icons) as a source.

> IMPORTANT: This tool requires Internet connection to work.
> 
> **Rate Limits**: This tool uses GitHub's API which has rate limits. For better performance and higher rate limits, set up a GitHub token:
> 
> 1. **Environment Variable**: Set `GITHUB_TOKEN` environment variable
> 2. **Or use .env file**: Copy `env.example` to `.env` and add your token
> 3. **Get a token**: Visit [GitHub Settings > Tokens](https://github.com/settings/tokens) (no special permissions needed)

## How to use

### As a CLI
```bash
# if you want to install it globally
npm i -g milist
milist --source web > output.txt
milist --source web --json > output.json
milist --source web --ts > material-icons.ts

# if you want to use just once
npx milist --source web > output.txt
npx milist --source web --json > output.json
npx milist --source web --ts > material-icons.ts
```

### As a Library (CommonJs)

```ts
const { list } = require('milist');
const icons: string[] = list('web');
console.log(icons); // list of icons in string[] format
```

### As a Library (ESM)

```ts
import { list } from 'milist';
const icons: string[] = list('web');
console.log(icons); // list of icons in string[] format
```

## Parameters

### `--source`

* `android`: will use the android source 
* `ios`: will use the ios source
* `web`: will use the web source

### Output format

* `--json`: With JSON format
* `--text`: With simple text format (each name in a new line)
* `--ts`: With TypeScript format (const array + type definition)

#### TypeScript Output Example
```typescript
// Generated with: milist --source web --ts > material-icons.ts
export const icons = [
  "10k",
  "10mp",
  "home",
  "search",
  // ... all 3,925+ icons
] as const;

export type MaterialIcon = typeof icons[number];

// Usage in your TypeScript project:
import { icons, MaterialIcon } from './material-icons';

const myIcon: MaterialIcon = "home"; // Type-safe!
const iconExists = icons.includes("search"); // true
```

## Testing

This package includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:simple      # Basic functionality tests
npm run test:cli         # Command-line interface tests  
npm run test:functional  # Real API tests (requires GITHUB_TOKEN)

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Note**: Functional tests require a `GITHUB_TOKEN` environment variable for better rate limits when testing against the real GitHub API.
