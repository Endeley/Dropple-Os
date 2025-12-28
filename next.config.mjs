import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly pin the project root so Turbopack ignores other lockfiles.
  turbopack: {
    root: __dirname,
  },
  reactCompiler: true,
};

export default nextConfig;
