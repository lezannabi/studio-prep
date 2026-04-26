import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const sourceExePath = join(projectRoot, "src-tauri", "target", "release", "studio-prep.exe");
const targetExePath = join(projectRoot, "studio-prep", "Studio Prep.exe");

if (!existsSync(sourceExePath)) {
  console.log(`[copy-tauri-exe] skipped: source exe not found at ${sourceExePath}`);
  process.exit(0);
}

mkdirSync(dirname(targetExePath), { recursive: true });
copyFileSync(sourceExePath, targetExePath);

console.log(`[copy-tauri-exe] copied to ${targetExePath}`);
