import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Emit a minimal standalone server bundle for a lean Docker image.
  output: "standalone",
  // Root tracing at this app so `server.js` lands at .next/standalone/server.js
  // (avoids nesting when a lockfile exists higher up the tree).
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
