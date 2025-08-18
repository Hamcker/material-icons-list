#!/usr/bin/env node

import { list, IconSource } from "./index.js";

interface CliArgs {
  source?: IconSource;
  json?: boolean;
  text?: boolean;
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

function printHelp(): void {
  console.log(`
Material Icons List (milist) - Generate a list of Material Icons

Usage:
  milist --source <source> [--json|--text]
  milist --help

Options:
  --source <source>    Source platform (android, ios, web) [required]
  --json              Output in JSON format
  --text              Output in text format (default)
  --help, -h          Show this help message

Examples:
  milist --source web
  milist --source web --json
  milist --source android --text
  
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

    // Default to text format if neither json nor text is specified
    const outputJson = parsedArgs.json && !parsedArgs.text;

    console.error(`Fetching ${parsedArgs.source} icons...`);
    const icons = await list(parsedArgs.source);

    if (outputJson) {
      console.log(JSON.stringify(icons, null, 2));
    } else {
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
