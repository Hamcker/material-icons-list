import fetch from "node-fetch";
import { config } from "dotenv";

// Load environment variables from .env file
config();

export type IconSource = "android" | "ios" | "web";

interface GitHubApiResponse {
  name: string;
  type: string;
}

interface GitHubRepoInfo {
  default_branch: string;
}

interface GitHubRefResponse {
  object: {
    sha: string;
  };
}

interface GitHubCommitResponse {
  tree: {
    sha: string;
  };
}

interface GitHubTreeEntry {
  path: string;
  type: string;
  sha: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeEntry[];
  truncated?: boolean;
}

/**
 * Helper function to fetch a tree non-recursively and return the entry for a given child path segment
 */
async function getChildTreeSha(
  owner: string,
  repo: string,
  treeSha: string,
  segment: string,
  headers: Record<string, string>
): Promise<string | null> {
  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}`,
    { headers }
  );

  if (!treeResponse.ok) {
    throw new Error(
      `Failed to fetch tree: ${treeResponse.status} ${treeResponse.statusText}`
    );
  }

  const tree = (await treeResponse.json()) as GitHubTreeResponse;
  const entry = tree.tree.find(
    (item) => item.type === "tree" && item.path === segment
  );

  return entry?.sha || null;
}

/**
 * Fetches the list of Material Icons from Google's Material Design Icons repository
 * @param source The source platform (android, ios, or web)
 * @returns Promise<string[]> Array of icon names
 */
export async function list(source: IconSource): Promise<string[]> {
  const owner = "google";
  const repo = "material-design-icons";
  const targetPath = `symbols/${source}`;

  const headers: Record<string, string> = {
    "User-Agent": "milist-nodejs",
  };

  // Add GitHub token if available (for better rate limits)
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // 1. Get repository info to learn default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!repoResponse.ok) {
      throw new Error(
        `Failed to fetch repository info: ${repoResponse.status} ${repoResponse.statusText}`
      );
    }

    const repoInfo = (await repoResponse.json()) as GitHubRepoInfo;
    const defaultBranch = repoInfo.default_branch;

    // 2. Get branch tip commit
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
      { headers }
    );

    if (!refResponse.ok) {
      throw new Error(
        `Failed to fetch branch ref: ${refResponse.status} ${refResponse.statusText}`
      );
    }

    const refObj = (await refResponse.json()) as GitHubRefResponse;
    const commitSha = refObj.object.sha;

    // 3. Get root tree from commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`,
      { headers }
    );

    if (!commitResponse.ok) {
      throw new Error(
        `Failed to fetch commit: ${commitResponse.status} ${commitResponse.statusText}`
      );
    }

    const commitObj = (await commitResponse.json()) as GitHubCommitResponse;
    const rootTreeSha = commitObj.tree.sha;

    // 4. Walk down to symbols/[source] (e.g., symbols/web)
    const segments = targetPath.split("/");
    let currentSha = rootTreeSha;

    for (const segment of segments) {
      const nextSha = await getChildTreeSha(
        owner,
        repo,
        currentSha,
        segment,
        headers
      );
      if (!nextSha) {
        throw new Error(
          `Path '${targetPath}' not found at branch '${defaultBranch}'.`
        );
      }
      currentSha = nextSha;
    }

    // 5. Get immediate child directories of symbols/[source]
    const targetTreeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${currentSha}`,
      { headers }
    );

    if (!targetTreeResponse.ok) {
      throw new Error(
        `Failed to fetch target tree: ${targetTreeResponse.status} ${targetTreeResponse.statusText}`
      );
    }

    const targetTree = (await targetTreeResponse.json()) as GitHubTreeResponse;

    // Filter for directories only and extract names
    const iconNames = targetTree.tree
      .filter((item) => item.type === "tree")
      .map((item) => item.path)
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
