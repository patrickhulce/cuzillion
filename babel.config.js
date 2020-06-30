module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {esmodules: true}, useBuiltIns: 'usage', corejs: 2}],
    '@babel/preset-typescript',
  ],
  plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'h'}]],
}
