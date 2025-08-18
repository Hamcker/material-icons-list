import { list } from "../src/index";

describe("Functional Tests", () => {
  // These tests run against the real API if a token is available
  const hasToken = !!process.env.GITHUB_TOKEN;
  const testTimeout = 15000;

  beforeAll(() => {
    if (!hasToken) {
      console.log("⚠️  No GITHUB_TOKEN found. Skipping functional tests.");
      console.log(
        "   Set GITHUB_TOKEN environment variable to run functional tests."
      );
    }
  });

  (hasToken ? describe : describe.skip)("Real API Tests", () => {
    it(
      "should successfully fetch web icons",
      async () => {
        const icons = await list("web");

        expect(Array.isArray(icons)).toBe(true);
        expect(icons.length).toBeGreaterThan(1000);

        // Check for some known icons
        expect(icons).toContain("home");
        expect(icons).toContain("search");
        expect(icons).toContain("menu");

        // Verify sorting
        const sortedIcons = [...icons].sort();
        expect(icons).toEqual(sortedIcons);

        console.log(`✅ Successfully fetched ${icons.length} web icons`);
      },
      testTimeout
    );

    it(
      "should successfully fetch android icons",
      async () => {
        const icons = await list("android");

        expect(Array.isArray(icons)).toBe(true);
        expect(icons.length).toBeGreaterThan(1000);

        console.log(`✅ Successfully fetched ${icons.length} android icons`);
      },
      testTimeout
    );

    it(
      "should successfully fetch ios icons",
      async () => {
        const icons = await list("ios");

        expect(Array.isArray(icons)).toBe(true);
        expect(icons.length).toBeGreaterThan(1000);

        console.log(`✅ Successfully fetched ${icons.length} ios icons`);
      },
      testTimeout
    );

    it(
      "should return consistent results across platforms",
      async () => {
        const [webIcons, androidIcons, iosIcons] = await Promise.all([
          list("web"),
          list("android"),
          list("ios"),
        ]);

        // All platforms should have the same icons (Material Design is consistent)
        expect(webIcons.length).toBe(androidIcons.length);
        expect(androidIcons.length).toBe(iosIcons.length);
        expect(webIcons).toEqual(androidIcons);
        expect(androidIcons).toEqual(iosIcons);

        console.log(
          `✅ All platforms consistently return ${webIcons.length} icons`
        );
      },
      testTimeout * 2
    );
  });

  describe("Error Handling", () => {
    it("should handle invalid source gracefully", async () => {
      await expect(list("invalid" as any)).rejects.toThrow(
        "Invalid source: invalid. Must be one of: android, ios, web"
      );
    });

    (hasToken ? it.skip : it)(
      "should provide helpful error message for rate limits",
      async () => {
        // This test only runs when no token is available
        try {
          await list("web");
          // If this succeeds without a token, that's fine too
          console.log("✅ API call succeeded without token");
        } catch (error) {
          if (error instanceof Error && error.message.includes("rate limit")) {
            expect(error.message).toContain("rate limit");
            console.log("✅ Rate limit error handled correctly");
          } else {
            throw error; // Re-throw unexpected errors
          }
        }
      },
      testTimeout
    );
  });
});
