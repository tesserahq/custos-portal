import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from 'tessera-ui'
import { Button } from '@/modules/shadcn/ui/button'
import { useUser } from '@/resources/hooks/users/use-user'
import { FileText, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { EmptyContent } from 'tessera-ui/components'
import { BreadcrumbItemData, DetailItemsProps, Layout } from 'tessera-ui/layouts'
import useBreadcrumb from '@/hooks/useBreadcrumbs'

export function loader({ params }: { params: { userID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.userID }
}

export default function UserDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItemData[]>([])

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/users/${params.userID}/overview`,
      icon: Users,
    },
    {
      title: 'Memberships',
      path: `/users/${params.userID}/memberships`,
      icon: Users,
    },
  ]

  const {
    data: user,
    isLoading,
    error,
  } = useUser({ apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }, params.userID as string, {
    enabled: !!token,
  })

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const userID = params.userID

  if (!isLoading && (error || !user)) {
    return (
      <EmptyContent
        title="User Not Found"
        image="/images/empty-users.png"
        description={`We can't find user with ID ${params.userID} ${(error as Error)?.message}`}>
        <Button onClick={() => navigate('/users')}>Back to Users</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length == 0 || !token || !userID}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
