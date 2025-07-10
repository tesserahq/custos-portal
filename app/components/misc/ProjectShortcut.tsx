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
import { IPropject } from '@/types/project'
import { getWorkspaceID } from '@/libraries/storage'

interface Props {
  apiUrl: string
  hostUrl: string
  nodeEnv: NodeENVType
}

export default function ProjectShortcut({ apiUrl, hostUrl, nodeEnv }: Props) {
  const params = useParams()
  const [project, setProject] = useState<IPropject>()
  const [projects, setProjects] = useState<IPropject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { getAccessTokenSilently, logout } = useAuth0()

  const fetchWorkspaces = async () => {
    try {
      const token = await getAccessTokenSilently()

      // get current workspaceId from localstorage
      const workspaceId = getWorkspaceID()

      const url = `${apiUrl}/workspaces/${workspaceId}/projects`

      const response = await fetchApi(url, token, nodeEnv)

      const currentProject = response.data.find(
        (w: IWorkspace) => w.id === params.project_id,
      )

      setProject(currentProject)
      setProjects(response.data)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        logout({ logoutParams: { returnTo: hostUrl } })
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <b>{isLoading ? 'Loading...' : project?.name || 'Select a project'}</b>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="icon"
            className="h-8 w-8">
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Command>
              <CommandInput placeholder="Find projects" />
              <CommandList>
                <CommandEmpty>No projects found.</CommandEmpty>
                <CommandGroup>
                  {projects.map((prjct: IPropject) => (
                    <CommandItem
                      key={prjct.id}
                      value={prjct.id}
                      className={cn(
                        'cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20',
                        [
                          prjct.id === params.project_id &&
                            'bg-accent text-accent-foreground',
                        ],
                      )}
                      onSelect={(currentValue) => {
                        const project = projects.find((w) => w.id === currentValue)

                        setProject(project)
                        setOpen(false)
                        navigate(`/projects/${currentValue}/home`)
                      }}>
                      <div className="flex w-full items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 uppercase dark:bg-slate-600 dark:text-foreground">
                          {prjct.name.substring(0, 1)}
                        </div>
                        <span className="flex-1">{prjct.name}</span>
                        {prjct.id === params.project_id && <Check />}
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem
                    className="cursor-pointer hover:bg-slate-300/20 dark:hover:bg-navy-300/20"
                    onSelect={() => {
                      navigate(`/workspaces/${params.workspace_id}/projects/new`)
                      setOpen(false)
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <CirclePlus size={20} className="text-primary" />
                      </div>
                      <span>Create new project</span>
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
