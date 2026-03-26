import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchMonitors,
  saveMonitorFromTest,
  testMonitorRequest,
} from "@/api/monitors"

export const monitorsQueryKey = ["monitors"] as const

export function useMonitorsQuery() {
  return useQuery({
    queryKey: monitorsQueryKey,
    queryFn: fetchMonitors,
  })
}

export function useTestMonitorMutation() {
  return useMutation({ mutationFn: testMonitorRequest })
}

export function useSaveMonitorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveMonitorFromTest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: monitorsQueryKey })
    },
  })
}
