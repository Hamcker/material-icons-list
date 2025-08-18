import { IconSource } from "../src/index";

describe("Simple Tests", () => {
  describe("Type validation", () => {
    it("should accept valid icon sources", () => {
      const validSources: IconSource[] = ["web", "android", "ios"];

      validSources.forEach((source) => {
        expect(["web", "android", "ios"]).toContain(source);
      });
    });
  });

  describe("Environment variables", () => {
    it("should handle GITHUB_TOKEN environment variable", () => {
      const originalToken = process.env.GITHUB_TOKEN;

      // Test with token
      process.env.GITHUB_TOKEN = "test-token";
      expect(process.env.GITHUB_TOKEN).toBe("test-token");

      // Test without token
      delete process.env.GITHUB_TOKEN;
      expect(process.env.GITHUB_TOKEN).toBeUndefined();

      // Restore original
      if (originalToken) {
        process.env.GITHUB_TOKEN = originalToken;
      }
    });
  });

  describe("Basic functionality", () => {
    it("should export the list function", async () => {
      const { list } = await import("../src/index");
      expect(typeof list).toBe("function");
    });

    it("should validate source parameter early", async () => {
      const { list } = await import("../src/index");

      // This test will fail fast before making API calls if source validation works
      await expect(list("invalid" as IconSource)).rejects.toThrow(
        "Invalid source: invalid. Must be one of: android, ios, web"
      );
    });
  });
});
