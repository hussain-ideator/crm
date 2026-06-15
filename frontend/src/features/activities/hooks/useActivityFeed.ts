'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchActivities } from '../api'
import type { ContentTypeLabel } from '../types'

export function useActivityFeed(contentType: ContentTypeLabel, objectId: number) {
  return useQuery({
    queryKey: ['activities', { content_type: contentType, object_id: objectId }],
    queryFn: () => fetchActivities({ content_type: contentType, object_id: objectId, page_size: 50 }),
    staleTime: 30_000,
    enabled: !!contentType && !!objectId,
  })
}
