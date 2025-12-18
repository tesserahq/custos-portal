import { Header, SidebarPanel, SidebarPanelMin } from '@/components/layouts'
import { IMenuItemProps } from '@/components/layouts/sidebar/types'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import '@/styles/sidebar.css'
import { cn } from '@shadcn/lib/utils'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Home } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, hostUrl, nodeEnv }
}

export default function Layout() {
  const { apiUrl, hostUrl, nodeEnv } = useLoaderData<typeof loader>()
  const containerRef = useRef<HTMLDivElement>(null)
  const { isLoading } = useApp()
  const [isExpanded, setIsExpanded] = useState(true)

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

  useEffect(() => {
    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div
      ref={containerRef}
      className={cn('has-min-sidebar is-header-blur', isExpanded && 'is-sidebar-open')}>
      <div id="root" className="min-h-100vh flex grow">
        <div className="sidebar print:hidden">
          <SidebarPanel menuItems={menuItems} />
          <SidebarPanelMin menuItems={menuItems} />
        </div>

        <Header
          withSidebar
          apiUrl={apiUrl!}
          nodeEnv={nodeEnv}
          hostUrl={hostUrl}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        <main className="main-content w-full">
          <div className="mx-auto h-full w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
