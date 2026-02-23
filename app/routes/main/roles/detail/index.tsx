import { redirect } from 'react-router'

export async function loader({ params }: { params: { roleID: string } }) {
  return redirect(`/roles/${params.roleID}/overview`)
}

export default function RoleDetailIndex() {
  return null
}
