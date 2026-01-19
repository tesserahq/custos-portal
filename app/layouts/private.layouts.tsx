import { Header, SidebarPanel, SidebarPanelMin } from '@/components/layouts'
import { IMenuItemProps } from '@/components/layouts/sidebar/types'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import '@/styles/sidebar.css'
import { cn } from '@shadcn/lib/utils'
import { KeyRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLoaderData } from 'react-router'

export function loader() {
  const apiUrl = process.env.API_URL
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV
  // app host urls
  const quoreHostUrl = process.env.QUORE_HOST_URL
  const looplyHostUrl = process.env.LOOPLY_HOST_URL
  const vaultaHostUrl = process.env.VAULTA_HOST_URL
  const identiesHostUrl = process.env.IDENTIES_HOST_URL
  const orchaHostUrl = process.env.ORCHA_HOST_URL

  return {
    apiUrl,
    hostUrl,
    nodeEnv,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
  }
}

export default function Layout() {
  const {
    apiUrl,
    hostUrl,
    nodeEnv,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
  } = useLoaderData<typeof loader>()
  const containerRef = useRef<HTMLDivElement>(null)
  const { isLoading } = useApp()
  const [isExpanded, setIsExpanded] = useState(true)

  const apps = useMemo(() => {
    return [
      {
        name: 'quore',
        link: `${quoreHostUrl}?autologin=true`,
      },
      {
        name: 'looply',
        link: `${looplyHostUrl}?autologin=true`,
      },
      {
        name: 'vaulta',
        link: `${vaultaHostUrl}?autologin=true`,
      },
      {
        name: 'identies',
        link: `${identiesHostUrl}?autologin=true`,
      },
      {
        name: 'orcha',
        link: `${orchaHostUrl}?autologin=true`,
      },
    ]
  }, [quoreHostUrl, looplyHostUrl, vaultaHostUrl, identiesHostUrl, orchaHostUrl])

  const menuItems: IMenuItemProps[] = [
    {
      title: 'Roles',
      path: `/roles`,
      icon: <KeyRound size={18} />,
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
          apps={apps}
        />

        <main className="main-content w-full">
          <div className="mx-auto h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
