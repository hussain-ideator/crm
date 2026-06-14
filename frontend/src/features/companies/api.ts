import { authFetch } from '@/lib/api'

import type { Company, CompanyListParams, CompanyListResponse } from './types'

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const data: unknown = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw Object.assign(new Error(`API error ${response.status}`), {
      status: response.status,
      body: data,
    })
  }
  return data as T
}

function toQueryString(params: CompanyListParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (!entries.length) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export async function listCompanies(params: CompanyListParams = {}): Promise<CompanyListResponse> {
  const res = await authFetch(`/companies/${toQueryString(params)}`)
  return parseResponse<CompanyListResponse>(res)
}

export async function getCompany(id: number): Promise<Company> {
  const res = await authFetch(`/companies/${id}/`)
  return parseResponse<Company>(res)
}

export async function createCompany(data: Partial<Company>): Promise<Company> {
  const res = await authFetch('/companies/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Company>(res)
}

export async function updateCompany(id: number, data: Partial<Company>): Promise<Company> {
  const res = await authFetch(`/companies/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Company>(res)
}

export async function patchCompany(id: number, data: Partial<Company>): Promise<Company> {
  const res = await authFetch(`/companies/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Company>(res)
}

export async function deleteCompany(id: number): Promise<void> {
  const res = await authFetch(`/companies/${id}/`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`API error ${res.status}`), {
      status: res.status,
      body: text ? JSON.parse(text) : null,
    })
  }
}
