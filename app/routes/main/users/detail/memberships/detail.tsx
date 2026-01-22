import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import { PermissionContent } from '@/components/permissions/content'
import { useApp } from '@/context/AppContext'
import { Button } from '@/modules/shadcn/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'
import { useMembership } from '@/resources/hooks/memberships/use-membership'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { DateTime, EmptyContent } from 'tessera-ui/components'

export async function loader({ params }: { params: { id: string; membershipId: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, userId: params.id, membershipId: params.membershipId }
}

export default function UserMembershipDetail() {
  const { apiUrl, nodeEnv, userId, membershipId } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const {
    data: membership,
    isLoading,
    error,
  } = useMembership(config, membershipId, {
    enabled: !!token,
  })

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error || !membership) {
    return (
      <EmptyContent
        title="Membership Not Found"
        image="/images/empty-memberships.png"
        description={`We can't find membership with ID ${membershipId} ${(error as Error)?.message}`}>
        <Button onClick={() => navigate(`/users/${userId}/memberships`)}>
          Back to Memberships
        </Button>
      </EmptyContent>
    )
  }

  return (
    <div className="space-y-5">
      <DetailContent title="Membership Detail">
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">Email</dt>
            <dd className="d-content">{membership.user.email || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Name</dt>
            <dd className="d-content">
              {`${membership.user?.first_name || ''} ${membership.user?.last_name || ''}`.trim() ||
                'N/A'}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Role</dt>
            <dd className="d-content">
              <Link to={`/roles/${membership.role.id}`} className="button-link">
                {membership.role.name || 'N/A'}
              </Link>
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Domain</dt>
            <dd className="d-content">
              {membership.domain.length > 8 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{membership.domain.slice(0, 8) || 'N/A'}</TooltipTrigger>
                    <TooltipContent align="start">{membership.domain}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span>{membership.domain}</span>
              )}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              {membership.created_at && <DateTime date={membership.created_at} />}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              {membership.updated_at && <DateTime date={membership.updated_at} />}
            </dd>
          </div>
        </div>
      </DetailContent>

      <PermissionContent config={config} roleId={membership.role.id} />
    </div>
  )
}
