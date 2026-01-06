import { Card, CardContent, CardHeader } from '@/modules/shadcn/ui/card'
import { Checkbox } from '@/modules/shadcn/ui/checkbox'
import { Label } from '@/modules/shadcn/ui/label'
import { cn } from '@shadcn/lib/utils'

interface PermissionCardProps {
  object: string
  isChecked: boolean
  hasPermission: (object: string, action: string) => boolean
  onPermissionChange: (object: string, action: string, checked: boolean) => void
  onAllPermissionsChange: (object: string, checked: boolean) => void
  changes?: {
    added: string[]
    removed: string[]
  }
}

const ACTIONS = [
  { key: 'read', label: 'Read' },
  { key: 'create', label: 'Create' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
] as const

export function PermissionCard({
  object,
  isChecked,
  hasPermission,
  onPermissionChange,
  onAllPermissionsChange,
  changes,
}: PermissionCardProps) {
  const handleAllChange = (checked: boolean) => {
    onAllPermissionsChange(object, checked)
  }

  const handleActionChange = (action: string, checked: boolean) => {
    onPermissionChange(object, action, checked)
  }

  const getChangeStatus = (action: string): 'added' | 'removed' | null => {
    if (!changes) return null
    const key = `${object}:${action}`
    if (changes.added.includes(key)) return 'added'
    if (changes.removed.includes(key)) return 'removed'
    return null
  }

  const hasObjectChanges = ACTIONS.some(({ key }) => getChangeStatus(key) !== null)

  return (
    <Card className={cn(hasObjectChanges && 'ring-2 ring-primary/50')}>
      <CardHeader className="py-3 border-b pb-2 mb-3 bg-secondary px-4">
        <div className="flex items-center gap-3 ps-1">
          <Checkbox id={`${object}-all`} checked={isChecked} onCheckedChange={handleAllChange} />
          <Label htmlFor={`${object}-all`} className="mb-0 capitalize text-base font-semibold">
            {object}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        {ACTIONS.map(({ key, label }) => {
          const changeStatus = getChangeStatus(key)
          const isAdded = changeStatus === 'added'
          const isRemoved = changeStatus === 'removed'

          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-3 rounded p-1',
                isAdded && 'bg-green-50 dark:bg-green-950/30',
                isRemoved && 'bg-red-50 dark:bg-red-950/30'
              )}>
              <Checkbox
                id={`${object}-${key}`}
                checked={hasPermission(object, key)}
                onCheckedChange={(checked) => handleActionChange(key, checked === true)}
              />
              <Label htmlFor={`${object}-${key}`} className="mb-0 flex-1">
                {label}
              </Label>
              {isAdded && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+</span>
              )}
              {isRemoved && (
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">-</span>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
