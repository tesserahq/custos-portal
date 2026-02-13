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
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { useServiceAccounts } from '@/resources/hooks/service-accounts/use-service-account'
import { useCreateRoleMembership } from '@/resources/hooks/memberships/use-membership'
import { AppPreloader } from '@/components/loader/pre-loader'
import { NodeENVType } from '@/libraries/fetch'
import { useApp } from 'tessera-ui'
import { Label } from '@/modules/shadcn/ui/label'
import { Input } from '@/modules/shadcn/ui/input'
import { useUsers } from '@/resources/hooks/users/use-user'
import { ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/modules/shadcn/ui/badge'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export interface NewMembershipDialogHandle {
  open: (params: { roleId: string; accountType: 'user' | 'service_account' }) => void
  close: () => void
}

interface NewMembershipDialogProps {
  roleId: string
  custosApiUrl: string
  identiesApiUrl: string
  nodeEnv: NodeENVType
  accountType: 'user' | 'service_account'
}

export const NewMembershipDialog = forwardRef<NewMembershipDialogHandle, NewMembershipDialogProps>(
  function NewMembershipDialog(
    { custosApiUrl, identiesApiUrl, nodeEnv, roleId, accountType }: NewMembershipDialogProps,
    ref
  ) {
    const { token } = useApp()
    const [isOpen, setIsOpen] = useState(false)
    const [currentRoleId, setCurrentRoleId] = useState(roleId)
    const [currentAccountType, setCurrentAccountType] = useState(accountType)
    const [selectedServiceAccountId, setSelectedServiceAccountId] = useState<string>('')
    const [domain, setDomain] = useState<string>('')
    const [q, setQ] = useState<string>('')
    const [isComboboxOpen, setIsComboboxOpen] = useState(false)
    const [page, _] = useState(1)
    const size = 100
    const debouncedQ = useDebouncedValue(q.trim(), 300, { minLength: 3 })

    const isUserMode = currentAccountType === 'user'

    const { data: serviceAccountsData, isLoading: isLoadingServiceAccounts } = useServiceAccounts(
      { apiUrl: identiesApiUrl, token: token!, nodeEnv },
      { page, size },
      { enabled: isOpen && !isUserMode }
    )
    const { data: users, isLoading: isLoadingUsers } = useUsers(
      { apiUrl: identiesApiUrl, token: token!, nodeEnv },
      { page, size, q: isUserMode ? debouncedQ || undefined : undefined },
      { enabled: isOpen && isUserMode, isIdenties: true }
    )

    const { mutateAsync: createMembership, isPending: isCreating } = useCreateRoleMembership(
      { apiUrl: custosApiUrl, token: token!, nodeEnv },
      currentRoleId,
      {
        onSuccess: () => {
          closeDialog()
        },
      }
    )

    const handleSubmit = async () => {
      if (!selectedServiceAccountId) return

      await createMembership({
        user_id: selectedServiceAccountId,
        domain: domain || '*',
      })
    }

    const selectedAccounts = useMemo(
      () => (isUserMode ? users?.items || [] : serviceAccountsData?.items || []),
      [isUserMode, users?.items, serviceAccountsData?.items]
    )

    const accountOptions = useMemo(
      () =>
        selectedAccounts.map((account) => {
          const fullName = `${account.first_name || ''} ${account.last_name || ''}`.trim()
          const searchValue = `${fullName} ${account.email || ''}`.trim()

          return {
            id: account.id,
            value: account.id,
            label: fullName || account.email,
            searchValue,
            data: account,
          }
        }),
      [selectedAccounts]
    )

    const selectedOption = useMemo(
      () => accountOptions.find((option) => option.value === selectedServiceAccountId),
      [accountOptions, selectedServiceAccountId]
    )

    const isLoadingAccounts = isLoadingServiceAccounts || isLoadingUsers
    const isInitialLoading = !debouncedQ && selectedAccounts.length === 0 && isLoadingAccounts
    const isSearchingUsers = isUserMode && !!debouncedQ && isLoadingUsers

    const closeDialog = () => {
      setIsOpen(false)
      setSelectedServiceAccountId('')
      setDomain('')
      setQ('')
      setIsComboboxOpen(false)
    }

    useImperativeHandle(
      ref,
      () => ({
        open: ({ roleId: nextRoleId, accountType: nextAccountType }) => {
          setCurrentRoleId(nextRoleId)
          setCurrentAccountType(nextAccountType)
          setIsOpen(true)
        },
        close: closeDialog,
      }),
      []
    )

    return (
      <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isUserMode ? 'Add User' : 'Bind Service Account'}</DialogTitle>
            <DialogDescription>
              {isUserMode
                ? 'Select a user to add to this role. The user will have all permissions associated with this role.'
                : 'Select a service account to bind to this role. The service account will have all permissions associated with this role.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {isUserMode ? 'User' : 'Service Account'}{' '}
                <span className="text-xs text-red-600">*</span>
              </Label>
              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isComboboxOpen}
                    disabled={isInitialLoading}
                    className="w-full justify-between">
                    {isInitialLoading ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : selectedOption ? (
                      <span>{selectedOption.data?.email || ''}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {isUserMode ? 'Select user account' : 'Select service account'}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    {isUserMode && (
                      <CommandInput placeholder="Search users..." value={q} onValueChange={setQ} />
                    )}
                    <CommandList className="w-[450px]">
                      <CommandEmpty>
                        <div>
                          {isSearchingUsers
                            ? 'Searching...'
                            : isUserMode
                              ? 'No users available'
                              : 'No service accounts available'}
                        </div>
                      </CommandEmpty>
                      {!isSearchingUsers && accountOptions.length > 0 && (
                        <CommandGroup>
                          {accountOptions.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.searchValue || option.label}
                              onSelect={() => {
                                setSelectedServiceAccountId(option.value)
                                setIsComboboxOpen(false)
                              }}
                              className="hover:bg-muted cursor-pointer">
                              <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{option.label}</span>
                                  {!isUserMode && option.data.service_account && (
                                    <Badge
                                      variant="outline"
                                      className="border border-green-500 text-green-600">
                                      <span className="text-[10px]">Service Account</span>
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-xs">
                                  {option.data?.email || ''}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedServiceAccountId || isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)
