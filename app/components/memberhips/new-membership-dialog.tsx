import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/shadcn/ui/dialog'
import { Button } from '@shadcn/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/modules/shadcn/ui/select'
import { useServiceAccounts } from '@/resources/hooks/service-accounts/use-service-account'
import { useCreateRoleMembership } from '@/resources/hooks/memberships/use-membership'
import { AppPreloader } from '@/components/loader/pre-loader'
import { NodeENVType } from '@/libraries/fetch'
import { useApp } from '@/context/AppContext'
import { Label } from '@/modules/shadcn/ui/label'
import { Input } from '@/modules/shadcn/ui/input'

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
  const [page, _] = useState(1)
  const size = 100

  const { data: serviceAccountsData, isLoading: isLoadingServiceAccounts } = useServiceAccounts(
    { apiUrl: identiesApiUrl, token: token!, nodeEnv },
    { page, size },
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

  const serviceAccounts = serviceAccountsData?.items || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bind Service Account</DialogTitle>
          <DialogDescription>
            Select a service account to bind to this role. The service account will have all
            permissions associated with this role.
          </DialogDescription>
        </DialogHeader>

        {isLoadingServiceAccounts ? (
          <div className="py-8">
            <AppPreloader />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Service Account <span className="text-xs text-red-600">*</span>
              </Label>
              <Select value={selectedServiceAccountId} onValueChange={setSelectedServiceAccountId}>
                <SelectTrigger>
                  {serviceAccounts.find((val) => val.id === selectedServiceAccountId)?.email ||
                    'Select a service account'}
                </SelectTrigger>
                <SelectContent>
                  {serviceAccounts.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No service accounts available
                    </div>
                  ) : (
                    serviceAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {account.first_name} {account.last_name}
                          </span>
                          <span className="text-muted-foreground">{account.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedServiceAccountId || isCreating}>
            {isCreating ? 'Binding...' : 'Bind Service Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
