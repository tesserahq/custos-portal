import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@/modules/shadcn/ui/button'
import { ButtonGroup } from '@/modules/shadcn/ui/button-group'
import { useRolePermissions } from '@/resources/hooks/permissions/use-permission'
import { IQueryConfig } from '@/resources/queries'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmptyContent, NewButton } from 'tessera-ui/components'
import { DetailContent } from '../detail-content/detail-content'
import { AppPreloader } from '../loader/pre-loader'
import PermissionGridView from './grid-view'
import PermissionListView from './list-view'
import { NewPermissionDialog } from './new-permission-dialog'

interface PermissionsProps {
  config: IQueryConfig
  roleId: string
}

export function PermissionContent({ config, roleId }: PermissionsProps) {
  const viewModeKey = 'permissionViewMode'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openDialog, setOpenDialog] = useState<boolean>(false)

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
        title="Failed to get roles"
        description={error?.message}
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

          <NewButton label="New Permission" onClick={() => setOpenDialog(true)} />

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
      {permissions.items.length === 0 ? (
        <EmptyContent
          title="No Permissions Found"
          description="Get started by creating your first permission."
          image="/images/empty-permissions.png">
          <Button onClick={() => setOpenDialog(true)} variant="black">
            Start Creating
          </Button>
        </EmptyContent>
      ) : (
        <>
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
        </>
      )}

      <NewPermissionDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        roleId={roleId}
        apiUrl={config.apiUrl}
        nodeEnv={config.nodeEnv}
      />
    </DetailContent>
  )
}
