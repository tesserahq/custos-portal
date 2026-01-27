import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@/modules/shadcn/ui/button'
import { ButtonGroup } from '@/modules/shadcn/ui/button-group'
import { useRolePermissions } from '@/resources/hooks/permissions/use-permission'
import { IQueryConfig } from '@/resources/queries'
import { LayoutGrid, LayoutList, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmptyContent, NewButton } from 'tessera-ui/components'
import { DetailContent } from '../detail-content/detail-content'
import { AppPreloader } from '../loader/pre-loader'
import PermissionGridView from './grid-view'
import PermissionListView from './list-view'
import { NewPermissionDialog } from './new-permission-dialog'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

interface PermissionsProps {
  config: IQueryConfig
  roleId: string
}

export function PermissionContent({ config, roleId }: PermissionsProps) {
  const viewModeKey = 'permissionViewMode'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 500, { minLength: 3 })

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
  } = useRolePermissions(config, roleId, {
    page: pagination.page,
    size: pagination.size,
    q: debouncedSearchQuery,
  })

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
  }, [pagination, debouncedSearchQuery])

  useEffect(() => {
    if (debouncedSearchQuery || debouncedSearchQuery === '') {
      setPagination({ page: 1, size: 25 })
    }
  }, [debouncedSearchQuery])

  if (isLoading && debouncedSearchQuery === '') {
    return <AppPreloader className="min-h-[400px]" />
  }

  if ((!isFetching && permissions === undefined) || error) {
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

          <NewButton
            label="New Permission"
            onClick={() => setOpenDialog(true)}
            disabled={isLoading}
          />

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
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search permissions by resource or action..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-search pl-9!"
          autoFocus
        />
      </div>

      {permissions?.items.length === 0 && debouncedSearchQuery ? (
        <EmptyContent
          title="No Permissions Found"
          description={`No permissions found matching "${debouncedSearchQuery}"`}
          image="/images/empty-search.png"
        />
      ) : permissions?.items.length === 0 ? (
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
              config={config}
              permissions={permissions!}
              onChangePagination={setPagination}
              isLoading={isFetching}
            />
          )}
          {viewMode === 'list' && (
            <PermissionListView
              config={config}
              permissions={permissions!}
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
