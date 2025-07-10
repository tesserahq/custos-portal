/* eslint-disable @typescript-eslint/no-explicit-any */
import { Check, ChevronsUpDown, CirclePlus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { useNavigate, useParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { IWorkspace } from '@/types/workspace'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { toast } from 'sonner'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { getWorkspaceID } from '@/libraries/storage'

interface Props {
  apiUrl: string
  hostUrl: string
  nodeEnv: NodeENVType
}

export default function WorkspaceShortcut({ apiUrl, hostUrl, nodeEnv }: Props) {
  const params = useParams()
  const [workspace, setWorkspace] = useState<IWorkspace>()
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { getAccessTokenSilently, logout } = useAuth0()

  const fetchWorkspaces = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(`${apiUrl}/workspaces`, token, nodeEnv)

      const workspaceId = params.workspace_id || getWorkspaceID()

      const currentWorkspace = response.data.find((w: IWorkspace) => w.id === workspaceId)

      // setWorkspaceID(currentWorkspace.id) // save to localStorage

      setWorkspace(currentWorkspace)
      setWorkspaces(response.data)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        logout({ logoutParams: { returnTo: hostUrl } })
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  const isWorkspaceActive = (workspaceId: string) => {
    return (
      workspaceId === params.workspace_id ||
      (params.project_id && workspaceId === workspace?.id)
    )
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <b>{isLoading ? 'Loading...' : workspace?.name || 'Select a workspace'}</b>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            size="icon"
            aria-expanded={open}
            className="h-8 w-8">
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Command>
              <CommandInput placeholder="Find workspaces" />
              <CommandList>
                <CommandEmpty>No workspaces found.</CommandEmpty>
                <CommandGroup>
                  {workspaces.map((wrkspace: IWorkspace) => (
                    <CommandItem
                      key={wrkspace.id}
                      value={wrkspace.id}
                      className={cn(
                        'cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20',
                        [
                          isWorkspaceActive(wrkspace.id) &&
                            'bg-accent text-accent-foreground',
                        ],
                      )}
                      onSelect={(currentValue) => {
                        const workspace = workspaces.find((w) => w.id === currentValue)

                        setWorkspace(workspace)
                        setOpen(false)
                        // setWorkspaceID(currentValue) // save to localStorage
                        navigate(`/workspaces/${currentValue}/home`, {
                          state: { workspaceId: currentValue },
                        })
                      }}>
                      <div className="flex w-full items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 uppercase dark:bg-slate-600 dark:text-foreground">
                          {wrkspace.name.substring(0, 1)}
                        </div>
                        <span className="flex-1">{wrkspace.name}</span>
                        {isWorkspaceActive(wrkspace.id) && <Check />}
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem
                    className="cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20"
                    onSelect={() => {
                      navigate(`/workspaces/new`)
                      setOpen(false)
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <CirclePlus size={20} className="text-primary" />
                      </div>
                      <span>Create new workspace</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
