import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/shadcn/ui/dialog'
import { Button } from '@shadcn/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/modules/shadcn/ui/command'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useApp } from '@/context/AppContext'
import { useRoles } from '@/resources/hooks/roles/use-role'
import { NodeENVType } from '@/libraries/fetch'
import { RoleType } from '@/resources/queries/roles/role.type'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Check } from 'lucide-react'
import { cn } from '@/modules/shadcn/lib/utils'

export interface AssignRoleUserDialogHandle {
  open: (params: { userId: string; selectedRoleIds?: string[] }) => void
  close: () => void
}

interface AssignRoleUserDialogProps {
  apiUrl: string
  nodeEnv: NodeENVType
  onConfirm?: (params: {
    userId: string
    roleIds: string[]
    roles: RoleType[]
  }) => void | Promise<void>
}

export const AssignRoleUserDialog = forwardRef<
  AssignRoleUserDialogHandle,
  AssignRoleUserDialogProps
>(function AssignRoleUserDialog({ apiUrl, nodeEnv, onConfirm }, ref) {
  const { token } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [existingRoleIds, setExistingRoleIds] = useState<string[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles(
    { apiUrl, token: token!, nodeEnv },
    { page: 1, size: 100 },
    { enabled: isOpen }
  )

  const roles = rolesData?.items || []
  const availableRoles = useMemo(
    () => roles.filter((role) => !existingRoleIds.includes(role.id)),
    [roles, existingRoleIds]
  )

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds]
  )

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const closeDialog = () => {
    setIsOpen(false)
    setCurrentUserId('')
    setExistingRoleIds([])
    setSelectedRoleIds([])
    setSearchValue('')
    setIsSaving(false)
  }

  const handleSave = async () => {
    if (!currentUserId || selectedRoleIds.length === 0) return

    if (!onConfirm) {
      closeDialog()
      return
    }

    setIsSaving(true)
    await onConfirm({ userId: currentUserId, roleIds: selectedRoleIds, roles: selectedRoles })
    closeDialog()
  }

  const handleOpen = (params: { userId: string; selectedRoleIds?: string[] }) => {
    setCurrentUserId(params.userId)
    setExistingRoleIds(params.selectedRoleIds || [])
    setSelectedRoleIds([])
    setIsOpen(true)
  }

  useImperativeHandle(
    ref,
    () => ({
      open: handleOpen,
      close: closeDialog,
    }),
    []
  )

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Assign Roles</DialogTitle>
          <DialogDescription>Select one or more roles to assign to this user.</DialogDescription>
        </DialogHeader>

        {isLoadingRoles ? (
          <div className="py-8">
            <AppPreloader />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map((role) => (
                  <Badge key={role.id} variant="outline" className="text-xs">
                    {role.name}
                  </Badge>
                ))}
              </div>
            )}

            <Command shouldFilter>
              <CommandInput
                placeholder="Search roles..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>No unassigned roles available.</CommandEmpty>
                <CommandGroup>
                  {availableRoles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id)
                    return (
                      <CommandItem
                        key={role.id}
                        value={`${role.name} ${role.identifier}`}
                        onSelect={() => toggleRole(role.id)}
                        className={cn(
                          'hover:bg-muted cursor-pointer flex items-center justify-between',
                          isSelected && 'bg-muted'
                        )}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-muted-foreground text-xs">{role.identifier}</span>
                        </div>
                        <Check
                          className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        <DialogFooter className="mt-5">
          <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedRoleIds.length === 0 || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
