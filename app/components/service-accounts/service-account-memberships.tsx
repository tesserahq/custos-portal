import { useMemo, useRef } from 'react'
import { DataTable } from '@/components/data-table'
import { DateTime } from 'tessera-ui/components'
import { AppPreloader } from '@/components/loader/pre-loader'
import {
  useRoleMemberships,
  useDeleteMembership,
} from '@/resources/hooks/memberships/use-membership'
import { MembershipType } from '@/resources/queries/memberships/membership.type'
import { IQueryConfig } from '@/resources/queries'
import { ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { EllipsisVertical } from 'lucide-react'
import { EmptyContent } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

interface ServiceAccountMembershipsProps {
  config: IQueryConfig
  roleId: string
}

export function ServiceAccountMemberships({ config, roleId }: ServiceAccountMembershipsProps) {
  const size = 100 // Fetch more items to ensure we get all service accounts
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const { data, isLoading, error } = useRoleMemberships(config, roleId, { page: 1, size })

  const { mutateAsync: deleteMembership } = useDeleteMembership(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
  })

  // Filter to show only service account memberships
  const serviceAccountMemberships = useMemo(() => {
    if (!data?.items) return []
    return data.items
  }, [data])

  const handleDelete = (membership: MembershipType) => {
    deleteConfirmationRef.current?.open({
      title: 'Remove Service Account',
      description: `Are you sure you want to remove "${membership.user.email}" from this role? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteMembership(membership.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<MembershipType>[]>(
    () => [
      {
        accessorKey: 'user.email',
        header: 'Email',
        size: 250,
        cell: ({ row }) => {
          const email = row.original.user.email
          return (
            <div className="max-w-[200px] truncate" title={email}>
              {email || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'user.first_name',
        header: 'Name',
        size: 250,
        cell: ({ row }) => {
          const { first_name, last_name } = row.original.user
          const fullName = `${first_name || ''} ${last_name || ''}`.trim() || '-'
          return (
            <div className="max-w-[200px] truncate" title={fullName}>
              {fullName}
            </div>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 200,
        cell: ({ row }) => {
          const createdAt = row.getValue('created_at') as string
          return createdAt && <DateTime date={createdAt} formatStr="dd/MM/yyyy" />
        },
      },
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => {
          const membership = row.original
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="px-0">
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="center" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(membership)}>
                  <Trash2 size={18} />
                  <span>Remove</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    []
  )

  if (isLoading) {
    return <AppPreloader className="min-h-[200px]" />
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load service account memberships</p>
        </div>
      </div>
    )
  }

  // Don't show pagination for filtered results since filtering is done client-side
  // If needed, we could implement server-side filtering in the future
  const meta = {
    page: data?.page || 1,
    pages: data?.pages || 1,
    size: data?.size || 100,
    total: data?.total || 0,
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={serviceAccountMemberships}
        meta={meta}
        isLoading={isLoading}
        fixed={false}
        empty={
          <EmptyContent
            title="No service accounts bound"
            description="No service accounts are currently bound to this role."
            image="/images/empty-role.png"
          />
        }
      />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </>
  )
}
