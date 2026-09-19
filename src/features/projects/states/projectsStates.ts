import { create } from 'zustand'

import type {
  DataProjects,
  DataProjectsCreatedKey,
  DataProjectsDetail,
  PayloadGetProjectsDetail,
  Projects,
  ProjectsDetail,
} from '../types/projectsTypes'

interface ProjectsStore {
  payloadGetProjectsDetail: PayloadGetProjectsDetail
  projects: Projects
  projectsDetail: ProjectsDetail
  createdKey: DataProjectsCreatedKey | null
  setGetProjectsDetail: (payload: Partial<PayloadGetProjectsDetail>) => void
  setProjects: (projects: Partial<Projects>) => void
  setProjectsDetail: (projectsDetail: Partial<ProjectsDetail>) => void
  setCreatedKey: (createdKey: DataProjectsCreatedKey | null) => void
}

export const useProjectsStates = create<ProjectsStore>((set) => ({
  payloadGetProjectsDetail: { id: '' },

  projects: {
    status: 'loading',
    statusTitle: 'Gagal memuat project',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: [] as DataProjects[],
  },

  projectsDetail: {
    status: 'loading',
    statusTitle: 'Gagal memuat project',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: null as DataProjectsDetail | null,
  },

  createdKey: null,

  setGetProjectsDetail: (payload) =>
    set((state) => ({
      payloadGetProjectsDetail: { ...state.payloadGetProjectsDetail, ...payload },
    })),

  setProjects: (projects) =>
    set((state) => ({ projects: { ...state.projects, ...projects } })),

  setProjectsDetail: (projectsDetail) =>
    set((state) => ({
      projectsDetail: { ...state.projectsDetail, ...projectsDetail },
    })),

  setCreatedKey: (createdKey) => set({ createdKey }),
}))
