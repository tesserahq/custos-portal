/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import Header from '@/components/misc/Header'
import SidebarPanel, { IMenuItemProps } from '@/components/misc/Sidebar/SidebarPanel'
import SidebarPanelMin from '@/components/misc/Sidebar/SidebarPanelMin'
import '@/styles/customs/sidebar.css'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import { CoreUIProvider } from 'core-ui'
import { Home } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const identiesHosturl = process.env.IDENTIES_HOST_URL

  return { apiUrl, identiesApiUrl, identiesHosturl }
}

export default function Layout() {
  const { identiesApiUrl, identiesHosturl } = useLoaderData<typeof loader>()
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const [isExpanded, setIsExpanded] = useState(true)
  const [token, setToken] = useState<string>('')

  const menuItems: IMenuItemProps[] = [
    {
      title: 'Home',
      path: `/home`,
      icon: <Home size={18} />,
    },
  ]

  const onResize = useCallback(() => {
    if (containerRef.current) {
      if (containerRef.current.offsetWidth <= 1280) {
        setIsExpanded(false)
      }
    }
  }, [])

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      setToken(token)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  useEffect(() => {
    if (!isLoading) {
      fetchToken()
    }
  }, [isLoading])

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <CoreUIProvider
      token={token}
      identiesApiUrl={identiesApiUrl!}
      isAuthenticated={isAuthenticated}
      callbacktUnauthorized={() => navigate('/', { replace: true })}>
      <div
        ref={containerRef}
        className={cn('has-min-sidebar is-header-blur', isExpanded && 'is-sidebar-open')}>
        <div id="root" className="min-h-100vh flex grow">
          <div className="sidebar print:hidden">
            <SidebarPanel
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              menuItems={menuItems}
            />
            <SidebarPanelMin
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              menuItems={menuItems}
            />
          </div>

          <Header
            identiesHostUrl={identiesHosturl!}
            withSidebar
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />

          <main className="main-content w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </CoreUIProvider>
  )
}
