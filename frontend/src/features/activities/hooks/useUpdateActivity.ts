'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateActivity } from '../api'
import type { Activity, UpdateActivityInput } from '../types'

export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateActivityInput }) =>
      updateActivity(id, input),
    onSuccess: (activity: Activity) => {
      queryClient.invalidateQueries({ queryKey: ['activity', activity.id] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (activity.content_type && activity.object_id != null) {
        queryClient.invalidateQueries({
          queryKey: ['activities', { content_type: activity.content_type, object_id: activity.object_id }],
        })
      }
    },
  })
}
