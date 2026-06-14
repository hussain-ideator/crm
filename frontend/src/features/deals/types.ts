export interface Pipeline {
  id: number
  name: string
  is_default: boolean
  stages: Stage[]
}

export interface Stage {
  id: number
  name: string
  order_index: number
  probability: number
  is_won: boolean
  is_lost: boolean
}

export interface UserMinimal {
  id: number
  full_name: string
  email: string
}

export interface CompanyMinimal {
  id: number
  name: string
}

export interface ContactMinimal {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface Deal {
  id: number
  name: string
  amount: string | null
  currency: string
  close_date: string | null
  pipeline: Pipeline | null
  pipeline_id: number | null
  stage: Stage | null
  stage_id: number | null
  company: CompanyMinimal | null
  company_id: number | null
  primary_contact: ContactMinimal | null
  primary_contact_id: number | null
  owner: UserMinimal | null
  owner_id: number | null
  probability: number | null
  is_won: boolean
  is_lost: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedDeals {
  count: number
  next: string | null
  previous: string | null
  results: Deal[]
}

export interface DealListParams {
  q?: string
  stage?: number
  pipeline?: number
  owner?: number
  company?: number
  ordering?: string
  page?: number
  page_size?: number
}

export interface CreateDealInput {
  name: string
  amount?: number | null
  currency?: string
  close_date?: string | null
  pipeline_id?: number | null
  stage_id?: number | null
  company_id?: number | null
  primary_contact_id?: number | null
  owner_id?: number | null
  probability?: number | null
}

export type UpdateDealInput = Partial<CreateDealInput>
