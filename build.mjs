import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/main.jsx'], bundle: true, outdir: 'dist', entryNames:'app', minify: true, jsx: 'automatic', target: ['es2022'], define: { 'process.env.NODE_ENV': '"production"' }, loader:{'.woff2':'file'} });
await copyFile('index.html', 'dist/index.html');
await mkdir('dist/docs', {recursive:true});
await copyFile('docs/PRODUCT_SPEC.md', 'dist/docs/PRODUCT_SPEC.md');
await copyFile('THIRD_PARTY_NOTICES.md', 'dist/THIRD_PARTY_NOTICES.md');
