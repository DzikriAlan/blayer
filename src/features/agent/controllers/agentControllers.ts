import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAgentStates } from '../states/agentStates'
import {
  getAgent,
  postAgent,
  patchAgent,
  deleteAgent,
  getAgentPublic,
  postAgentGenerate,
} from '../services/agentServices'
import type { PayloadPostAgent, PayloadPatchAgent, DataAgent } from '../types/agentTypes'

export const useAgentControllers = () => {
  const queryClient = useQueryClient()
  const { setAgentList } = useAgentStates()

  const fetchAgent = useQuery({
    queryKey: ['agent'],
    queryFn: async () => {
      setAgentList({ status: 'loading' })
      try {
        const data = await getAgent()
        setAgentList({ status: 'success', statusTitle: 'Success', data: data as DataAgent[] })
        return data
      } catch (error) {
        const err = error instanceof Error ? error.message : 'Failed to fetch'
        setAgentList({ status: 'error', statusTitle: 'Error', statusSubtitle: err })
        throw error
      }
    },
  })

  const storeAgent = useMutation({
    mutationFn: (payload: PayloadPostAgent) => postAgent(payload),
    onMutate: () => {
      setAgentList({ status: 'loading', statusTitle: 'Saving...' })
    },
    onSuccess: () => {
      setAgentList({ status: 'success', statusTitle: 'Saved' })
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    },
    onError: (error) => {
      const err = error instanceof Error ? error.message : 'Failed to create'
      setAgentList({ status: 'error', statusTitle: 'Error', statusSubtitle: err })
    },
  })

  const modifyAgent = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayloadPatchAgent }) =>
      patchAgent(id, payload),
    onMutate: () => {
      setAgentList({ status: 'loading', statusTitle: 'Updating...' })
    },
    onSuccess: () => {
      setAgentList({ status: 'success', statusTitle: 'Updated' })
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    },
    onError: (error) => {
      const err = error instanceof Error ? error.message : 'Failed to update'
      setAgentList({ status: 'error', statusTitle: 'Error', statusSubtitle: err })
    },
  })

  const removeAgent = useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onMutate: () => {
      setAgentList({ status: 'loading', statusTitle: 'Deleting...' })
    },
    onSuccess: () => {
      setAgentList({ status: 'success', statusTitle: 'Deleted' })
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    },
    onError: (error) => {
      const err = error instanceof Error ? error.message : 'Failed to delete'
      setAgentList({ status: 'error', statusTitle: 'Error', statusSubtitle: err })
    },
  })

  const fetchAgentPublic = (id: string) => getAgentPublic(id)

  const storeAgentGenerate = useMutation({
    mutationFn: (prompt: string) => postAgentGenerate(prompt),
  })

  return { fetchAgent, storeAgent, modifyAgent, removeAgent, fetchAgentPublic, storeAgentGenerate }
}
