import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import { Button } from '@/modules/shadcn/ui/button'
import { useRole } from '@/resources/hooks/roles/use-role'
import { FileText, KeyRound, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { EmptyContent } from 'tessera-ui/components'
import { Layout, DetailItemsProps, BreadcrumbItemData } from 'tessera-ui/layouts'

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
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItemData[]>([])

  // Nested Items for the role
  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/roles/${params.id}/overview`,
      icon: <FileText size={18} />,
    },
    {
      title: 'Permissions',
      path: `/roles/${params.id}/permissions`,
      icon: <KeyRound size={18} />,
    },
    {
      title: 'Memberships',
      path: `/roles/${params.id}/memberships`,
      icon: <Users size={18} />,
    },
  ]

  // Generate resource data (role) to get name/title from resource
  const {
    data: role,
    isLoading,
    error,
  } = useRole({ apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }, params.id as string, {
    enabled: !!token,
  })

  // Generate breadcrumb based on the pathname and role name
  const generatingBreadcrumb = async () => {
    const breadcrumbItems = []

    const pathParts = pathname.split('/').filter(Boolean)

    for (let index = 0; index < pathParts.length; index++) {
      const part = pathParts[index]

      breadcrumbItems.push({
        // If the part is the same as the role id, use the role name, otherwise use the part
        label: part === params?.id ? role?.name || '' : part,

        // Generate the link based on the path parts
        link: `/${pathParts.slice(0, index + 1).join('/')}`,
      })
    }

    setBreadcrumb(breadcrumbItems)
  }

  useEffect(() => {
    if (role) {
      generatingBreadcrumb()
    }
  }, [role, pathname])

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error || !role) {
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
    <Layout.Detail menuItems={menuItems} breadcrumb={breadcrumb}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
