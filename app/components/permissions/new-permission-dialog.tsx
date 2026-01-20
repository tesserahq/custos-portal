import { useApp } from '@/context/AppContext'
import { NodeENVType } from '@/libraries/fetch'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@/modules/shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/shadcn/ui/dialog'
import { Input } from '@/modules/shadcn/ui/input'
import { Label } from '@/modules/shadcn/ui/label'
import { useCreateRolePermission } from '@/resources/hooks/permissions/use-permission'
import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface NewPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId: string
  apiUrl: string
  nodeEnv: NodeENVType
}

export function NewPermissionDialog({
  open,
  onOpenChange,
  roleId,
  apiUrl,
  nodeEnv,
}: NewPermissionDialogProps) {
  const { token } = useApp()
  const [resource, setResource] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [actions, setActions] = useState<string[]>([])

  const config = {
    apiUrl: apiUrl!,
    token: token!,
    nodeEnv,
  }
  const { mutateAsync: createRolePermission, isPending: isCreatingPermission } =
    useCreateRolePermission(config, { showToast: false })

  const sanitizePermissionInput = (value: string) => value.replace(/[^a-zA-Z0-9._]/g, '')

  const handleSubmit = async () => {
    if (!resource || actions.length === 0) return

    const newResource = actions.map((action) => ({
      object: resource,
      action,
    }))

    try {
      await Promise.all(
        newResource.map((element) => createRolePermission({ roleId, data: element }))
      )
      onOpenChange(false)
      toast.success('Permission created successfully')
      setResource('')
      setAction('')
      setActions([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create permission', {
        description: message,
      })
    }
  }

  const handleAddActions = () => {
    const isActionExists = actions.find((val) => val === action)

    if (isActionExists) return

    setActions((prev) => [...prev, action]) // add to actions
    setAction('') // clear form action
  }

  const handleRemoveAction = (action: string) => {
    setActions((prev) => prev.filter((val) => val !== action))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Permissions</DialogTitle>
          <DialogDescription>
            Add permissions for a resource object. You can specify multiple actions.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label className="text-sm font-medium">
            Resource Object <span className="text-xs text-red-600">*</span>
          </Label>
          <Input
            value={resource}
            onChange={(e) => setResource(sanitizePermissionInput(e.target.value))}
            placeholder="e.g., user, member_contact, memberships"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">
            Actions <span className="text-xs text-red-600">*</span>
          </Label>
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={action}
              onChange={(e) => setAction(sanitizePermissionInput(e.target.value))}
              placeholder="e.g., create, read, update, delete"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddActions()
                }
              }}
            />
            <Button variant="black" onClick={handleAddActions} disabled={!action}>
              Add
            </Button>
          </div>
          {actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action) => {
                return (
                  <Badge key={action} variant="outline" className="flex items-center gap-1">
                    {action}
                    <div className="cursor-pointer" onClick={() => handleRemoveAction(action)}>
                      <X size={15} />
                    </div>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreatingPermission}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreatingPermission || actions.length === 0 || !resource}>
            {isCreatingPermission ? 'Saving...' : 'Save Permission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
