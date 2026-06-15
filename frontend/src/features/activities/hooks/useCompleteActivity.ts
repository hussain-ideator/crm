'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { completeActivity, incompleteActivity } from '../api'
import type { Activity } from '../types'

function invalidateActivityQueries(queryClient: ReturnType<typeof useQueryClient>, activity: Activity) {
  queryClient.invalidateQueries({ queryKey: ['activity', activity.id] })
  queryClient.invalidateQueries({ queryKey: ['activities'] })
  if (activity.content_type && activity.object_id != null) {
    queryClient.invalidateQueries({
      queryKey: ['activities', { content_type: activity.content_type, object_id: activity.object_id }],
    })
  }
}

export function useCompleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => completeActivity(id),
    onSuccess: (activity: Activity) => {
      invalidateActivityQueries(queryClient, activity)
    },
  })
}

export function useIncompleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => incompleteActivity(id),
    onSuccess: (activity: Activity) => {
      invalidateActivityQueries(queryClient, activity)
    },
  })
}
