import { Form, useFormContext } from '@/components/form'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@/modules/shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/modules/shadcn/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shadcn/ui/tooltip'
import { usePermissions } from '@/resources/hooks/permissions/use-permission'
import { usePermissionCheck } from '@/resources/hooks/users/use-user'
import { IQueryConfig } from '@/resources/queries'
import { PermissionCheckResponse } from '@/resources/queries/users/user.type'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'

type PermissionCheckFormValues = {
  resource: string
  action: string
  domain: string
}

type PermissionCheckProps = {
  config: IQueryConfig
  userId: string
}

type PermissionCheckDialogProps = PermissionCheckProps & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  triggerLabel?: string
}

const permissionCheckSchema = z.object({
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  domain: z.string().min(1, 'Domain is required'),
})

const parsePermissionValue = (value: string) => {
  const trimmedValue = value.trim()
  const lastDotIndex = trimmedValue.lastIndexOf('.')

  if (lastDotIndex === -1) {
    return { resource: trimmedValue, action: '' }
  }

  return {
    resource: trimmedValue.slice(0, lastDotIndex),
    action: trimmedValue.slice(lastDotIndex + 1),
  }
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { error?: string }
      return parsed?.error || error.message
    } catch {
      return error.message
    }
  }

  return 'Something went wrong while checking permission.'
}

function PermissionCheckFields({
  options,
  isLoading,
  searchValue,
  onSearchChange,
  onActionChange,
  actionLocked,
  setActionLocked,
}: {
  options: { label: string; value: string; searchValue?: string }[]
  isLoading: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onActionChange: (value: string) => void
  actionLocked: boolean
  setActionLocked: (value: boolean) => void
}) {
  const { form } = useFormContext()
  const selectedResource = form.watch('resource')

  useEffect(() => {
    if (!selectedResource) {
      return
    }

    const { action } = parsePermissionValue(selectedResource)
    const currentAction = form.getValues('action')

    if (action && (!actionLocked || !currentAction)) {
      form.setValue('action', action, { shouldValidate: true })
      if (!currentAction) {
        setActionLocked(false)
      }
    }
  }, [selectedResource, actionLocked, form, setActionLocked])

  return (
    <div className="space-y-3">
      <Form.Command
        field="resource"
        label="Resource"
        required
        placeholder="Select permission resource"
        searchPlaceholder="Search permissions..."
        emptyText="No permissions found."
        options={options}
        isLoading={isLoading}
        searchValue={searchValue}
        onSearchChange={(value) => {
          onSearchChange(value || '')
        }}
      />

      <Form.Input
        field="action"
        label="Action"
        required
        placeholder="read"
        onChange={(event) => {
          const value = event.target.value
          const hasValue = value.trim().length > 0
          setActionLocked(hasValue)
          onActionChange(value)
        }}
      />

      <Form.Input field="domain" label="Domain" required placeholder="*" />
    </div>
  )
}

function PermissionCheckContent({ config, userId }: PermissionCheckProps) {
  const [searchValue, setSearchValue] = useState('')
  const [actionLocked, setActionLocked] = useState(false)
  const [result, setResult] = useState<PermissionCheckResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const debouncedSearchValue = useDebouncedValue(searchValue.trim(), 400, { minLength: 2 })

  const {
    data: permissions,
    isLoading: isPermissionsLoading,
    isFetching: isPermissionsFetching,
    error: permissionsError,
  } = usePermissions(
    config,
    {
      page: 1,
      size: 100,
      q: debouncedSearchValue,
    },
    { enabled: !!config.token }
  )

  const permissionOptions = useMemo(() => {
    return (permissions?.items ?? []).map((permission) => {
      return {
        label: `${permission.object}.${permission.action}`,
        value: `${permission.object}.${permission.action}`,
        searchValue: `${permission.object}.${permission.action}`,
      }
    })
  }, [permissions])

  const { mutateAsync: checkPermission, isPending } = usePermissionCheck(config)

  const handleSubmit = async (values: PermissionCheckFormValues) => {
    setErrorMessage(null)
    setResult(null)

    const parsed = parsePermissionValue(values.resource)
    const payload = {
      resource: parsed.resource || values.resource,
      action: values.action || parsed.action,
      domain: values.domain || '*',
    }

    try {
      const response = await checkPermission({ userId, data: payload })
      setResult(response)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-4">
      <Form
        schema={permissionCheckSchema}
        defaultValues={{
          resource: '',
          action: '',
          domain: '*',
        }}
        onSubmit={handleSubmit}
        mode="onSubmit">
        <div className="space-y-4">
          <PermissionCheckFields
            options={permissionOptions}
            isLoading={isPermissionsLoading || isPermissionsFetching}
            searchValue={searchValue}
            onSearchChange={(value) => {
              setSearchValue(value || '')
            }}
            onActionChange={(value) => {
              if (!value.trim()) {
                setActionLocked(false)
              }
            }}
            actionLocked={actionLocked}
            setActionLocked={setActionLocked}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {permissionsError && 'Failed to load permissions list.'}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Permission'
              )}
            </Button>
          </div>
        </div>
      </Form>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {result && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
          <h2 className="font-semibold text-base mb-2 text-slate-700">Result</h2>
          <div className="mt-2 text-xs text-slate-600">
            <div className="d-list">
              <div className="d-item">
                <dt className="d-label">Status</dt>
                <dd className="d-content">
                  {result.allowed ? (
                    <Badge variant="outline" className="border border-green-500 text-green-600">
                      Allowed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border border-red-500 text-red-600">
                      Denied
                    </Badge>
                  )}
                </dd>
              </div>
              <div className="d-item">
                <dt className="d-label">Resource</dt>
                <dd className="d-content">{result.resource}</dd>
              </div>
              <div className="d-item">
                <dt className="d-label">Action</dt>
                <dd className="d-content">{result.action}</dd>
              </div>
              <div className="d-item">
                <dt className="d-label">Domain</dt>
                <dd className="d-content">
                  {result.domain.length > 8 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>{result.domain.slice(0, 8) || 'N/A'}</TooltipTrigger>
                        <TooltipContent align="start">{result.domain}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span>{result.domain}</span>
                  )}
                </dd>
              </div>
              <div className="d-item">
                <dt className="d-label">Reason</dt>
                <dd className="d-content">{result.reason || 'N/A'}</dd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function UserPermissionCheckDialog({
  config,
  userId,
  open,
  onOpenChange,
  trigger,
  triggerLabel = 'Check Permission',
}: PermissionCheckDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger ?? <Button>{triggerLabel}</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permission Check</DialogTitle>
          <DialogDescription>
            Verify if the selected user can perform a specific action.
          </DialogDescription>
        </DialogHeader>
        <PermissionCheckContent config={config} userId={userId} />
      </DialogContent>
    </Dialog>
  )
}
