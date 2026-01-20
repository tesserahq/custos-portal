import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),

  // Home Route
  route('/', 'routes/index.tsx', { id: 'home' }),

  route('setup', 'routes/setup/index.tsx'),

  // Private Routes
  layout('layouts/private.layouts.tsx', [
    route('roles', 'routes/main/roles/layout.tsx', [
      index('routes/main/roles/index.tsx'),
      route('new', 'routes/main/roles/new.tsx'),
      route(':id/edit', 'routes/main/roles/edit.tsx'),
      route(':id', 'routes/main/roles/detail/layout.tsx', [
        index('routes/main/roles/detail/index.tsx'),
        route('overview', 'routes/main/roles/detail/overview.tsx'),
        route('permissions', 'routes/main/roles/detail/permissions.tsx'),
        route('memberships', 'routes/main/roles/detail/memberships.tsx'),
      ]),
    ]),

    route('users', 'routes/main/users/layout.tsx', [
      index('routes/main/users/index.tsx'),
      route(':id', 'routes/main/users/detail/layout.tsx', [
        index('routes/main/users/detail/index.tsx'),
        route('overview', 'routes/main/users/detail/overview.tsx'),
        route('memberships', 'routes/main/users/detail/memberships/index.tsx'),
        route('memberships/:membershipId', 'routes/main/users/detail/memberships/detail.tsx'),
      ]),
    ]),
  ]),

  // Access Denied
  route('access-denies', 'routes/access-denies.tsx'),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),

  // Catch-all route for 404 errors - must be last
  route('*', 'routes/not-found.tsx'),
] as RouteConfig
