#!/usr/bin/env node

const esbuild = require('esbuild')
const alias = require('esbuild-plugin-alias')
const nodeGlobals = require('@esbuild-plugins/node-globals-polyfill').default

const prod = process.argv.indexOf('prod') !== -1
const watch = process.argv.indexOf('watch') !== -1

esbuild
  .build({
    bundle: true,
    entryPoints: ['./src/widget.jsx'],
    outdir: './lib',
    format: 'esm',
    plugins: [
      alias({
        stream: require.resolve('readable-stream')
      }),
      nodeGlobals({buffer: true})
    ],
    define: {
      window: 'self',
      global: 'self'
    },
    sourcemap: prod ? false : 'inline',
    watch: watch
      ? {
          onRebuild(err) {
            if (err) console.log('error building', err)
            else console.log('build success. watching...')
          }
        }
      : null
  })
  .then(() =>
    watch ? console.log('watching...') : console.log('build success.')
  )
