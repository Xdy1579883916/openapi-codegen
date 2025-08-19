import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  pnpm: false,
  rules: {
    'no-console': ['off'],
    'eslint-comments/no-unlimited-disable': ['off'],
  },
})
