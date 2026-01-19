import PermissionGridView from './grid-view'
import PermissionListView from './list-view'
import { DetailContent } from '../detail-content/detail-content'
import { Badge } from '@/modules/shadcn/ui/badge'
import { ButtonGroup } from '@/modules/shadcn/ui/button-group'
import { Button } from '@/modules/shadcn/ui/button'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { useEffect } from 'react'
import { useState } from 'react'
import { EmptyContent } from 'tessera-ui/components'
import { useRolePermissions } from '@/resources/hooks/permissions/use-permission'
import { IQueryConfig } from '@/resources/queries'
import { AppPreloader } from '../loader/pre-loader'

interface PermissionsProps {
  config: IQueryConfig
  roleId: string
}

export function PermissionContent({ config, roleId }: PermissionsProps) {
  const viewModeKey = 'permissionViewMode'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [pagination, setPagination] = useState<{ page: number; size: number }>({
    page: 1,
    size: 25,
  })

  const {
    data: permissions,
    isLoading,
    isFetching,
    refetch: refetchPermissions,
    error,
  } = useRolePermissions(config, roleId, pagination)

  const handleSaveViewMode = (viewMode: 'grid' | 'list') => {
    setViewMode(viewMode)
    localStorage.setItem(viewModeKey, viewMode)
  }

  useEffect(() => {
    if (permissions) {
      // Check current view mode
      const savedViewMode = localStorage.getItem(viewModeKey)

      if (savedViewMode) {
        setViewMode(savedViewMode as 'grid' | 'list')
      }
    }
  }, [permissions])

  useEffect(() => {
    refetchPermissions()
  }, [pagination])

  if (isLoading) {
    return <AppPreloader className="min-h-[400px]" />
  }

  if (permissions === undefined || error) {
    return (
      <EmptyContent
        title={permissions?.items.length === 0 ? 'Empty Permissions' : 'Error'}
        description={error?.message || 'Permissions not found'}
        image="/images/empty-permissions.png"
      />
    )
  }

  return (
    <DetailContent
      title="Permissions"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {permissions?.items?.length} total permissions
          </Badge>

          <ButtonGroup>
            <Button
              size="icon"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => handleSaveViewMode('grid')}>
              <LayoutGrid />
            </Button>
            <Button
              size="icon"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => handleSaveViewMode('list')}>
              <LayoutList />
            </Button>
          </ButtonGroup>
        </div>
      }>
      {viewMode === 'grid' && (
        <PermissionGridView
          permissions={permissions}
          onChangePagination={setPagination}
          isLoading={isFetching}
        />
      )}
      {viewMode === 'list' && (
        <PermissionListView
          permissions={permissions}
          onChangePagination={setPagination}
          isLoading={isFetching}
        />
      )}
    </DetailContent>
  )
}
