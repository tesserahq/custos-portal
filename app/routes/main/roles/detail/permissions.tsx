import { useLoaderData } from 'react-router'
import { useApp } from '@/context/AppContext'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useRolePermissions } from '@/resources/hooks/permissions/use-permission'
import { PermissionSections } from '@/components/permissions/sections'
import { PageContent } from '@/components/page-content'
import { useState } from 'react'
import { Badge } from '@/modules/shadcn/ui/badge'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id, identiesApiUrl }
}

export default function RolePermissions() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: rolePermissions = [], isLoading: isLoadingPermissions } = useRolePermissions(
    config,
    id
  )

  if (isLoadingPermissions || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <PageContent
      title="Permissions"
      actions={
        <Badge variant="outline" className="font-mono">
          {rolePermissions.length} total permissions
        </Badge>
      }>
      <PermissionSections rolePermissions={rolePermissions} />
    </PageContent>
  )
}
