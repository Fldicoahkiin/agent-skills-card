// Copy to clipboard: Clipboard API first, falling back to execCommand when permission-denied (still works inside a user gesture).
// Returns success; callers show the copied feedback only on success — no fake feedback.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through to the fallback
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    // Deprecated, but still the only synchronous fallback in permission-restricted contexts; browsers keep it around.
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
