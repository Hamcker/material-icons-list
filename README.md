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

# if you want to use just once
npx milist --source web > output.txt
npx milist --source web --json > output.json
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
