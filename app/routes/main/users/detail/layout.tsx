import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from 'tessera-ui'
import { Button } from '@/modules/shadcn/ui/button'
import { useUser } from '@/resources/hooks/users/use-user'
import { FileText, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { EmptyContent } from 'tessera-ui/components'
import { BreadcrumbItemData, DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
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
      path: `/users/${params.id}/overview`,
      icon: Users,
    },
    {
      title: 'Memberships',
      path: `/users/${params.id}/memberships`,
      icon: Users,
    },
  ]

  const {
    data: user,
    isLoading,
    error,
  } = useUser({ apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }, params.id as string, {
    enabled: !!token,
  })

  const generatingBreadcrumb = async () => {
    const breadcrumbItems = []
    const pathParts = pathname.split('/').filter(Boolean)

    for (let index = 0; index < pathParts.length; index++) {
      const part = pathParts[index]
      const label = part === params?.id ? user?.email || '' : part

      breadcrumbItems.push({
        label,
        link: `/${pathParts.slice(0, index + 1).join('/')}`,
      })
    }

    setBreadcrumb(breadcrumbItems)
  }

  useEffect(() => {
    if (user) {
      generatingBreadcrumb()
    }
  }, [user, pathname])

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error || !user) {
    return (
      <EmptyContent
        title="User Not Found"
        image="/images/empty-users.png"
        description={`We can't find user with ID ${params.id} ${(error as Error)?.message}`}>
        <Button onClick={() => navigate('/users')}>Back to Users</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail menuItems={menuItems} breadcrumb={breadcrumb}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
