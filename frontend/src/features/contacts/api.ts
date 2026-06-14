import { authFetch } from '@/lib/api'

import type { Contact, ContactListParams, ContactListResponse } from './types'
import type { ContactFormValues } from './schemas/contact'

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

function toQueryString(params: ContactListParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (!entries.length) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export async function listContacts(params: ContactListParams = {}): Promise<ContactListResponse> {
  const res = await authFetch(`/contacts/${toQueryString(params)}`)
  return parseResponse<ContactListResponse>(res)
}

export async function getContact(id: number): Promise<Contact> {
  const res = await authFetch(`/contacts/${id}/`)
  return parseResponse<Contact>(res)
}

export async function createContact(data: ContactFormValues): Promise<Contact> {
  const res = await authFetch('/contacts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Contact>(res)
}

export async function patchContact(id: number, data: Partial<ContactFormValues>): Promise<Contact> {
  const res = await authFetch(`/contacts/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return parseResponse<Contact>(res)
}

export async function deleteContact(id: number): Promise<void> {
  const res = await authFetch(`/contacts/${id}/`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`API error ${res.status}`), {
      status: res.status,
      body: text ? JSON.parse(text) : null,
    })
  }
}
