import PermissionGridView from './grid-view'
import PermissionListView from './list-view'
import { PermissionType } from '@/resources/queries/permissions/permission.type'
import { DetailContent } from '../detail-content/detail-content'
import { Badge } from '@/modules/shadcn/ui/badge'
import { ButtonGroup } from '@/modules/shadcn/ui/button-group'
import { Button } from '@/modules/shadcn/ui/button'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { useEffect } from 'react'
import { useState } from 'react'
import { IPaging } from '@/resources/types'
import { EmptyContent } from 'tessera-ui/components'

interface PermissionContentProps {
  permissions: IPaging<PermissionType>
  isLoading?: boolean
}

export function PermissionContent({ permissions }: PermissionContentProps) {
  const viewModeKey = 'permissionViewMode'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSaveViewMode = (viewMode: 'grid' | 'list') => {
    setViewMode(viewMode)
    localStorage.setItem(viewModeKey, viewMode)
  }

  useEffect(() => {
    if (permissions?.items?.length > 0) {
      // Check current view mode
      const savedViewMode = localStorage.getItem(viewModeKey)

      if (savedViewMode) {
        setViewMode(savedViewMode as 'grid' | 'list')
      }
    }
  }, [permissions])

  if (permissions?.items?.length === 0) {
    return (
      <EmptyContent
        image="/images/empty-roles.png"
        title="No permissions found"
        description="This role does not have any permissions."
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
      {viewMode === 'grid' && <PermissionGridView permissions={permissions} />}
      {viewMode === 'list' && <PermissionListView permissions={permissions} />}
    </DetailContent>
  )
}
