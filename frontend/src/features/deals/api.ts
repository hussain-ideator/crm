import { authFetch } from '@/lib/api'

import type { Deal, DealListParams, PaginatedDeals, Pipeline, CreateDealInput, UpdateDealInput } from './types'

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

function toQueryString(params: DealListParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (!entries.length) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export async function fetchDeals(params: DealListParams = {}): Promise<PaginatedDeals> {
  const res = await authFetch(`/deals/${toQueryString(params)}`)
  return parseResponse<PaginatedDeals>(res)
}

export async function fetchDeal(id: number): Promise<Deal> {
  const res = await authFetch(`/deals/${id}/`)
  return parseResponse<Deal>(res)
}

export async function fetchPipelines(): Promise<Pipeline[]> {
  const res = await authFetch('/pipelines/')
  return parseResponse<Pipeline[]>(res)
}

export async function createDeal(data: CreateDealInput): Promise<Deal> {
  const res = await authFetch('/deals/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Deal>(res)
}

export async function updateDeal(id: number, data: UpdateDealInput): Promise<Deal> {
  const res = await authFetch(`/deals/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Deal>(res)
}

export async function deleteDeal(id: number): Promise<void> {
  const res = await authFetch(`/deals/${id}/`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`API error ${res.status}`), {
      status: res.status,
      body: text ? JSON.parse(text) : null,
    })
  }
}
