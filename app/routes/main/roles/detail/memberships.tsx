import { MembershipContent } from '@/components/memberhips'
import { useApp } from '@/context/AppContext'
import { useLoaderData } from 'react-router'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id, identiesApiUrl }
}

export default function RoleMemberships() {
  const { apiUrl, nodeEnv, id, identiesApiUrl } = useLoaderData<typeof loader>()
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  return <MembershipContent identiesApiUrl={identiesApiUrl!} config={config} roleId={id} />
}
