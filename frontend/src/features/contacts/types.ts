export interface ContactCompany {
  id: number
  name: string
}

export interface ContactOwner {
  id: number
  full_name: string
}

export interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  company: ContactCompany | null
  company_id: number | null
  owner: ContactOwner | null
  owner_id: number | null
  created_at: string
  updated_at: string
  created_by: number | null
}

export interface ContactListItem {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  company: ContactCompany | null
  owner: ContactOwner | null
}

export interface ContactListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Contact[]
}

export interface ContactListParams {
  q?: string
  company?: number
  owner?: number
  ordering?: string
  page?: number
  page_size?: number
}
