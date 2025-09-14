
export default {
    root: './src',
    publicDir: '../static/',
    server: {
        host: true,
        open: true,
    },
    build:
    {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true // Add sourcemap
    },
}