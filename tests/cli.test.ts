import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

describe("CLI Tests", () => {
  const cliPath = path.join(__dirname, "..", "dist", "cli.js");
  const testTimeout = 30000;

  beforeAll(async () => {
    // Ensure the project is built before running CLI tests
    try {
      await execAsync("npm run build");
    } catch (error) {
      console.warn("Build failed, CLI tests may fail:", error);
    }
  });

  describe("Help and Error Handling", () => {
    it("should show help when --help is provided", async () => {
      const { stdout } = await execAsync(`node "${cliPath}" --help`);

      expect(stdout).toContain("Material Icons List (milist)");
      expect(stdout).toContain("Usage:");
      expect(stdout).toContain("--source");
      expect(stdout).toContain("--json");
      expect(stdout).toContain("--text");
      expect(stdout).toContain("--ts");
    });

    it("should show help when -h is provided", async () => {
      const { stdout } = await execAsync(`node "${cliPath}" -h`);

      expect(stdout).toContain("Material Icons List (milist)");
      expect(stdout).toContain("Usage:");
    });

    it("should show error when no source is provided", async () => {
      try {
        await execAsync(`node "${cliPath}"`);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe(1);
        expect(error.stderr).toContain("Error: --source is required");
      }
    });

    it("should show error for invalid source", async () => {
      try {
        await execAsync(`node "${cliPath}" --source invalid`);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe(1);
        expect(error.stderr).toContain("Invalid source");
      }
    });

    it("should show error for unknown option", async () => {
      try {
        await execAsync(`node "${cliPath}" --unknown`);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe(1);
        expect(error.stderr).toContain("Unknown option: --unknown");
      }
    });
  });

  describe("Mocked API Tests", () => {
    // For unit testing CLI without hitting real API, we'd need to mock the list function
    // This is more complex with the current setup, so we'll skip these for now
    // In a real-world scenario, you might want to refactor to allow dependency injection
  });

  // Integration tests with real API (skipped by default)
  const isIntegrationTest = process.env.RUN_INTEGRATION_TESTS === "true";

  (isIntegrationTest ? describe : describe.skip)("Real API CLI Tests", () => {
    it(
      "should fetch and output text format",
      async () => {
        const { stdout, stderr } = await execAsync(
          `node "${cliPath}" --source web --text`
        );

        expect(stderr).toContain("Fetching web icons...");

        const lines = stdout.trim().split("\n");
        expect(lines.length).toBeGreaterThan(1000);

        // Check that output looks like icon names
        expect(lines[0]).toMatch(/^[a-z0-9_]+$/);
        expect(lines).toContain("home");
        expect(lines).toContain("search");

        console.log(`✅ CLI text output: ${lines.length} icons`);
      },
      testTimeout
    );

    it(
      "should fetch and output JSON format",
      async () => {
        const { stdout, stderr } = await execAsync(
          `node "${cliPath}" --source web --json`
        );

        expect(stderr).toContain("Fetching web icons...");

        const icons = JSON.parse(stdout);
        expect(Array.isArray(icons)).toBe(true);
        expect(icons.length).toBeGreaterThan(1000);
        expect(icons).toContain("home");
        expect(icons).toContain("search");

        console.log(`✅ CLI JSON output: ${icons.length} icons`);
      },
      testTimeout
    );

    it(
      "should work with different sources",
      async () => {
        const sources = ["web", "android", "ios"];

        for (const source of sources) {
          const { stdout, stderr } = await execAsync(
            `node "${cliPath}" --source ${source} --json`
          );

          expect(stderr).toContain(`Fetching ${source} icons...`);

          const icons = JSON.parse(stdout);
          expect(Array.isArray(icons)).toBe(true);
          expect(icons.length).toBeGreaterThan(1000);

          console.log(`✅ CLI ${source} source: ${icons.length} icons`);
        }
      },
      testTimeout * 3
    ); // 3x timeout for multiple API calls

    it(
      "should default to text format when no format specified",
      async () => {
        const { stdout } = await execAsync(`node "${cliPath}" --source web`);

        const lines = stdout.trim().split("\n");
        expect(lines.length).toBeGreaterThan(1000);

        // Should be plain text, not JSON
        expect(() => JSON.parse(stdout)).toThrow();

        console.log(`✅ CLI default format: ${lines.length} icons`);
      },
      testTimeout
    );
  });
});
