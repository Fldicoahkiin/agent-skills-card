// Pure skill-repo utilities: parsing, install command, star formatting.

// Accepts "owner/repo" or a GitHub URL, normalized to "owner/repo". Invalid input returns null.
export function parseRepo(input: string): string | null {
  let s = input.trim();
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  s = s.replace(/\/+$/, "").replace(/\.git$/i, "");
  const parts = s.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo] = parts;
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
  return `${owner}/${repo}`;
}

export function repoName(full: string): string {
  return full.split("/")[1] ?? full;
}

export function repoOwner(full: string): string {
  return full.split("/")[0] ?? "";
}

// Accepts a bare username, @username, or a GitHub profile URL, normalized to the username. owner/repo or invalid returns null.
// GitHub usernames: alphanumeric + single hyphens, no leading/trailing hyphen, ≤39 chars.
export function parseUser(input: string): string | null {
  let s = input.trim();
  s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/+$/, "");
  if (s.includes("/")) return null; // owner/repo, not a bare username
  if (s.startsWith("@")) s = s.slice(1);
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(s) ? s : null;
}

// Install-template substitution, {repo} -> owner/repo. Defaults to npx skills add; swappable for install.sh etc.
export function buildInstall(template: string, repo: string): string {
  return template.replaceAll("{repo}", repo);
}

// 1234 -> "1.2k",1200000 -> "1.2m"。null -> "–"。
// Carry boundaries: 999_950+ rolls to m (avoids 999999 -> "1000k"); k values that round to 10 drop the decimal.
export function formatStars(n: number | null): string {
  if (n == null) return "–";
  if (n < 1000) return String(n);
  if (n < 999_950) {
    const k = n / 1000;
    return (k < 9.95 ? k.toFixed(1) : k.toFixed(0)).replace(/\.0$/, "") + "k";
  }
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
}
