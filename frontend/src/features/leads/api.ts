import { authFetch } from '@/lib/api'

import type { LeadDetail, LeadListParams, LeadListResponse, LeadSource } from './types'
import type { LeadFormValues } from './schemas/lead'

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

function toQueryString(params: LeadListParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (!entries.length) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export async function fetchLeads(params: LeadListParams = {}): Promise<LeadListResponse> {
  const res = await authFetch(`/leads/${toQueryString(params)}`)
  return parseResponse<LeadListResponse>(res)
}

export async function fetchLead(id: number): Promise<LeadDetail> {
  const res = await authFetch(`/leads/${id}/`)
  return parseResponse<LeadDetail>(res)
}

export async function fetchLeadSources(): Promise<LeadSource[]> {
  const res = await authFetch('/lead-sources/')
  return parseResponse<LeadSource[]>(res)
}

export async function createLead(data: LeadFormValues): Promise<LeadDetail> {
  const res = await authFetch('/leads/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<LeadDetail>(res)
}

export async function updateLead(id: number, data: Partial<LeadFormValues>): Promise<LeadDetail> {
  const res = await authFetch(`/leads/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<LeadDetail>(res)
}

export async function deleteLead(id: number): Promise<void> {
  const res = await authFetch(`/leads/${id}/`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`API error ${res.status}`), {
      status: res.status,
      body: text ? JSON.parse(text) : null,
    })
  }
}

export async function convertLead(id: number): Promise<LeadDetail> {
  const res = await authFetch(`/leads/${id}/convert/`, { method: 'POST' })
  return parseResponse<LeadDetail>(res)
}
