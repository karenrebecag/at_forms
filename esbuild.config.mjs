import * as esbuild from 'esbuild';

// Un solo entry: bundle de TS + Zod + CSS hacia dist/. jsDelivr sirve el tag versionado.
const shared = {
  bundle: true,
  format: 'esm',
  target: ['es2019'],
  logLevel: 'info',
};

const jsOptions = {
  ...shared,
  entryPoints: ['src/index.ts'],
  outfile: 'dist/forms.js',
  minify: true,
  sourcemap: true,
};

const cssOptions = {
  ...shared,
  entryPoints: ['src/styles/forms.css'],
  outfile: 'dist/forms.css',
  minify: true,
};

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');

if (watch || serve) {
  const jsCtx = await esbuild.context(jsOptions);
  const cssCtx = await esbuild.context(cssOptions);
  await Promise.all([jsCtx.watch(), cssCtx.watch()]);
  if (serve) {
    // Dev server sobre dist/ para probar el bundle igual que en producción.
    const { host, port } = await jsCtx.serve({ servedir: '.', port: 8765 });
    console.log(`dev server: http://${host}:${port}`);
  } else {
    console.log('watching src/...');
  }
} else {
  await Promise.all([esbuild.build(jsOptions), esbuild.build(cssOptions)]);
}
