import type { NextConfig } from "next";
import path from "path";

// `output: standalone` produces the lean self-hosted bundle the Docker image
// runs (.next/standalone/server.js). On Vercel it clashes with Vercel's own
// output collection (ENOENT .next/package.json), so enable it only off-Vercel.
const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = isVercel
  ? {}
  : {
      output: "standalone",
      // Root tracing at this app so `server.js` lands at .next/standalone/server.js
      // (avoids nesting when a lockfile exists higher up the tree).
      outputFileTracingRoot: path.resolve(process.cwd()),
    };

export default nextConfig;
