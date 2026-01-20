/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import { MembershipType } from '@/resources/queries/memberships/membership.type'
import { getUser, getUserMemberships, getUsers } from '@/resources/queries/users/user.queries'
import { UserType } from '@/resources/queries/users/user.type'
import { useQuery } from '@tanstack/react-query'

/**
 * Custom error class for query errors
 */
class QueryError extends Error {
  code?: string
  details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'QueryError'
    this.code = code
    this.details = details
  }
}

/**
 * User query keys for React Query caching
 */
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...userQueryKeys.lists(), config, params] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  memberships: () => [...userQueryKeys.all, 'memberships'] as const,
  membershipList: (id: string, config: IQueryConfig, params: IQueryParams) =>
    [...userQueryKeys.memberships(), id, config, params] as const,
}

/**
 * Hook for fetching paginated users
 * @param config - User query configuration
 * @param params - User query parameters
 * @param options - User query options
 */
export function useUsers(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: userQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        return await getUsers(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
  })
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: async () => {
      try {
        return await getUser(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!id,
  })
}

/**
 * Hook for fetching paginated memberships for a user
 * @param config - User query configuration
 * @param userId - User ID to fetch memberships for
 * @param params - Membership query parameters
 * @param options - Membership query options
 */
export function useUserMemberships(
  config: IQueryConfig,
  userId: string,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  if (!config.token) {
    throw new QueryError('Token is required', 'TOKEN_REQUIRED')
  }

  return useQuery({
    queryKey: userQueryKeys.membershipList(userId, config, params),
    queryFn: async () => {
      try {
        return await getUserMemberships(config, userId, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!userId,
  })
}
