export type ActivityType = 'task' | 'call' | 'meeting'
export type ContentTypeLabel = 'lead' | 'contact' | 'company' | 'deal'

export interface UserMinimal {
  id: number
  full_name: string
  email: string
}

export interface Activity {
  id: number
  type: ActivityType
  subject: string
  description: string
  due_at: string | null
  completed_at: string | null
  assigned_to_id: number | null
  assigned_to: UserMinimal | null
  content_type: ContentTypeLabel | null
  object_id: number | null
  is_deleted: boolean
  created_at: string
  updated_at: string
  created_by: UserMinimal | null
}

export interface CreateActivityInput {
  type: ActivityType
  subject: string
  description?: string
  due_at?: string | null
  completed_at?: string | null
  assigned_to_id?: number | null
  content_type?: ContentTypeLabel | null
  object_id?: number | null
}

export type UpdateActivityInput = Partial<CreateActivityInput>

export interface PaginatedActivities {
  count: number
  next: string | null
  previous: string | null
  results: Activity[]
}

export interface ActivitiesQueryParams {
  q?: string
  type?: ActivityType
  assigned_to?: number
  content_type?: ContentTypeLabel
  object_id?: number
  ordering?: string
  page?: number
  page_size?: number
}
