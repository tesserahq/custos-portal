import { PermissionContent } from '@/components/permissions/content'
import { useApp } from 'tessera-ui'
import { useLoaderData } from 'react-router'

export async function loader({ request, params }: { request: Request; params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id, identiesApiUrl }
}

export default function RolePermissions() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  return <PermissionContent config={config} roleId={id} />
}
