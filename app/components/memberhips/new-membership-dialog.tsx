import { useEffect, useMemo, useState } from 'react'
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
import { useApp } from '@/context/AppContext'
import { Label } from '@/modules/shadcn/ui/label'
import { Input } from '@/modules/shadcn/ui/input'
import { useUsers } from '@/resources/hooks/users/use-user'
import { ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/modules/shadcn/ui/badge'

interface NewMembershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId: string
  custosApiUrl: string
  identiesApiUrl: string
  nodeEnv: NodeENVType
}

export function NewMembershipDialog({
  open,
  onOpenChange,
  custosApiUrl,
  identiesApiUrl,
  nodeEnv,
  roleId,
}: NewMembershipDialogProps) {
  const { token } = useApp()
  const [selectedServiceAccountId, setSelectedServiceAccountId] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [q, setQ] = useState<string>('')
  const [debouncedQ, setDebouncedQ] = useState<string>('')
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const [page, _] = useState(1)
  const size = 100

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQ(q.trim())
    }, 300)

    return () => clearTimeout(timeout)
  }, [q])

  const { data: serviceAccountsData, isLoading: isLoadingServiceAccounts } = useServiceAccounts(
    { apiUrl: identiesApiUrl, token: token!, nodeEnv },
    { page, size },
    { enabled: open }
  )
  const { data: users, isLoading: isLoadingUsers } = useUsers(
    { apiUrl: custosApiUrl, token: token!, nodeEnv },
    { page, size, q: debouncedQ || undefined },
    { enabled: open }
  )

  const { mutateAsync: createMembership, isPending: isCreating } = useCreateRoleMembership(
    { apiUrl: custosApiUrl, token: token!, nodeEnv },
    roleId,
    {
      onSuccess: () => {
        setSelectedServiceAccountId('')
        onOpenChange(false)
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

  const combinedAccounts = useMemo(() => {
    const items = [...(serviceAccountsData?.items || []), ...(users?.items || [])]
    const unique = new Map<string, (typeof items)[number]>()
    items.forEach((item) => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item)
      }
    })
    return Array.from(unique.values())
  }, [serviceAccountsData?.items, users?.items])

  const accountOptions = useMemo(
    () =>
      combinedAccounts.map((account) => {
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
    [combinedAccounts]
  )

  const selectedOption = useMemo(
    () => accountOptions.find((option) => option.value === selectedServiceAccountId),
    [accountOptions, selectedServiceAccountId]
  )

  const isLoadingAccounts = isLoadingServiceAccounts || isLoadingUsers
  const isInitialLoading = !debouncedQ && combinedAccounts.length === 0 && isLoadingAccounts
  const isSearchingUsers = !!debouncedQ && isLoadingUsers

  const onClose = () => {
    if (onOpenChange) onOpenChange(false)

    setSelectedServiceAccountId('')
    setDomain('')
    setQ('')
    setDebouncedQ('')
    setIsComboboxOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Select a user to add to this role. The user will have all permissions associated with
            this role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              User <span className="text-xs text-red-600">*</span>
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
                    <span className="text-muted-foreground">Select user account</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search users..." value={q} onValueChange={setQ} />
                  <CommandList className="w-[450px]">
                    <CommandEmpty>
                      <div>
                        {isSearchingUsers ? 'Searching...' : 'No service accounts available'}
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
                                {option.data.service_account && (
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
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
