import { Form, useFormContext } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { roleFormSchema, RoleFormValue } from '@/resources/queries/roles/role.schema'
import { Loader2 } from 'lucide-react'
import { RoleFormData } from '@/resources/queries/roles/role.type'
import { useState, useEffect } from 'react'
import { formValuesToRoleData } from '@/resources/queries/roles/role.utils'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'

interface RoleFormProps {
  defaultValues: RoleFormValue
  onSubmit: (data: RoleFormData) => void | Promise<void>
  submitLabel?: string
}

function RoleFormFields() {
  const { form } = useFormContext()
  const nameValue = form.watch('name')
  const [isAutoGenerating, setIsAutoGenerating] = useState(true)

  // Auto-generate identifier from name when name changes
  useEffect(() => {
    if (isAutoGenerating && nameValue) {
      const generatedIdentifier = nameValue.trim().toLowerCase().replace(/\s+/g, '-')
      form.setValue('identifier', generatedIdentifier, { shouldValidate: false })
    }
  }, [nameValue, isAutoGenerating, form])

  // Handle identifier field changes - transform value and stop auto-generation if manually edited
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoGenerating(false)
    // Transform the value
    const transformedValue = e.target.value.trim().toLowerCase().replace(/\s+/g, '-')
    // Update the event target value so React Hook Form receives the transformed value
    e.target.value = transformedValue
  }

  return (
    <>
      <Form.Input field="name" label="Name" placeholder="Enter role name" autoFocus required />

      <Form.Input
        field="identifier"
        label="Identifier"
        placeholder="Enter role identifier"
        onChange={handleIdentifierChange}
      />
    </>
  )
}

export function RoleForm({ defaultValues, onSubmit, submitLabel = 'Save' }: RoleFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const title = defaultValues?.id ? 'Edit Role' : 'New Role'

  const handleSubmit = async (data: RoleFormValue) => {
    setIsSubmitting(true)

    try {
      const roleListData = formValuesToRoleData(data)
      await onSubmit(roleListData)
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form schema={roleFormSchema} defaultValues={defaultValues} onSubmit={handleSubmit}>
      <FormLayout title={title}>
        <RoleFormFields />

        <Form.Textarea
          field="description"
          label="Description"
          placeholder="Enter role description"
          rows={4}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/roles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </FormLayout>
    </Form>
  )
}
