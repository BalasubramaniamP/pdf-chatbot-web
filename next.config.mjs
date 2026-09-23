/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["chromadb", "pdfjs-dist", "@pinecone-database/pinecone"],
  },
};

export default nextConfig;
