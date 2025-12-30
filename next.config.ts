import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Obsidianプラグインディレクトリをビルドから除外
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/birgerik-obsidian/**'],
    }
    return config
  },
  // TypeScriptの型チェックでObsidianプラグインを除外
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
