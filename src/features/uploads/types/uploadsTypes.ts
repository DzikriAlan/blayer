export interface PayloadPostUploadsBanner {
  fileName: string
  contentType: string
  fileBase64: string
}

export interface DataUploadsBanner {
  url: string
  path: string
}

export interface UploadsBanner {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataUploadsBanner | null
}
