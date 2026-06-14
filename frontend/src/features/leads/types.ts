export interface LeadSource {
  id: number
  name: string
}

export interface LeadOwner {
  id: number
  full_name: string
}

export interface LeadDealRef {
  id: number
  name: string
}

export interface Lead {
  id: number
  salutation: string
  first_name: string
  last_name: string
  title: string
  email: string
  phone: string
  mobile: string
  company_name: string
  website: string
  industry: string
  no_of_employees: number | null
  source: LeadSource | null
  source_id: number | null
  status: string
  owner: LeadOwner | null
  owner_id: number | null
  converted_at: string | null
  created_at: string
  updated_at: string
  created_by: number | null
}

export interface LeadDetail extends Lead {
  converted_deal_fk: LeadDealRef | null
}

export interface LeadListItem {
  id: number
  salutation: string
  first_name: string
  last_name: string
  email: string
  phone: string
  company_name: string
  status: string
  source: LeadSource | null
  owner: LeadOwner | null
  created_at: string
}

export interface LeadListResponse {
  count: number
  next: string | null
  previous: string | null
  results: LeadDetail[]
}

export interface LeadListParams {
  q?: string
  status?: string
  source?: number
  owner?: number
  ordering?: string
  page?: number
  page_size?: number
}
