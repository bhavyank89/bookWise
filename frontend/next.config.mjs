/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/:path*',
                destination: '/', // send everything to index.html
            },
        ];
    },
};

export default nextConfig;
