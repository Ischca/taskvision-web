/**
 * Fix vinext deploy config for Cloudflare Workers.
 *
 * vinext v0.0.5 has a bug where the Cloudflare Vite plugin does not generate
 * a wrangler.json for the server (RSC) environment. It only generates one for
 * the client environment (assets-only, no `main` field), causing wrangler to
 * deploy an empty 0.31 KiB Worker that returns 404 for all routes.
 *
 * This script patches dist/client/wrangler.json after `vinext build` to add
 * the `main` field pointing to the RSC worker bundle, which in turn dynamically
 * imports the SSR bundle via `await import("./ssr/index.js")`.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const serverEntry = join(root, "dist", "server", "index.js");
const clientWrangler = join(root, "dist", "client", "wrangler.json");

// Verify build output exists
if (!existsSync(serverEntry)) {
  console.error("ERROR: dist/server/index.js not found. Run `vinext build` first.");
  process.exit(1);
}

if (!existsSync(clientWrangler)) {
  console.error("ERROR: dist/client/wrangler.json not found. Run `vinext build` first.");
  process.exit(1);
}

// Copy server files into dist/client so wrangler can bundle them together
// The RSC worker (dist/server/index.js) does `await import("./ssr/index.js")`
// so we need the server directory structure accessible from the deploy root.
const serverDir = join(root, "dist", "server");
const targetDir = join(root, "dist", "client", "_worker");

// Copy server files to _worker/ inside client dir
mkdirSync(join(targetDir, "ssr", "assets"), { recursive: true });
mkdirSync(join(targetDir, "assets"), { recursive: true });

// Copy RSC entry + manifest
copyFileSync(
  join(serverDir, "index.js"),
  join(targetDir, "index.js")
);
copyFileSync(
  join(serverDir, "__vite_rsc_assets_manifest.js"),
  join(targetDir, "__vite_rsc_assets_manifest.js")
);

// Copy server assets
const serverAssets = join(serverDir, "assets");
if (existsSync(serverAssets)) {
  const { readdirSync } = await import("fs");
  for (const f of readdirSync(serverAssets)) {
    copyFileSync(join(serverAssets, f), join(targetDir, "assets", f));
  }
}

// Copy SSR entry + manifest + assets
const ssrDir = join(serverDir, "ssr");
copyFileSync(
  join(ssrDir, "index.js"),
  join(targetDir, "ssr", "index.js")
);
copyFileSync(
  join(ssrDir, "__vite_rsc_assets_manifest.js"),
  join(targetDir, "ssr", "__vite_rsc_assets_manifest.js")
);
const ssrAssets = join(ssrDir, "assets");
if (existsSync(ssrAssets)) {
  const { readdirSync } = await import("fs");
  for (const f of readdirSync(ssrAssets)) {
    copyFileSync(join(ssrAssets, f), join(targetDir, "ssr", "assets", f));
  }
}

// Patch dist/client/wrangler.json to point to the worker entry
const config = JSON.parse(readFileSync(clientWrangler, "utf-8"));
config.main = "_worker/index.js";
// Ensure nodejs_compat flag is set (required for node:async_hooks etc.)
if (!config.compatibility_flags) config.compatibility_flags = [];
if (!config.compatibility_flags.includes("nodejs_compat")) {
  config.compatibility_flags.push("nodejs_compat");
}
// Keep assets.directory as "." (dist/client/)
writeFileSync(clientWrangler, JSON.stringify(config, null, 2));

console.log("Deploy config patched successfully:");
console.log("  main: _worker/index.js");
console.log("  assets.directory: . (dist/client/)");
