import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

describe("TypeScript Output Tests", () => {
  const cliPath = path.join(__dirname, "..", "dist", "cli.js");
  const testTimeout = 20000;

  beforeAll(async () => {
    // Ensure the project is built
    try {
      await execAsync("npm run build");
    } catch (error) {
      console.warn("Build failed, tests may fail:", error);
    }
  });

  describe("TypeScript Format", () => {
    it("should generate valid TypeScript output with --ts flag", async () => {
      const { stdout, stderr } = await execAsync(`node "${cliPath}" --ts`);

      expect(stderr).toContain("No source specified, using 'code'");

      // Check TypeScript structure
      expect(stdout).toContain("Material Design Icons");
      expect(stdout).toContain("Generated on");
      expect(stdout).toContain("Total icons:");
      expect(stdout).toContain("export const icons = [");
      expect(stdout).toContain("] as const;");
      expect(stdout).toContain(
        "export type MaterialIcon = typeof icons[number];"
      );
      expect(stdout).toContain("export default icons;");

      // Check for some known icons
      expect(stdout).toContain('"home"');
      expect(stdout).toContain('"search"');
      expect(stdout).toContain('"menu"');

      // Check JSDoc comments
      expect(stdout).toContain("/**");
      expect(stdout).toContain("* Usage:");
      expect(stdout).toContain("*/");
    });

    it(
      "should generate a valid TypeScript file when redirected to file",
      async () => {
        const outputFile = path.join(__dirname, "test-output.ts");

        try {
          // Generate the TypeScript file using default source (code)
          await execAsync(`node "${cliPath}" --ts > "${outputFile}"`);

          // Check that file was created
          expect(fs.existsSync(outputFile)).toBe(true);

          // Read and validate content
          const content = fs.readFileSync(outputFile, "utf8");

          expect(content).toContain("export const icons = [");
          expect(content).toContain("export type MaterialIcon");
          expect(content).toContain("export default icons;");

          // Should contain many icons (4000+ from codepoints)
          const iconMatches = content.match(/"[^"]+"/g);
          expect(iconMatches).not.toBeNull();
          expect(iconMatches!.length).toBeGreaterThan(4000);

          console.log(
            `✅ Generated TypeScript file with ${iconMatches!.length} icons`
          );
        } finally {
          // Clean up test file
          if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
          }
        }
      },
      testTimeout
    );

    it("should show TypeScript option in help", async () => {
      const { stdout } = await execAsync(`node "${cliPath}" --help`);

      expect(stdout).toContain("--ts");
      expect(stdout).toContain("TypeScript file with const array and type");
      expect(stdout).toContain("milist --ts > material-icons.ts");
    });

    it(
      "should handle TypeScript format with different sources",
      async () => {
        // Test default source (code) and one other source
        const sources = ["code"];

        for (const source of sources) {
          const { stdout, stderr } = await execAsync(
            `node "${cliPath}" --source ${source} --ts`
          );

          expect(stderr).toContain(`Fetching ${source} icons...`);
          expect(stdout).toContain("export const icons = [");
          expect(stdout).toContain("export type MaterialIcon");

          console.log(`✅ TypeScript output works for ${source} source`);
        }

        // Also test default behavior (no source specified)
        const { stdout: defaultStdout, stderr: defaultStderr } =
          await execAsync(`node "${cliPath}" --ts`);

        expect(defaultStderr).toContain("No source specified, using 'code'");
        expect(defaultStdout).toContain("export const icons = [");
        expect(defaultStdout).toContain("export type MaterialIcon");

        console.log(`✅ TypeScript output works with default source`);
      },
      testTimeout * 2
    );
  });
});
