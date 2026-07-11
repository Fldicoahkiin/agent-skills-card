import { describe, it, expect } from "vitest";
import { translate } from "./i18n";

describe("translate", () => {
  it("looks up by language", () => {
    expect(translate("en", "addBtn")).toBe("Add");
    expect(translate("zh", "addBtn")).toBe("添加");
  });

  it("interpolates {var} placeholders", () => {
    expect(translate("zh", "reposN", { n: 3 })).toBe("3 个仓库");
    expect(translate("en", "toastCopied", { label: "a/b" })).toBe("Copied · a/b");
  });
});
