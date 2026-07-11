import { describe, it, expect } from "vitest";
import { parseRepo, parseUser, formatStars } from "../index";

describe("parseRepo", () => {
  it("accepts owner/repo and URLs, normalized", () => {
    expect(parseRepo("anthropics/skills")).toBe("anthropics/skills");
    expect(parseRepo("https://github.com/anthropics/skills")).toBe("anthropics/skills");
    expect(parseRepo("anthropics/skills.git/")).toBe("anthropics/skills");
  });
  it("rejects bare usernames and junk", () => {
    expect(parseRepo("anthropics")).toBeNull();
    expect(parseRepo("/bad")).toBeNull();
  });
});

describe("parseUser", () => {
  it("accepts bare username / @username / profile URL", () => {
    expect(parseUser("Fldicoahkiin")).toBe("Fldicoahkiin");
    expect(parseUser("https://github.com/anthropics")).toBe("anthropics");
    expect(parseUser("@octocat")).toBe("octocat");
  });
  it("rejects owner/repo and invalid usernames", () => {
    expect(parseUser("anthropics/skills")).toBeNull();
    expect(parseUser("-bad")).toBeNull();
    expect(parseUser("a".repeat(40))).toBeNull();
  });
});

describe("formatStars carry", () => {
  it("all tiers and boundaries", () => {
    expect(formatStars(null)).toBe("–");
    expect(formatStars(999)).toBe("999");
    expect(formatStars(1000)).toBe("1k");
    expect(formatStars(1234)).toBe("1.2k");
    expect(formatStars(9999)).toBe("10k");
    expect(formatStars(12345)).toBe("12k");
    expect(formatStars(999999)).toBe("1m");
    expect(formatStars(1200000)).toBe("1.2m");
  });
});
