import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/modules/shadcn/ui/badge'
import { useUsers } from '@/resources/hooks/users/use-user'
import { UserType } from '@/resources/queries/users/user.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link, useLoaderData } from 'react-router'
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

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useUsers(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingAuth }
  )

  const columns = useMemo<ColumnDef<UserType>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email',
        size: 220,
        cell: ({ row }) => {
          const { id, email } = row.original
          return (
            <Link to={`/users/${id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={email}>
                {email || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'first_name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { first_name, last_name } = row.original
          const fullName = `${first_name || ''} ${last_name || ''}`.trim()
          return (
            <div className="max-w-[200px] truncate" title={fullName}>
              {fullName || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'username',
        header: 'Username',
        size: 180,
        cell: ({ row }) => {
          const username = row.getValue('username') as string
          return (
            <div className="max-w-[160px] truncate" title={username}>
              {username || '-'}
            </div>
          )
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
