/* eslint-disable @typescript-eslint/no-explicit-any */
import MenuToggle from '@/components/misc/MenuToggle'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import Separator from '@/components/ui/separator'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources+/update-theme'
import { cn } from '@/utils/misc'
import { Link, useNavigate, useSubmit } from '@remix-run/react'
import { ProfileMenu } from 'core-ui'
import { Grip, Play } from 'lucide-react'
import { useState } from 'react'

interface IHeaderProps {
  identiesHostUrl: string
  action?: React.ReactNode
  withSidebar?: boolean
  isExpanded?: boolean
  setIsExpanded?: (isExpanded: boolean) => void
}

export default function Header({
  isExpanded,
  setIsExpanded,
  action,
  withSidebar,
  identiesHostUrl,
}: IHeaderProps) {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const navigate = useNavigate()
  const [isOpenAppMenu, setIsOpenAppMenu] = useState<boolean>(false)
  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      },
    )
  }

  const apps = [
    {
      name: 'quore',
      link: 'https://quore.estate-buddy.com?autologin=true',
    },
    {
      name: 'vaulta',
      link: 'https://vaulta.estate-buddy.com?autologin=true',
    },
    {
      name: 'identies',
      link: 'https://identies.estate-buddy.com?autologin=true',
    },
  ]

  return (
    <>
      <nav className="header animate-slide-down print:hidden">
        <div className="header-container relative flex w-full print:hidden">
          <div className="flex w-full items-center justify-between space-x-5">
            {/* Left content */}
            <div className={cn('flex items-center gap-2', withSidebar && 'ml-0')}>
              {withSidebar ? (
                <MenuToggle onClick={() => setIsExpanded!(!isExpanded)} />
              ) : (
                <Link to="/">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/images/logo.png" />
                    </Avatar>
                    <span className="text-lg font-bold">Quore</span>
                  </div>
                </Link>
              )}
              {action && (
                <Separator
                  orientation="vertical"
                  className="mr-1.5 h-3 bg-slate-400 dark:bg-slate-500"
                />
              )}
              {action}
            </div>

            {/* Right content */}
            <div className="mr-10 flex items-center space-x-3">
              <Button size="sm" variant="outline" onClick={() => navigate('/setup')}>
                <Play />
                Re-run
              </Button>

              {/* Apps Menu */}
              <DropdownMenu open={isOpenAppMenu} onOpenChange={setIsOpenAppMenu}>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0',
                      isOpenAppMenu && 'bg-accent',
                    )}>
                    <Grip />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="grid max-h-[400px] grid-cols-3 gap-1 overflow-auto px-5 py-3"
                  align="end">
                  {apps.map((app) => {
                    return (
                      <Link
                        key={app.name}
                        to={app.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent">
                        <Avatar>
                          <AvatarImage src={`/images/apps/${app.name}-logo.png`} />
                        </Avatar>
                        <span className="text-xs capitalize">{app.name}</span>
                      </Link>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <ProfileMenu
                defaultAvatar="/images/default-avatar.jpg"
                selectedTheme={requestInfo.userPrefs.theme || 'system'}
                onSetTheme={(theme) => onSetTheme(theme)}
                actionLogout={() => navigate('/logout')}
                actionProfile={() => window.open(identiesHostUrl, '_blank')}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
