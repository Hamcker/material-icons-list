#!/usr/bin/env node

import { list, IconSource } from "./index.js";

interface CliArgs {
  source?: IconSource;
  json?: boolean;
  text?: boolean;
  ts?: boolean;
  help?: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const parsed: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--source":
        const source = args[i + 1];
        if (!source || !["android", "ios", "web"].includes(source)) {
          throw new Error("Invalid source. Must be one of: android, ios, web");
        }
        parsed.source = source as IconSource;
        i++; // Skip next argument as it's the value
        break;
      case "--json":
        parsed.json = true;
        break;
      case "--text":
        parsed.text = true;
        break;
      case "--ts":
        parsed.ts = true;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      default:
        if (arg.startsWith("--")) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }

  return parsed;
}

function generateTypeScriptOutput(icons: string[]): string {
  const currentDate = new Date().toISOString().split("T")[0];
  const iconCount = icons.length;

  // Format icons array with proper indentation
  const formattedIcons = icons.map((icon) => `  "${icon}"`).join(",\n");

  return `/**
 * Material Design Icons
 * Generated on ${currentDate}
 * Total icons: ${iconCount}
 * 
 * Usage:
 *   import { icons, MaterialIcon } from './material-icons';
 *   
 *   const myIcon: MaterialIcon = "home"; // Type-safe icon selection
 *   const allIcons = icons; // Array of all available icons
 */

export const icons = [
${formattedIcons}
] as const;

export type MaterialIcon = typeof icons[number];

// Default export for convenience
export default icons;
`;
}

function printHelp(): void {
  console.log(`
Material Icons List (milist) - Generate a list of Material Icons

Usage:
  milist --source <source> [--json|--text|--ts]
  milist --help

Options:
  --source <source>    Source platform (android, ios, web) [required]
  --json              Output in JSON format
  --text              Output in text format (default)
  --ts                Output as TypeScript file with const array and type
  --help, -h          Show this help message

Examples:
  milist --source web
  milist --source web --json
  milist --source android --text
  milist --source web --ts > material-icons.ts
  
Note: This tool requires an internet connection to fetch the latest icons.
`);
}

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const parsedArgs = parseArgs(args);

    if (parsedArgs.help) {
      printHelp();
      return;
    }

    if (!parsedArgs.source) {
      console.error("Error: --source is required");
      console.error('Run "milist --help" for usage information');
      process.exit(1);
    }

    // Determine output format
    const outputJson = parsedArgs.json && !parsedArgs.text && !parsedArgs.ts;
    const outputTs = parsedArgs.ts && !parsedArgs.json && !parsedArgs.text;
    // Default to text format if no format specified

    console.error(`Fetching ${parsedArgs.source} icons...`);
    const icons = await list(parsedArgs.source);

    if (outputJson) {
      console.log(JSON.stringify(icons, null, 2));
    } else if (outputTs) {
      // Generate TypeScript output
      const tsContent = generateTypeScriptOutput(icons);
      console.log(tsContent);
    } else {
      // Default text format
      icons.forEach((icon) => console.log(icon));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
