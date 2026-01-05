import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@/modules/shadcn/ui/button'
import {
  useCreateRolePermission,
  useDeletePermission,
  useRolePermissions,
} from '@/resources/hooks/permissions/use-permission'
import { IQueryConfig } from '@/resources/queries'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PermissionCard } from './card'

interface PermissionSectionsProps {
  roleId: string
  config: IQueryConfig
}

const AVAILABLE_ACTIONS = ['read', 'create', 'update', 'delete'] as const

type PermissionKey = string // Format: "object:action"

interface PermissionChanges {
  added: PermissionKey[]
  removed: PermissionKey[]
}

export function PermissionSections({ roleId, config }: PermissionSectionsProps) {
  const { data: rolePermissions = [], isLoading } = useRolePermissions(config, roleId)
  const createPermission = useCreateRolePermission(config)
  const deletePermission = useDeletePermission(config)

  // Local state for desired permissions (what user wants)
  const [desiredPermissions, setDesiredPermissions] = useState<Set<PermissionKey>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize desired permissions from API data
  useEffect(() => {
    if (rolePermissions.length > 0) {
      const initialPermissions = new Set<PermissionKey>(
        rolePermissions.map((p) => `${p.object}:${p.action}`)
      )
      setDesiredPermissions(initialPermissions)
      setHasChanges(false)
    }
  }, [rolePermissions])

  // Calculate changes
  const changes = useMemo<PermissionChanges>(() => {
    const currentPermissions = new Set<PermissionKey>(
      rolePermissions.map((p) => `${p.object}:${p.action}`)
    )

    const added: PermissionKey[] = []
    const removed: PermissionKey[] = []

    // Find added permissions
    desiredPermissions.forEach((key) => {
      if (!currentPermissions.has(key)) {
        added.push(key)
      }
    })

    // Find removed permissions
    currentPermissions.forEach((key) => {
      if (!desiredPermissions.has(key)) {
        removed.push(key)
      }
    })

    return { added, removed }
  }, [desiredPermissions, rolePermissions])

  // Update hasChanges when changes occur
  useEffect(() => {
    setHasChanges(changes.added.length > 0 || changes.removed.length > 0)
  }, [changes])

  const permissions = useMemo(() => {
    // Get unique objects from both current and desired permissions
    const currentObjects = new Set(rolePermissions.map((p) => p.object))
    const desiredObjects = new Set(Array.from(desiredPermissions).map((key) => key.split(':')[0]))
    return [...new Set([...currentObjects, ...desiredObjects])]
  }, [rolePermissions, desiredPermissions])

  const hasPermission = (object: string, action: string): boolean => {
    return desiredPermissions.has(`${object}:${action}`)
  }

  const hasAllPermissions = (object: string): boolean => {
    return AVAILABLE_ACTIONS.every((action) => hasPermission(object, action))
  }

  const handlePermissionChange = (object: string, action: string, checked: boolean) => {
    const key: PermissionKey = `${object}:${action}`
    setDesiredPermissions((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  const handleAllPermissionsChange = (object: string, checked: boolean) => {
    setDesiredPermissions((prev) => {
      const next = new Set(prev)
      AVAILABLE_ACTIONS.forEach((action) => {
        const key: PermissionKey = `${object}:${action}`
        if (checked) {
          next.add(key)
        } else {
          next.delete(key)
        }
      })
      return next
    })
  }

  const handleSave = async () => {
    try {
      // Create new permissions
      const createPromises = changes.added.map((key) => {
        const [object, action] = key.split(':')
        return createPermission.mutateAsync({
          roleId,
          data: { object, action },
        })
      })

      // Delete removed permissions
      const deletePromises = changes.removed.map((key) => {
        const [object, action] = key.split(':')
        const permission = rolePermissions.find((p) => p.object === object && p.action === action)
        if (permission) {
          return deletePermission.mutateAsync(permission.id)
        }
        return Promise.resolve()
      })

      await Promise.all([...createPromises, ...deletePromises])
    } catch (error) {
      console.error('Failed to save permissions:', error)
    }
  }

  const handleCancel = () => {
    // Reset to original permissions
    const originalPermissions = new Set<PermissionKey>(
      rolePermissions.map((p) => `${p.object}:${p.action}`)
    )
    setDesiredPermissions(originalPermissions)
  }

  const formatPermissionKey = (key: PermissionKey): string => {
    const [object, action] = key.split(':')
    return `${object}:${action}`
  }

  if (isLoading) {
    return <div>Loading permissions...</div>
  }

  return (
    <div className="space-y-4">
      {/* Changes Summary */}
      {hasChanges && (
        <div className="rounded-lg animate-slide-down border px-4 py-2 bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-base">Pending Changes</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={createPermission.isPending || deletePermission.isPending}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={createPermission.isPending || deletePermission.isPending}>
                {createPermission.isPending || deletePermission.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {changes.added.length > 0 && (
              <div>
                <span className="font-medium text-green-600 dark:text-green-400">Added:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {changes.added.map((key) => (
                    <Badge key={key} variant="outline" className="bg-green-50 dark:bg-green-950">
                      + {formatPermissionKey(key)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {changes.removed.length > 0 && (
              <div>
                <span className="font-medium text-red-600 dark:text-red-400">Removed:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {changes.removed.map((key) => (
                    <Badge key={key} variant="outline" className="bg-red-50 dark:bg-red-950">
                      - {formatPermissionKey(key)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permission Cards */}
      <div className="grid grid-cols-4 gap-4 animate-slide-up">
        {permissions.map((permission) => {
          return (
            <PermissionCard
              key={permission}
              object={permission}
              isChecked={hasAllPermissions(permission)}
              hasPermission={hasPermission}
              onPermissionChange={handlePermissionChange}
              onAllPermissionsChange={handleAllPermissionsChange}
              changes={changes}
            />
          )
        })}
      </div>
    </div>
  )
}
