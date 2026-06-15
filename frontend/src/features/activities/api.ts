import { authFetch } from '@/lib/api'

import type {
  ActivitiesQueryParams,
  Activity,
  CreateActivityInput,
  PaginatedActivities,
  UpdateActivityInput,
} from './types'

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

function toQueryString(params: ActivitiesQueryParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (!entries.length) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export async function fetchActivities(
  params: ActivitiesQueryParams = {},
): Promise<PaginatedActivities> {
  const res = await authFetch(`/activities/${toQueryString(params)}`)
  return parseResponse<PaginatedActivities>(res)
}

export async function fetchActivity(id: number): Promise<Activity> {
  const res = await authFetch(`/activities/${id}/`)
  return parseResponse<Activity>(res)
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const res = await authFetch('/activities/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<Activity>(res)
}

export async function updateActivity(id: number, input: UpdateActivityInput): Promise<Activity> {
  const res = await authFetch(`/activities/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<Activity>(res)
}

export async function deleteActivity(id: number): Promise<void> {
  const res = await authFetch(`/activities/${id}/`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text()
    throw Object.assign(new Error(`API error ${res.status}`), {
      status: res.status,
      body: text ? JSON.parse(text) : null,
    })
  }
}

export async function completeActivity(id: number): Promise<Activity> {
  const res = await authFetch(`/activities/${id}/complete/`, { method: 'POST' })
  return parseResponse<Activity>(res)
}

export async function incompleteActivity(id: number): Promise<Activity> {
  const res = await authFetch(`/activities/${id}/incomplete/`, { method: 'POST' })
  return parseResponse<Activity>(res)
}
