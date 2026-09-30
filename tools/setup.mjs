import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
execFileSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: `${root}/youtube`, stdio: "inherit" });
execFileSync("npx", ["--yes", "pnpm@9.1.1", "--dir", "music", "install", "--frozen-lockfile", "--ignore-scripts"], { cwd: root, stdio: "inherit" });
