import { redirect } from 'react-router'

export async function loader({ params }: { params: { id: string } }) {
  return redirect(`/roles/${params.id}/overview`)
}

export default function RoleDetailIndex() {
  return null
}
