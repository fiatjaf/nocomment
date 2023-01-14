#!/usr/bin/env node

const esbuild = require('esbuild')

const prod = process.argv.indexOf('prod') !== -1
const watch = process.argv.indexOf('watch') !== -1

let params = {
  bundle: true,
  entryPoints: ['./src/index.js'],
  external: ['react', 'react-dom'],
  outdir: './lib',
  format: 'esm',
  define: {
    window: 'self',
    global: 'self'
  },
  sourcemap: prod ? false : 'inline'
}

if (watch) {
  esbuild.context(params).then(ctx => ctx.watch())
  console.log('watching...')
} else {
  esbuild.build(params).then(() => console.log('build success.'))
}
