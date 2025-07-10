import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/misc'
import { Link, useLocation } from '@remix-run/react'
import { IMenuItemProps } from './SidebarPanel'
// import MenuToggle from '../MenuToggle'

interface ISidebarPanelProps {
  menuItems: IMenuItemProps[]
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}

export default function SidebarPanelMin({
  menuItems,
  // isExpanded,
  // setIsExpanded,
}: ISidebarPanelProps) {
  const { pathname } = useLocation()

  const getActiveMenu = (menu: string) => {
    return pathname.includes(menu.split(' ').join('-').toLowerCase())
  }

  return (
    <div className="sidebar-panel-min">
      <div className="flex h-full flex-col items-center bg-white dark:bg-sidebar-background">
        {/* Sidebar Panel Min Header */}
        <div className="flex h-[43px] shrink-0 items-center justify-center pt-3">
          <Link to="/">
            <Avatar className="avatar size-8">
              <AvatarImage src="/images/logo.png" />
            </Avatar>
          </Link>
        </div>

        {/* Sidebar Panel Min Body */}
        <div className="flex h-[calc(100%-4.5rem)] grow flex-col">
          <div className="is-scrollbar-hidden">
            <ul className={cn('sidebar-nav mt-4 space-y-1')}>
              {menuItems.map((item) => (
                <li key={item.title}>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            '',
                            (pathname === item.path || getActiveMenu(item.title)) &&
                              'active',
                          )}>
                          {item.icon}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Need improve in next issue */}
        {/* <div className="mb-3">
          <MenuToggle onClick={() => setIsExpanded(!isExpanded)} />
        </div> */}
      </div>
    </div>
  )
}
