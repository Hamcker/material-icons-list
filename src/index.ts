import fetch from "node-fetch";

export type IconSource = "android" | "ios" | "web";

interface GitHubApiResponse {
  name: string;
  type: string;
}

/**
 * Fetches the list of Material Icons from Google's Material Design Icons repository
 * @param source The source platform (android, ios, or web)
 * @returns Promise<string[]> Array of icon names
 */
export async function list(source: IconSource): Promise<string[]> {
  const baseUrl =
    "https://api.github.com/repos/google/material-design-icons/contents/symbols";

  let sourcePath: string;
  switch (source) {
    case "android":
      sourcePath = "android";
      break;
    case "ios":
      sourcePath = "ios";
      break;
    case "web":
      sourcePath = "web";
      break;
    default:
      throw new Error(
        `Invalid source: ${source}. Must be one of: android, ios, web`
      );
  }

  try {
    // Directly fetch from the source directory (e.g., symbols/web, symbols/android, etc.)
    const sourceResponse = await fetch(`${baseUrl}/${sourcePath}`);

    if (!sourceResponse.ok) {
      throw new Error(
        `Failed to fetch ${source} icons: ${sourceResponse.status} ${sourceResponse.statusText}`
      );
    }

    const sourceData = (await sourceResponse.json()) as GitHubApiResponse[];

    // Get all icon directories (filter out non-directories)
    const iconNames = sourceData
      .filter((item) => item.type === "dir")
      .map((item) => item.name)
      .sort();

    return iconNames;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Material Icons: ${error.message}`);
    }
    throw new Error("Failed to fetch Material Icons: Unknown error");
  }
}

/**
 * Legacy export for CommonJS compatibility
 */
module.exports = { list };
