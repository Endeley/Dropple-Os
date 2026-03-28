import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = process.env.NEXT_DIST_DIR || '.next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir,
  // Explicitly pin the project root so Turbopack ignores other lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
