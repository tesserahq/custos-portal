import { useDeletePermission } from '@/resources/hooks/permissions/use-permission'
import { PermissionType } from '@/resources/queries/permissions/permission.type'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Search, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'
import { Pagination } from '../data-table/data-pagination'
import { AppPreloader } from '../loader/pre-loader'
import { PermissionContentProps } from './type'

export default function PermissionGridView({
  config,
  permissions,
  isLoading,
  onChangePagination,
}: PermissionContentProps) {
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const { mutateAsync: deletePermission, isPending: isDeletingPermission } = useDeletePermission(
    config,
    { showToast: false }
  )

  // Group permissions by object
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionType[]> = {}

    permissions?.items?.forEach((permission) => {
      if (!groups[permission.object]) {
        groups[permission.object] = []
      }
      groups[permission.object].push(permission)
    })

    // Sort actions within each group
    Object.keys(groups).forEach((key) => {
      groups[key].sort((left, right) => left.action.localeCompare(right.action))
    })

    return groups
  }, [permissions?.items])

  const filteredPermissions = useMemo(() => {
    const filtered: Record<string, PermissionType[]> = {}

    Object.entries(groupedPermissions).forEach(([object, actions]) => {
      // Check if object name matches or any action matches
      filtered[object] = actions
    })

    return filtered
  }, [groupedPermissions])

  const handleDeletePermissionsGroup = (object: string) => {
    const permissionsToDelete = groupedPermissions[object] || []
    if (permissionsToDelete.length === 0) return

    const actions = permissionsToDelete.map((permission) => permission.action).join(', ')

    deleteConfirmationRef.current?.open({
      title: 'Remove Permission',
      description: `Are you sure you want to remove "${object}" from this role? This will remove actions: (${actions})`,
      onDelete: async () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        try {
          await Promise.all(
            permissionsToDelete.map((permission) => deletePermission(permission.id))
          )
          toast.success('Permission removed successfully')
          deleteConfirmationRef.current?.close()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          toast.error('Failed to remove permission', { description: message })
          deleteConfirmationRef.current?.updateConfig({ isLoading: false })
        }
      },
      isLoading: isDeletingPermission,
    })
  }

  if (isLoading) {
    return <AppPreloader className="h-[400px]" />
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(filteredPermissions).length > 0 &&
          Object.entries(filteredPermissions).map(([object, actions]) => (
            <Card key={object} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 px-4 pt-4 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold font-mono">{object}</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  aria-label={`Remove ${object} permission`}
                  onClick={() => handleDeletePermissionsGroup(object)}>
                  <Trash2 size={16} />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {actions.map((permission) => (
                    <Badge
                      key={permission.id}
                      variant="secondary"
                      className="text-xs font-medium py-0.5 px-2">
                      {permission.action}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {Object.entries(filteredPermissions).length > 0 && (
        <Pagination
          meta={{
            page: permissions.page,
            size: permissions.size,
            total: permissions.total,
            pages: permissions.pages,
          }}
          callback={onChangePagination}
        />
      )}
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
