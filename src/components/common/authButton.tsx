'use client'

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
    return (
      <Button onClick={handleSignOut} disabled={isLoading}>
        {isLoading ? 'Signing out...' : 'Sign out'}
      </Button>
    );
  }

  return (
    <Button onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
}