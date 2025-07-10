/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { getCurrentUrl, setCurrentUrl } from '@/libraries/storage'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources+/update-theme'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLocation, useNavigate, useSubmit } from '@remix-run/react'
import { Bot, LogOut } from 'lucide-react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown'
import Separator from '../ui/separator'
import { Toggle } from '../ui/toggle'
import MenuToggle from './MenuToggle'

interface IHeaderProps {
  action?: React.ReactNode
  withSidebar?: boolean
  isExpanded?: boolean
  setIsExpanded?: (isExpanded: boolean) => void
  hostUrl?: string
}

export default function Header({
  isExpanded,
  setIsExpanded,
  action,
  withSidebar,
  hostUrl,
}: IHeaderProps) {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth0()
  const onSetTheme = () => {
    submit(
      { theme: requestInfo.userPrefs.theme === 'dark' ? 'light' : 'dark' },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      },
    )
  }

  return (
    <>
      <nav className="header animate-slide-down print:hidden">
        <div className="header-container relative flex w-full print:hidden">
          <div className="flex w-full items-center justify-between space-x-5">
            {/* Left content */}
            <div className={cn('flex items-center gap-2', withSidebar && 'ml-4')}>
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
            <div className="-mr-1 flex items-center space-x-5">
              <Toggle
                pressed={location.pathname === '/assistant'}
                variant="outline"
                className="data-[state=on]:bg-[#85d5de] data-[state=on]:dark:bg-[#287f92]"
                onPressedChange={(pressed) => {
                  if (pressed) {
                    setCurrentUrl(location.pathname) // save current url to localStorage
                    navigate('/assistant')
                  } else {
                    // back to current Url
                    const currentUrl = getCurrentUrl()

                    navigate(currentUrl || '/')
                  }
                }}>
                <Bot />
                Assistant Mode
              </Toggle>
              <button
                className="btn rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25"
                onClick={onSetTheme}>
                {requestInfo.userPrefs.theme === 'dark' ? (
                  <svg
                    className="size-6 origin-top text-amber-400 transition-transform duration-200 ease-out"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M11.75 3.412a.818.818 0 01-.07.917 6.332 6.332 0 00-1.4 3.971c0 3.564 2.98 6.494 6.706 6.494a6.86 6.86 0 002.856-.617.818.818 0 011.1 1.047C19.593 18.614 16.218 21 12.283 21 7.18 21 3 16.973 3 11.956c0-4.563 3.46-8.31 7.925-8.948a.818.818 0 01.826.404z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6 origin-top text-amber-400 transition-transform duration-200 ease-out"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <Avatar>
                    <AvatarImage
                      src={user?.picture || '/images/default-user-avatar.jpg'}
                    />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="flex w-56 flex-col items-center justify-center py-3"
                  side="bottom"
                  align="end">
                  <Avatar className="mb-3">
                    <AvatarImage
                      src={user?.picture || '/images/default-user-avatar.jpg'}
                    />
                  </Avatar>
                  <h1 className="font-semibold">{user?.name}</h1>
                  <p className="text-xs text-accent-foreground">{user?.email}</p>
                  <DropdownMenuSeparator />
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border border-red-500 text-red-500"
                      size="sm"
                      onClick={() =>
                        logout({
                          logoutParams: {
                            returnTo: hostUrl || 'http://localhost:3000',
                          },
                        })
                      }>
                      <LogOut />
                      Logout
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
