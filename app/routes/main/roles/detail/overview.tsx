import DeleteConfirmation from '@/components/delete-confirmation/delete-confirmation'
import { AppPreloader } from '@/components/loader/pre-loader'
import { PageContent } from '@/components/page-content'
import { useApp } from '@/context/AppContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { useDeleteRole, useRole } from '@/resources/hooks/roles/use-role'
import { Button } from '@shadcn/ui/button'
import { format } from 'date-fns'
import { Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id, identiesApiUrl }
}

export default function RoleDetail() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<React.ComponentRef<typeof DeleteConfirmation>>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: role, isLoading } = useRole(config, id)

  const { mutateAsync: deleteRole } = useDeleteRole(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/roles')
    },
  })

  const handleDelete = () => {
    if (!role) return
    deleteConfirmationRef.current?.open({
      title: 'Delete Role',
      description: `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteRole(role.id)
      },
    })
  }

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="animate-slide-up space-y-5">
      <PageContent
        title={role?.name || ''}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="px-0">
                <EllipsisVertical size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="left" className="w-40 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/roles/${params.id}/edit`)}>
                <Edit size={18} />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                  justify-start gap-2"
                onClick={handleDelete}>
                <Trash2 size={18} />
                <span>Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
        <div className="d-list">
          <div className="d-item">
            <dt className="d-label">Name</dt>
            <dd className="d-content">{role?.name || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Identifier</dt>
            <dd className="d-content">{role?.identifier || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Description</dt>
            <dd className="d-content">{role?.description || 'N/A'}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">{format(new Date(role?.created_at + 'z'), 'PPPpp')}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">{format(new Date(role?.updated_at + 'z'), 'PPPpp')}</dd>
          </div>
        </div>
      </PageContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
