import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'index.js',
  output: {
    file: 'contrastchecker.js',
    format: 'iife',
    name: 'ContrastChecker'
  },
  input: 'slider.js',
  output: {
    file: 'sliderdeploy.js',
    format: 'iife',
    name: 'Slider'
  },
  plugins: [
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: ['./index.js', './slider.js', 'node_modules/**'], // Default: undefined

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal: false, // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false // Default: true
    }),

    nodeResolve({
      jsnext: true,
      main: false
    }),
    postcss({
      extensions: ['.css'],
    })
  ]
};