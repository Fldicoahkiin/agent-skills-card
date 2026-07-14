import type { Template } from "../types";
import { full } from "./full";
import { list } from "./list";
import { grid } from "./grid";
import { banner } from "./banner";

// Variant registry (the draft's four variants). New variant = import it and add it to this array; the site and API pick it up.
const ALL: Template[] = [full, list, grid, banner];

export const templates: Record<string, Template> = Object.fromEntries(ALL.map((t) => [t.key, t]));

export const templateList = ALL.map((t) => ({ key: t.key }));

export const defaultTemplate = full;

// Final image width per variant (used for the HTML embed width attribute).
export const VARIANT_WIDTH: Record<string, number> = { full: 830, list: 400, grid: 640, banner: 830 };
