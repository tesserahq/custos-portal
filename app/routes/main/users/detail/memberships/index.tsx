import { DataTable } from '@/components/data-table'
import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import { ResourceID, useApp } from 'tessera-ui'
import { AssignRoleUserDialog } from '@/components/memberhips'
import type { AssignRoleUserDialogHandle } from '@/components/memberhips/assign-role-user'
import { useUserMemberships } from '@/resources/hooks/users/use-user'
import { useDeleteMembership } from '@/resources/hooks/memberships/use-membership'
import { createRoleMembership } from '@/resources/queries/memberships/membership.queries'
import { MembershipType } from '@/resources/queries/memberships/membership.type'
import { ColumnDef } from '@tanstack/react-table'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { toast } from 'tessera-ui/components'
import { DateTime, EmptyContent, NewButton } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { Button } from '@shadcn/ui/button'
import { EllipsisVertical, EyeIcon, Trash2 } from 'lucide-react'

export async function loader({ params }: { params: { userID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.userID }
}

export default function UserMembershipsIndex() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const assignRoleDialogRef = useRef<AssignRoleUserDialogHandle>(null)
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [pagination, setPagination] = useState<{ page: number; size: number }>({
    page: 1,
    size: 25,
  })

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch: refetchMemberships,
  } = useUserMemberships(config, id, pagination, {
    enabled: !!token,
  })

  const { mutateAsync: deleteMembership } = useDeleteMembership(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = useCallback(
    (membership: MembershipType) => {
      deleteConfirmationRef.current?.open({
        title: 'Remove Membership',
        description: `Are you sure you want to remove "${membership.role.name}" from this user? This action cannot be undone.`,
        onDelete: async () => {
          deleteConfirmationRef.current?.updateConfig({ isLoading: true })
          await deleteMembership(membership.id)
        },
      })
    },
    [deleteMembership]
  )

  const columns = useMemo<ColumnDef<MembershipType>[]>(
    () => [
      {
        accessorKey: 'role.name',
        header: 'Role',
        cell: ({ row }) => {
          const role = row.original.role
          return (
            <Link to={`/users/${id}/memberships/${row.original.id}`} className="button-link">
              {role.name || 'N/A'}
            </Link>
          )
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
          const date = row.getValue('created_at') as string
          return date && <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return date && <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
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
        size: 60,
        cell: ({ row }) => {
          const membership = row.original
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="px-0">
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/users/${id}/memberships/${membership.id}`)}>
                  <EyeIcon size={18} />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(membership)}>
                  <Trash2 size={18} />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [handleDelete, id, navigate]
  )

  const existingRoleIds = useMemo(
    () => new Set((data?.items || []).map((membership) => membership.role_id)),
    [data?.items]
  )

  if (isLoading) {
    return <AppPreloader className="min-h-[400px]" />
  }

  if (data === undefined || error) {
    return (
      <EmptyContent
        title="Failed to get memberships"
        description={error?.message}
        image="/images/empty-memberships.png"
      />
    )
  }

  if (data.items.length === 0) {
    return (
      <EmptyContent
        title="No Memberships Found"
        description="This user has no memberships yet."
        image="/images/empty-memberships.png"
      />
    )
  }

  const meta = data
    ? {
        page: data.page,
        pages: data.pages,
        size: data.size,
        total: data.total,
      }
    : undefined

  return (
    <DetailContent
      title="Memberships"
      actions={
        <NewButton
          title="Assign Roles"
          label="Assign Roles to Membership"
          onClick={() =>
            assignRoleDialogRef.current?.open({
              userId: id,
              selectedRoleIds: Array.from(existingRoleIds),
            })
          }
        />
      }>
      <DataTable
        columns={columns}
        data={data?.items || []}
        meta={meta}
        isLoading={isFetching}
        fixed={false}
        callbackPagination={setPagination}
      />

      <AssignRoleUserDialog
        ref={assignRoleDialogRef}
        apiUrl={apiUrl!}
        nodeEnv={nodeEnv!}
        onConfirm={async ({ userId, roleIds }) => {
          const newRoleIds = roleIds.filter((roleId) => !existingRoleIds.has(roleId))

          if (newRoleIds.length === 0) {
            toast.info('No new roles selected.')
            return
          }

          await Promise.all(
            newRoleIds.map((roleId) =>
              createRoleMembership(config, roleId, { user_id: userId, domain: '*' })
            )
          )

          toast.success('Roles assigned successfully.')
          await refetchMemberships()
        }}
      />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </DetailContent>
  )
}
