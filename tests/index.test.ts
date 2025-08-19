// import fs from 'node:fs'
// import { expect, it } from 'vitest'
import { it } from 'vitest'
import { openapi_codegen } from '../src'

it.skip('code gen', async () => {
  const res = await openapi_codegen({
    doc_url: 'xxxx',
  })
  // fs.writeFileSync('api.ts', res)
  // expect(fs.readFileSync('api.ts', 'utf8')).toBe(res)
  console.log(res)
})
