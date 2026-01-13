import { Button } from '@/modules/shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { PermissionType } from '@/resources/queries/permissions/permission.type'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisVertical, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '../data-table'
import DateTime from '../datetime/date-time'
import { IPaging } from '@/resources'

export default function PermissionListView({
  permissions,
}: {
  permissions: IPaging<PermissionType>
}) {
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) {
      return permissions.items
    }

    return permissions.items.filter((permission) => {
      return (
        permission.object.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [permissions.items, searchQuery])

  const columns = useMemo<ColumnDef<PermissionType>[]>(
    () => [
      {
        accessorKey: 'object',
        header: 'Object',
        size: 500,
        cell: ({ row }) => {
          const { object, action } = row.original
          return (
            <div className="max-w-[200px] truncate" title={object}>
              {object || '-'}.{action || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 50,
        cell: ({ row }) => {
          const { created_at } = row.original
          return <DateTime date={created_at} formatStr="dd/MM/yyyy" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 50,
        cell: ({ row }) => {
          const { updated_at } = row.original
          return <DateTime date={updated_at} formatStr="dd/MM/yyyy" />
        },
      },
      {
        accessorKey: 'id',
        header: '',
        size: 50,
        cell: ({ row }) => {
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-0 hover:bg-transparent hidden"
                  aria-label="Open actions"
                  tabIndex={0}>
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2"></PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [permissions.items]
  )

  return (
    <div className="space-y-4">
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

      <DataTable
        columns={columns}
        data={filteredPermissions || []}
        meta={
          permissions
            ? {
                page: permissions.page,
                pages: permissions.pages,
                size: permissions.size,
                total: permissions.total,
              }
            : undefined
        }
        paginationScope="permissions"
      />
    </div>
  )
}
