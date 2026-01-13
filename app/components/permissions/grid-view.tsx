import { IPaging } from '@/resources'
import { PermissionType } from '@/resources/queries/permissions/permission.type'
import { Badge } from '@shadcn/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Pagination } from '../data-table/data-pagination'

export default function PermissionGridView({
  permissions,
}: {
  permissions: IPaging<PermissionType>
}) {
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Group permissions by object
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, string[]> = {}

    permissions?.items?.forEach((permission) => {
      if (!groups[permission.object]) {
        groups[permission.object] = []
      }
      groups[permission.object].push(permission.action)
    })

    // Sort actions within each group
    Object.keys(groups).forEach((key) => {
      groups[key].sort()
    })

    return groups
  }, [permissions?.items])

  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedPermissions
    }

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, string[]> = {}

    Object.entries(groupedPermissions).forEach(([object, actions]) => {
      // Check if object name matches or any action matches
      const objectMatches = object.toLowerCase().includes(query)
      const matchingActions = actions.filter((action) => action.toLowerCase().includes(query))

      if (objectMatches) {
        // If object matches, include all actions
        filtered[object] = actions
      } else if (matchingActions.length > 0) {
        // If any action matches, include only matching actions
        filtered[object] = matchingActions
      }
    })

    return filtered
  }, [groupedPermissions, searchQuery])

  return (
    <div className="space-y-4">
      <>
        <div className="relative">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(filteredPermissions).length > 0 ? (
            Object.entries(filteredPermissions).map(([object, actions]) => (
              <Card key={object} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-semibold font-mono">{object}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {actions.map((action) => (
                      <Badge
                        key={action}
                        variant="secondary"
                        className="text-xs font-medium py-0.5 px-2">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No permissions found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {Object.entries(filteredPermissions).length > 0 && (
          <Pagination
            meta={{
              page: permissions.page,
              size: permissions.size,
              total: permissions.total,
              pages: permissions.pages,
            }}
            scope="permissions"
          />
        )}
      </>
    </div>
  )
}
