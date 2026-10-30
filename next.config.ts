import type { NextConfig } from "next";

// The routes that run CLIP (src/lib/clip.ts). Next's file tracing misses onnxruntime-node's native
// binary, so ship the Linux x64 one (what Vercel runs) with just these functions.
const onnxFiles = [
  "./node_modules/onnxruntime-node/package.json",
  "./node_modules/onnxruntime-node/dist/**/*",
  "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*",
  "./node_modules/onnxruntime-common/**/*",
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/search": onnxFiles,
    "/api/generations/\\[id\\]/publish": onnxFiles,
  },
};

export default nextConfig;
