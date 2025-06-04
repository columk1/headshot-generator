'use client';

import { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, Home, LogOut, CircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/(login)/actions'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useUser } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { userPromise } = useUser();
    const user = use(userPromise);
    const router = useRouter();
    const pathname = usePathname();

    const activeLinkClasses = 'underline';
    const getActiveLinkClasses = (linkPath: string) => {
      return linkPath === pathname ? activeLinkClasses : '';
    }

    async function handleSignOut() {
      await signOut();
      router.refresh();
      router.push('/');
    }

    if (!user) {
      return (
        <>
          <Link
            href="/pricing"
            className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${getActiveLinkClasses('/pricing')}`}
          >
            Pricing
          </Link >
          <Button
            asChild
            className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
          >
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </>
      );
    }

    return (
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger className="rounded-full">
          <Avatar className="cursor-pointer">
            <AvatarImage alt={user.email || ''} className="" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              {user.email
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-card">
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/dashboard" className="flex w-full items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu >
    );
  }

  function Header() {
    return (
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              H
            </div>
            <span>HeadshotAI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Suspense fallback={<div className="h-9" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      <Header />
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
    </div>
  );
}
