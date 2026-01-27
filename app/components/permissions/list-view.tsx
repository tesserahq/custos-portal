import { Button } from '@/modules/shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { useDeletePermission } from '@/resources/hooks/permissions/use-permission'
import { PermissionType } from '@/resources/queries/permissions/permission.type'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisVertical, Search, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { DataTable } from '../data-table'
import { DateTime } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'
import { PermissionContentProps } from './type'

export default function PermissionListView({
  config,
  permissions,
  isLoading,
  onChangePagination,
}: PermissionContentProps) {
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const { mutateAsync: deletePermission } = useDeletePermission(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef.current?.updateConfig({ isLoading: false })
    },
  })

  const filteredPermissions = useMemo(() => {
    return permissions?.items
  }, [permissions?.items])

  const handleDelete = (permission: PermissionType) => {
    deleteConfirmationRef.current?.open({
      title: 'Remove Permission',
      description: `Are you sure you want to remove "${permission.object}.${permission.action}" from this role? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        await deletePermission(permission.id)
      },
    })
  }

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
          const permission = row.original
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  aria-label="Open actions"
                  tabIndex={0}>
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(permission)}>
                  <Trash2 size={18} />
                  <span>Remove</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [permissions?.items]
  )

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={filteredPermissions ?? []}
        isLoading={isLoading}
        fixed={false}
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
        callbackPagination={onChangePagination}
      />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
