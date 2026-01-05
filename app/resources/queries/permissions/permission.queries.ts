import { fetchApi } from '@/libraries/fetch'
import { CreatePermissionData, PermissionType, UpdateRoleData } from './permission.type'
import { IQueryConfig } from '..'

const PERMISSIONS_ENDPOINT = '/permissions'
const ROLES_ENDPOINT = '/roles'

/**
 * Get all permissions for a specific role
 */
export async function getRolePermissions(
  config: IQueryConfig,
  roleId: string
): Promise<PermissionType[]> {
  const { apiUrl, token, nodeEnv } = config

  const permissions = await fetchApi(
    `${apiUrl}${ROLES_ENDPOINT}/${roleId}${PERMISSIONS_ENDPOINT}`,
    token,
    nodeEnv,
    {
      method: 'GET',
    }
  )

  return permissions as PermissionType[]
}

/**
 * Create a permission for a specific role
 */
export async function createRolePermission(
  config: IQueryConfig,
  roleId: string,
  data: CreatePermissionData
): Promise<PermissionType> {
  const { apiUrl, token, nodeEnv } = config

  const permission = await fetchApi(
    `${apiUrl}${ROLES_ENDPOINT}/${roleId}${PERMISSIONS_ENDPOINT}`,
    token,
    nodeEnv,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )

  return permission as PermissionType
}

/**
 * Get a single permission by ID
 */
export async function getPermission(config: IQueryConfig, id: string): Promise<PermissionType> {
  const { apiUrl, token, nodeEnv } = config

  const permission = await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return permission as PermissionType
}

/**
 * Update a permission by ID
 */
export async function updatePermission(
  config: IQueryConfig,
  id: string,
  data: UpdateRoleData
): Promise<PermissionType> {
  const { apiUrl, token, nodeEnv } = config

  const permission = await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  return permission as PermissionType
}

/**
 * Delete a permission by ID
 */
export async function deletePermission(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${PERMISSIONS_ENDPOINT}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}
