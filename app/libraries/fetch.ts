/* eslint-disable @typescript-eslint/no-explicit-any */
import { CurlGenerator } from 'curl-generator'

export type NodeENVType = 'test' | 'development' | 'staging' | 'production'

export const fetchApi = async (
  endpoint: string,
  token: string,
  node_env: NodeENVType,
  options: RequestInit = {},
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers: any = { 'Content-Type': 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  }

  if (node_env === 'development') {
    const params: any = {
      url: endpoint,
      method: options.method || 'GET',
      ...config,
    }

    const curlSnippet = CurlGenerator(params)
    // eslint-disable-next-line no-console
    console.log(curlSnippet)
  }

  const response = await fetch(`${endpoint}`, config)

  const json = await response.json()

  if (response.status >= 400) {
    throw new Error(
      JSON.stringify({
        status: response.status,
        error: json?.detail
          ? json.detail
            ? json.detail
            : json?.detail[0]?.msg
          : response.statusText,
      }),
    )
  }

  return json
}
