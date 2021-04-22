export default {
  input: 'lib/index.js',
  output: {
    file: 'lib/index.umd.js',
    format: 'umd',
    name: 'DataClass',
    globals: {
      types: 'types',
    }
  },
  external: [
    'types',
  ],
}