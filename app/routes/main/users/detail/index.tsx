import { redirect } from 'react-router'

export async function loader({ params }: { params: { id: string } }) {
  return redirect(`/users/${params.id}/overview`)
}

export default function UserDetailIndex() {
  return null
}
