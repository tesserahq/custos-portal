import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { useApp } from 'tessera-ui'
import { useUser } from '@/resources/hooks/users/use-user'
import { useLoaderData } from 'react-router'
import { DateTime } from 'tessera-ui/components'
import { Badge } from '@/modules/shadcn/ui/badge'
import { UserPermissionCheckDialog } from '@/components/users/permission-check'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
}

export default function UserOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: user, isLoading } = useUser(config, id)

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={user?.email || ''}
        actions={<UserPermissionCheckDialog config={config} userId={id} />}>
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">Email</dt>
            <dd className="d-content">{user?.email || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Name</dt>
            <dd className="d-content">
              {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Provider</dt>
            <dd className="d-content">{user?.provider || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Status</dt>
            <dd className="d-content">
              {user?.verified ? (
                <Badge variant="outline" className="border border-green-500 text-green-600">
                  <span className="text-xs">Verified</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="border border-red-500 text-red-600">
                  <span className="text-xs">Unverified</span>
                </Badge>
              )}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Confirmed At</dt>
            <dd className="d-content">
              {user?.confirmed_at && <DateTime date={user?.confirmed_at} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {user?.created_at && <DateTime date={user?.created_at} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {user?.updated_at && <DateTime date={user?.updated_at} />}
            </dd>
          </div>
        </div>
      </DetailContent>
    </div>
  )
}
