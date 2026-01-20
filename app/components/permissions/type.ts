import { IQueryConfig } from '@/resources/queries'
import { PermissionType } from '@/resources/queries/permissions/permission.type'
import { IPaging } from '@/resources/types'

export interface PermissionContentProps {
  config: IQueryConfig
  permissions: IPaging<PermissionType>
  isLoading: boolean
  onChangePagination: ({ page, size }: { page: number; size: number }) => void
}
