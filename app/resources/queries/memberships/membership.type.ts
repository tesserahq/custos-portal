/**
 * Membership Type
 */

export type MembershipUser = {
  email: string
  username: string
  avatar_url: string
  first_name: string
  last_name: string
  provider: string
  confirmed_at: string
  verified: boolean
  verified_at: string
  service_account: boolean
  id: string
  created_at: string
  updated_at: string
}

export type MembershipType = {
  user_id: string
  role_id: string
  domain: string
  domain_metadata: Record<string, unknown>
  id: string
  created_at: string
  updated_at: string
  user: MembershipUser
}

/**
 * Create membership data
 */
export type CreateMembershipData = {
  user_id: string
  domain?: string
  domain_metadata?: Record<string, unknown>
}
