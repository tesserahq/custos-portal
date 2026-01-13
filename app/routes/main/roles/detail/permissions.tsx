import EmptyContent from '@/components/empty-content/empty-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import { PermissionContent } from '@/components/permissions/content'
import { useApp } from '@/context/AppContext'
import { useRolePermissions } from '@/resources/hooks/permissions/use-permission'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { useState } from 'react'
import { useLoaderData } from 'react-router'

export async function loader({ request, params }: { request: Request; params: { id: string } }) {
  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id, identiesApiUrl, pagination }
}

export default function RolePermissions() {
  const { apiUrl, nodeEnv, id, pagination } = useLoaderData<typeof loader>()
  const { page, size } = pagination
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const {
    data: rolePermissions,
    isLoading: isLoadingPermissions,
    error,
  } = useRolePermissions(config, id, {
    page,
    size,
  })

  if (isLoadingPermissions || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error) {
    return (
      <EmptyContent
        title="Error"
        description={error.message}
        image="/images/empty-permissions.png"
      />
    )
  }

  return <PermissionContent permissions={rolePermissions!} />
}
