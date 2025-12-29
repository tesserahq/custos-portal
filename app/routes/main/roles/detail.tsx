import { useLoaderData, useNavigate, useParams } from 'react-router'
import { useRole, useDeleteRole } from '@/resources/hooks/roles/use-role'
import { useApp } from '@/context/AppContext'
import { Button } from '@shadcn/ui/button'
import { Card, CardHeader, CardContent } from '@/modules/shadcn/ui/card'
import { Popover, PopoverTrigger, PopoverContent } from '@/modules/shadcn/ui/popover'
import { Edit, Trash2, EllipsisVertical } from 'lucide-react'
import { useRef } from 'react'
import DeleteConfirmation from '@/components/delete-confirmation/delete-confirmation'
import { AppPreloader } from '@/components/loader/pre-loader'
import { format } from 'date-fns'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
}

export default function RoleDetail() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const params = useParams()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<React.ComponentRef<typeof DeleteConfirmation>>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data: role, isLoading, error } = useRole(config, id)

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

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  if (error || !role) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Role not found</h2>
          <p className="mt-2 text-muted-foreground">
            {(error as Error)?.message || 'The role you are looking for does not exist.'}
          </p>
          <Button className="mt-4" onClick={() => navigate('/roles')}>
            Back to Roles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-up mx-auto h-full max-w-screen-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold lg:text-3xl">Role Details</h1>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pt-4">
          <div className="d-list">
            <div className="d-item">
              <dt className="d-label">Name</dt>
              <dd className="d-content">{role.name || 'N/A'}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Identifier</dt>
              <dd className="d-content">{role.identifier || 'N/A'}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Description</dt>
              <dd className="d-content">{role.description || 'N/A'}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Created At</dt>
              <dd className="d-content">{format(new Date(role.created_at + 'z'), 'PPPpp')}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Updated At</dt>
              <dd className="d-content">{format(new Date(role.updated_at + 'z'), 'PPPpp')}</dd>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
