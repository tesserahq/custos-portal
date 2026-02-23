import { redirect } from 'react-router'

export async function loader({ params }: { params: { userID: string } }) {
  return redirect(`/users/${params.userID}/overview`)
}

export default function UserDetailIndex() {
  return null
}
