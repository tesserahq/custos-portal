import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@/modules/shadcn/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { useUsers } from '@/resources/hooks/users/use-user'
import { UserType } from '@/resources/queries/users/user.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisVertical, EyeIcon, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { DateTime, EmptyContent } from 'tessera-ui/components'

export async function loader({ request }: { request: Request }) {
  const pagination = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination }
}

export default function UsersIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoading: isLoadingAuth } = useApp()
  const navigate = useNavigate()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useUsers(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingAuth }
  )

  const columns = useMemo<ColumnDef<UserType>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Name',
        size: 220,
        cell: ({ row }) => {
          const { id, first_name, last_name, service_account } = row.original
          const fullName = `${first_name || ''} ${last_name || ''}`.trim()
          return (
            <div className="flex items-center gap-2">
              <Link to={`/users/${id}`} className="button-link">
                <div className="max-w-[200px] truncate">{fullName || '-'}</div>
              </Link>
              {service_account && (
                <Badge variant="outline" className="border border-green-500 text-green-600">
                  <span className="text-xs">service-account</span>
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
        cell: ({ row }) => {
          const { email } = row.original
          return <div className="max-w-[200px] truncate">{email || '-'}</div>
        },
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        size: 140,
      },
      {
        accessorKey: 'verified',
        header: 'Verified',
        size: 120,
        cell: ({ row }) => {
          const verified = row.getValue('verified') as boolean

          return verified ? (
            <Badge variant="outline" className="border border-green-500 text-green-600">
              <span className="text-xs">Verified</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="border border-red-500 text-red-600">
              <span className="text-xs">Unverified</span>
            </Badge>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 160,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 160,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
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
                  onClick={() => navigate(`/users/${role.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/users/${role.id}/memberships`)}>
                  <Users size={18} />
                  <span>Memberships</span>
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
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/empty-users.png"
        title="Failed to get users"
        description={error.message}
      />
    )
  }

  if (data?.items.length === 0) {
    return (
      <EmptyContent
        image="/images/empty-users.png"
        title="No users found"
        description="No users are available for this workspace."
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
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Users</h1>
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />
    </div>
  )
}
