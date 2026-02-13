import { useLoaderData, useNavigate } from 'react-router'
import { RoleForm } from '@/components/crud-forms/role-form'
import { useCreateRole } from '@/resources/hooks/roles/use-role'
import { useApp } from 'tessera-ui'
import { roleFormDefaultValue } from '@/resources/queries/roles/role.schema'
import { RoleFormData } from '@/resources/queries/roles/role.type'
import { IQueryConfig } from '@/resources/queries'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function NewRole() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { mutateAsync: createRole } = useCreateRole(config, {
    onSuccess: (data) => {
      navigate(`/roles/${data.id}`)
    },
  })

  const handleSubmit = async (data: RoleFormData): Promise<void> => {
    await createRole(data)
  }

  return <RoleForm onSubmit={handleSubmit} defaultValues={roleFormDefaultValue} />
}
