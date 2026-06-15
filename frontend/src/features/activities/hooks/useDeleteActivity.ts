'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteActivity } from '../api'
import type { Activity } from '../types'

export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activity: Activity) => deleteActivity(activity.id),
    onSuccess: (_: void, activity: Activity) => {
      queryClient.removeQueries({ queryKey: ['activity', activity.id] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (activity.content_type && activity.object_id != null) {
        queryClient.invalidateQueries({
          queryKey: ['activities', { content_type: activity.content_type, object_id: activity.object_id }],
        })
      }
    },
  })
}
