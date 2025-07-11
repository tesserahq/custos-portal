import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/misc'
import { Link, useLocation } from '@remix-run/react'
import MenuToggle from '../MenuToggle'

interface ItemProps {
  title: string
  path: string
  icon: React.ReactNode
}
export interface IMenuItemProps {
  title: string
  path: string
  icon: React.ReactNode
  children?: ItemProps[]
}

interface ISidebarPanelProps {
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
  menuItems: IMenuItemProps[]
}

export default function SidebarPanel({
  isExpanded,
  setIsExpanded,
  menuItems,
}: ISidebarPanelProps) {
  const { pathname } = useLocation()

  const getActiveMenu = (menu: string) => {
    return pathname.includes(menu.split(' ').join('-').toLowerCase())
  }

  return (
    <div className="sidebar-panel bg-peat-50 flex h-full grow flex-col justify-between bg-white dark:bg-sidebar-background">
      <div className="flex w-full flex-col">
        {/* Sidebar Panel Header */}
        <div className="sidebar-header flex items-center justify-between gap-2">
          <Link to="/">
            <div className="flex items-center">
              <Avatar className="avatar">
                <AvatarImage src="/images/logo.png" />
              </Avatar>
              <span className="brand-name">Custos</span>
            </div>
          </Link>
          <div className="mr-2 xl:hidden">
            <MenuToggle onClick={() => setIsExpanded(!isExpanded)} />
          </div>
        </div>

        {/* Sidebar Panel Body */}
        <div className="sidebar-body">
          <div className="is-scrollbar-hidden grow overflow-y-auto">
            <ul className="sidebar-nav mt-5">
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  className={cn(
                    'flex items-center justify-between rounded hover:bg-slate-50 dark:hover:bg-background',
                    (pathname === item.path || getActiveMenu(item.title)) &&
                      'bg-accent hover:bg-accent',
                  )}>
                  <Link
                    to={item.path}
                    className={cn(
                      'w-full',
                      (pathname === item.path || getActiveMenu(item.title)) && 'active',
                    )}>
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Need improve in next issue */}
      {/* <div className="mb-3 ml-3">
        <MenuToggle onClick={() => setIsExpanded(!isExpanded)} />
      </div> */}
    </div>
  )
}
