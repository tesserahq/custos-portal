import { useLoaderData } from 'react-router'
import { useApp } from '@/context/AppContext'
import { AppPreloader } from '@/components/loader/pre-loader'
import { ServiceAccountMemberships, BindServiceAccountDialog } from '@/components/service-accounts'
import { DetailContent } from '@/components/detail-content'
import { useState } from 'react'
import { NewButton } from 'tessera-ui/components'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id, identiesApiUrl }
}

export default function RoleMemberships() {
  const { apiUrl, nodeEnv, id, identiesApiUrl } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const [isBindDialogOpen, setIsBindDialogOpen] = useState(false)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  if (!token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <>
      <DetailContent
        title="Memberships"
        actions={
          <NewButton
            label="Bind Service Account"
            onClick={() => setIsBindDialogOpen(true)}
            size="sm"
          />
        }>
        <ServiceAccountMemberships config={config} roleId={id} />
      </DetailContent>

      <BindServiceAccountDialog
        open={isBindDialogOpen}
        onOpenChange={setIsBindDialogOpen}
        custosApiUrl={apiUrl!}
        identiesApiUrl={identiesApiUrl!}
        nodeEnv={nodeEnv}
        roleId={id}
      />
    </>
  )
}
