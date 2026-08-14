import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const view = name => fs.readFileSync(path.resolve(process.cwd(), `src/views/${name}`), 'utf8')

const assertDpOwnedView = (source, endpoint) => {
  expect(source).toMatch(/from\s+["']\.\.\/api\/clients["']/)
  expect(source).toContain(':apiClient="dpApi"')
  expect(source).toContain('rowKey="id"')
  expect(source).toContain(`endpoint="${endpoint}"`)
  expect(source).toMatch(/sbmApi\.get\(["']franchises\/["']\)/)
  expect(source).not.toContain("from '../api/axios'")
}

describe('canonical API ownership views', () => {
  it('routes Service business reads to DP-API and Franchise context to SBM-API', () => {
    const source = view('ServiceView.vue')
    assertDpOwnedView(source, 'services/')
    expect(source).toContain("{ key: 'group'")
    expect(source).not.toContain("{ key: 'item_group'")
  })

  it('routes Catalog business reads to the canonical DP-API collection', () => {
    const source = view('CatalogsView.vue')
    assertDpOwnedView(source, 'catalogs/')
    expect(source).not.toContain('catalogs/list/')
    expect(source).toContain("{ key: 'group'")
  })

  it('routes Provider business reads to DP-API and uses the DP bank projection', () => {
    const source = view('ProviderView.vue')
    assertDpOwnedView(source, 'providers/')
    expect(source).toContain("{ key: 'bank_name'")
    expect(source).not.toContain("{ key: 'company_bank_name'")
  })
})
