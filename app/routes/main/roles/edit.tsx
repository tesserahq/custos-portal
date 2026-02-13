import { useLoaderData, useNavigate } from 'react-router'
import { RoleForm } from '@/components/crud-forms/role-form'
import { useRole, useUpdateRole } from '@/resources/hooks/roles/use-role'
import { useApp } from 'tessera-ui'
import { Button } from '@shadcn/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AppPreloader } from '@/components/loader/pre-loader'
import { RoleFormData } from '@/resources/queries/roles/role.type'
import { roleToFormValues } from '@/resources/queries/roles/role.utils'

export async function loader({ params }: { params: { id: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.id }
}

export default function EditRole() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const {
    data: role,
    isLoading,
    error,
  } = useRole(config, id, { enabled: !!token && !isLoadingIdenties })

  const { mutateAsync: updateRole, isPending } = useUpdateRole(config, {
    onSuccess: (data) => {
      navigate(`/roles/${data.id}`)
    },
  })

  const handleSubmit = async (data: RoleFormData) => {
    await updateRole({ id, data })
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

  const defaultValues = roleToFormValues(role)

  return <RoleForm defaultValues={defaultValues} onSubmit={handleSubmit} />
}
