/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Deployment origin; README snippets prefer it so dev builds don't bake localhost dead links.
  readonly VITE_PUBLIC_ORIGIN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
