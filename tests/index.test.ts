import fs from 'node:fs'
import { expect, it } from 'vitest'
import { openapi_codegen } from '../src'

it('code gen', async () => {
  const res = await openapi_codegen({
    doc_url: 'xx',
  })
  fs.writeFileSync('api.ts', res)
  expect(fs.readFileSync('api.ts', 'utf8')).toBe(res)
})
