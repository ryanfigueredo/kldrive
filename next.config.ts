/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config: {
    module: { rules: { test: RegExp; issuer: RegExp; use: string[] }[] };
  }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kl-drive-odometros.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
