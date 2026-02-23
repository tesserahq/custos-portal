import { useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { DateTime, NewButton } from 'tessera-ui/components'
import { AppPreloader } from '@/components/loader/pre-loader'
import { ResourceID } from 'tessera-ui'
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
import { DetailContent } from '../detail-content'
import { NewMembershipDialog, type NewMembershipDialogHandle } from './new-membership-dialog'

interface ServiceAccountMembershipsProps {
  identiesApiUrl: string
  config: IQueryConfig
  roleId: string
}

export function MembershipContent({
  identiesApiUrl,
  config,
  roleId,
}: ServiceAccountMembershipsProps) {
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const newMembershipDialogRef = useRef<NewMembershipDialogHandle>(null)
  const [pagination, setPagination] = useState<{ page: number; size: number }>({
    page: 1,
    size: 25,
  })

  const {
    data: memberhips,
    isLoading,
    error,
    isFetching,
    refetch: refetchMemberships,
  } = useRoleMemberships(config, roleId, pagination)

  const { mutateAsync: deleteMembership } = useDeleteMembership(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef.current?.updateConfig({ isLoading: false })
    },
  })

  useEffect(() => {
    refetchMemberships()
  }, [pagination])

  // Filter to show only service account memberships
  const serviceAccountMemberships = useMemo(() => {
    if (!memberhips?.items) return []
    return memberhips.items
  }, [memberhips])

  const handleDelete = (membership: MembershipType) => {
    deleteConfirmationRef.current?.open({
      title: 'Remove Membership',
      description: `Are you sure you want to remove "${membership.user.email}" from membership this role? This action cannot be undone.`,
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
        cell: ({ row }) => {
          const email = row.original.user.email
          return <div>{email || '-'}</div>
        },
      },
      {
        accessorKey: 'user.first_name',
        header: 'Name',
        cell: ({ row }) => {
          const { first_name, last_name } = row.original.user
          const fullName = `${first_name || ''} ${last_name || ''}`.trim() || '-'
          return <div>{fullName}</div>
        },
      },
      {
        accessorKey: 'domain',
        header: 'Domain',
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
          const createdAt = row.getValue('created_at') as string
          return createdAt && <DateTime date={createdAt} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => {
          const id = row.getValue('id') as string
          return <ResourceID value={id} />
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
    return <AppPreloader className="min-h-[400px]" />
  }

  if (memberhips === undefined || error) {
    return (
      <EmptyContent
        title="Failed to get memberhips"
        description={error?.message}
        image="/images/empty-memberships.png"
      />
    )
  }

  // Don't show pagination for filtered results since filtering is done client-side
  // If needed, we could implement server-side filtering in the future
  const meta = {
    page: memberhips?.page || 1,
    pages: memberhips?.pages || 1,
    size: memberhips?.size || 100,
    total: memberhips?.total || 0,
  }

  return (
    <DetailContent
      title="Memberships"
      actions={
        <div className="flex items-center gap-2">
          <NewButton
            label="New Service Account"
            title="Service Account"
            variant="outline"
            onClick={() =>
              newMembershipDialogRef.current?.open({
                roleId,
                accountType: 'service_account',
              })
            }
            size="sm"
          />
          <NewButton
            label="New User"
            title="User"
            onClick={() =>
              newMembershipDialogRef.current?.open({
                roleId,
                accountType: 'user',
              })
            }
            size="sm"
          />
        </div>
      }>
      {memberhips?.items.length === 0 ? (
        <EmptyContent
          title="No Memberships Found"
          description="Get started by creating your first permission."
          image="/images/empty-memberships.png">
          <Button
            onClick={() =>
              newMembershipDialogRef.current?.open({
                roleId,
                accountType: 'service_account',
              })
            }
            variant="black">
            Start Creating
          </Button>
        </EmptyContent>
      ) : (
        <DataTable
          columns={columns}
          data={serviceAccountMemberships}
          meta={meta}
          isLoading={isFetching}
          fixed={false}
          callbackPagination={setPagination}
        />
      )}

      <DeleteConfirmation ref={deleteConfirmationRef} />

      <NewMembershipDialog
        ref={newMembershipDialogRef}
        roleId={roleId}
        custosApiUrl={config.apiUrl}
        identiesApiUrl={identiesApiUrl!}
        nodeEnv={config.nodeEnv}
        accountType="service_account"
      />
    </DetailContent>
  )
}
