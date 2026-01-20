/**
 * User Type
 */
export type UserType = {
  email: string
  username: string
  avatar_url: string
  first_name: string
  last_name: string
  provider: string
  confirmed_at: string
  verified: boolean
  verified_at: string
  theme_preference: 'light' | 'dark' | 'system'
  service_account?: boolean
  id: string
  created_at: string
  updated_at: string
}
