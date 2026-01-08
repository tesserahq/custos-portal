import { DataTable } from '@/components/data-table'
import { DateTime } from '@/components/datetime'
import DeleteConfirmation from '@/components/delete-confirmation/delete-confirmation'
import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import NewButton from '@/components/new-button/new-button'
import { useApp } from '@/context/AppContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/modules/shadcn/ui/dialog'
import { useDeleteRole, useRoles } from '@/resources/hooks/roles/use-role'
import { useRolePermissions } from '@/resources/hooks/permissions/use-permission'
import { PermissionSections } from '@/components/permissions/sections'
import { ServiceAccountMemberships } from '@/components/service-accounts'
import { RoleType } from '@/resources/queries/roles/role.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { useScopedParams } from '@/utils/helpers/params.helper'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, EllipsisVertical, EyeIcon, Trash2, Shield, Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'

export async function loader({ request }: { request: Request }) {
  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination }
}

export default function RolesIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoading: isLoadingAuth } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<React.ComponentRef<typeof DeleteConfirmation>>(null)
  const { getParam } = useScopedParams()
  const [permissionsRoleId, setPermissionsRoleId] = useState<string | null>(null)
  const [membershipsRoleId, setMembershipsRoleId] = useState<string | null>(null)

  // Get pagination params from URL
  const page = Number(getParam('page') || pagination.page)
  const size = Number(getParam('size') || pagination.size)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useRoles(
    config,
    { page, size },
    { enabled: !!token && !isLoadingAuth }
  )

  const { data: rolePermissions = [], isLoading: isLoadingPermissions } = useRolePermissions(
    config,
    permissionsRoleId || '',
    { enabled: !!permissionsRoleId && !!token }
  )

  const { mutateAsync: deleteRole } = useDeleteRole(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
  })

  const handleDelete = (role: RoleType) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Role',
      description: `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteRole(role.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<RoleType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { id, name } = row.original
          return (
            <Link to={`/roles/${row.original.id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={name}>
                {name || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'identifier',
        header: 'Identifier',
        size: 200,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 450,
        cell: ({ row }) => {
          const description = row.getValue('description') as string
          return (
            <div className="max-w-[400px] truncate" title={description}>
              {description || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 100,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 100,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return <DateTime date={date} />
        },
      },
      {
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const role = row.original
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
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/roles/${role.id}`)}>
                  <EyeIcon size={18} />
                  <span>View</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => setPermissionsRoleId(role.id)}>
                  <Shield size={18} />
                  <span>Permissions</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => setMembershipsRoleId(role.id)}>
                  <Users size={18} />
                  <span>Memberships</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/roles/${role.id}/edit`)}
                  aria-label="Edit role"
                  tabIndex={0}
                  className="flex w-full justify-start gap-2">
                  <Edit size={18} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(role)}
                  aria-label="Delete role"
                  tabIndex={0}>
                  <Trash2 size={18} />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [navigate]
  )

  if (isLoading) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Error loading roles</h2>
          <p className="mt-2 text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  if (data?.items.length === 0) {
    return (
      <EmptyContent
        image="/images/empty-roles.png"
        title="No roles found"
        description="Get started by creating your first role.">
        <Button onClick={() => navigate('/roles/new')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  return (
    <div className="animate-slide-up h-full">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Roles</h1>
        <NewButton label="New Role" onClick={() => navigate('/roles/new')} disabled={isLoading} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        meta={
          data
            ? {
                page: data.page,
                pages: data.pages,
                size: data.size,
                total: data.total,
              }
            : undefined
        }
        isLoading={isLoading}
      />

      <DeleteConfirmation ref={deleteConfirmationRef} />

      <Dialog
        open={!!permissionsRoleId}
        onOpenChange={(open) => !open && setPermissionsRoleId(null)}>
        <DialogContent className="max-w-[80%]! w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {data?.items.find((r) => r.id === permissionsRoleId)?.name || 'Role'} - Permissions
            </DialogTitle>
          </DialogHeader>
          {permissionsRoleId && (
            <>
              {isLoadingPermissions ? (
                <AppPreloader className="min-h-[200px]" />
              ) : (
                <PermissionSections rolePermissions={rolePermissions} showTitle={false} />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!membershipsRoleId}
        onOpenChange={(open) => !open && setMembershipsRoleId(null)}>
        <DialogContent className="max-w-[80%]! w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="mb-5">
              {data?.items.find((r) => r.id === membershipsRoleId)?.name || 'Role'} - Memberships
            </DialogTitle>
          </DialogHeader>
          {membershipsRoleId && (
            <div className="space-y-4">
              <ServiceAccountMemberships config={config} roleId={membershipsRoleId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
