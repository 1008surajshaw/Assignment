'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button onClick={() => signOut()}>
        Sign out
      </Button>
    )
  }
  return (
    <Button onClick={() => signIn('google')}>
      Sign in with Google
    </Button>
  )
}