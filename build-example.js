#!/usr/bin/env node

const esbuild = require('esbuild')
const alias = require('esbuild-plugin-alias')
const nodeGlobals = require('@esbuild-plugins/node-globals-polyfill').default

esbuild.build({
  bundle: true,
  entryPoints: ['./example/main.jsx'],
  outfile: './example/main.build.js',
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
  sourcemap: 'inline'
})
