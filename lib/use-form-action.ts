'use client'

import { useActionState, useTransition } from 'react'
import type { FormState } from '@/app/actions/listings'

/**
 * Like <form action={...}> but the form is NOT reset after submit, so edit forms keep what the
 * admin typed and show a success message instead of snapping back to the old values.
 */
export function useFormAction(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, undefined)
  const [, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => dispatch(data))
  }
  return { state, onSubmit, pending }
}
