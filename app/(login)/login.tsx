'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import type { ActionState } from '@/lib/auth/middleware';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    // @ts-expect-error
    mode === 'signin' ? signIn : signUp,
    { error: '' },
  );

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-muted/30">
      <header className="fixed top-0 pt-2.5 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-0.5 font-bold">
            <Logo title='BizPortraits' className='size-8' />
            <span>BizPortraits</span>
          </Link>
        </div>
      </header>

      <Card className="w-full max-w-md border-border shadow-lg bg-gradient-to-br from-background to-muted/40 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{mode === 'signin'
            ? 'Sign in to your account'
            : 'Create your account'}</CardTitle>
          <CardDescription>{mode === 'signin'
            ? 'Enter your email and password to access your account'
            : 'Enter an email and password to create your account'}</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            <div className="space-y-2">
              <Label htmlFor="email" className="block">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.email?.toString()}
                required
                maxLength={50}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state?.password?.toString()}
                required
                minLength={8}
                maxLength={100}
              />
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm">{state.error}</div>
            )}

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Sign up'
              )}
            </Button>
            <div className="flex gap-2 text-center text-sm">
              {mode === 'signin'
                ? 'New to our platform?'
                : 'Already have an account?'}
              <Link
                href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${redirect ? `?redirect=${redirect}` : ''
                  }${priceId ? `&priceId=${priceId}` : ''}`}
                className="text-primary hover:underline"
              >
                {mode === 'signin'
                  ? 'Create an account'
                  : 'Sign in to existing account'}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card >
    </div >
  );
}
