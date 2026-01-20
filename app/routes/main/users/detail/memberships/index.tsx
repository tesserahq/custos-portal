import { DataTable } from '@/components/data-table'
import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import { useUserMemberships } from '@/resources/hooks/users/use-user'
import { MembershipType } from '@/resources/queries/memberships/membership.type'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { Link, useLoaderData } from 'react-router'
import { DateTime, EmptyContent } from 'tessera-ui/components'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
}

export default function UserMembershipsIndex() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const [pagination, setPagination] = useState<{ page: number; size: number }>({
    page: 1,
    size: 25,
  })

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error, isFetching } = useUserMemberships(config, id, pagination, {
    enabled: !!token,
  })

  const columns = useMemo<ColumnDef<MembershipType>[]>(
    () => [
      {
        accessorKey: 'user.email',
        header: 'Email',
        size: 240,
        cell: ({ row }) => {
          const user = row.original.user
          return (
            <Link to={`/users/${id}/memberships/${row.original.id}`} className="button-link">
              <div className="max-w-[220px] truncate">{user.email || '-'}</div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'user.first_name',
        header: 'Name',
        size: 240,
        cell: ({ row }) => {
          const user = row.original.user
          const name = user.first_name + ' ' + user.last_name

          return <div className="max-w-[220px] truncate">{name || '-'}</div>
        },
      },
      {
        accessorKey: 'role.name',
        header: 'Role',
        size: 240,
        cell: ({ row }) => {
          const role = row.original.role
          return (
            <Link to={`/roles/${role.id}`} className="button-link">
              {role.name || 'N/A'}
            </Link>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 160,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return date && <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 160,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return date && <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
    ],
    [id]
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
    <DetailContent title="Memberships">
      <DataTable
        columns={columns}
        data={data?.items || []}
        meta={meta}
        isLoading={isFetching}
        fixed={false}
        callbackPagination={setPagination}
      />
    </DetailContent>
  )
}
