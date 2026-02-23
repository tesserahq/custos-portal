import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { useRole } from '@/resources/hooks/roles/use-role'
import { FileText, KeyRound, Users } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
}

export default function RoleDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Nested Items for the role
  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/roles/${params.roleID}/overview`,
      icon: FileText,
    },
    {
      title: 'Permissions',
      path: `/roles/${params.roleID}/permissions`,
      icon: KeyRound,
    },
    {
      title: 'Memberships',
      path: `/roles/${params.roleID}/memberships`,
      icon: Users,
    },
  ]

  // Generate resource data (role) to get name/title from resource
  const {
    data: role,
    isLoading,
    error,
  } = useRole({ apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }, params.roleID as string, {
    enabled: !!token,
  })

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const roleID = params.roleID

  if (!isLoading && (error || !role)) {
    return (
      <EmptyContent
        title="Role Not Found"
        image="/images/empty-roles.png"
        description={`We can't find role with ID ${params.id} ${(error as Error)?.message}`}>
        <Button onClick={() => navigate('/roles')}>Back to Roles</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length == 0 || !token || !roleID}>
      <div className="max-w-screen-2xl mx-auto p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
