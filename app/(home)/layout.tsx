"use client";

import { Suspense, use, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, UserCog, Shield, Activity, Menu, Home, LogOut, CircleIcon, Sun, Moon, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/(login)/actions'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useUser } from '@/lib/auth';
import { Logo } from '@/components/ui/logo';

// Shared UserMenu component that displays different content based on authentication status
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
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Log in
        </Link>
        <Button className="rounded-full">
          <Link href="/sign-up">Get Started</Link>
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </>
    );
  }

  return (
    <>
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
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/account" className="flex w-full items-center">
              <UserCog className="mr-2 h-4 w-4" />
              <span>Account</span>
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
    </>
  );
}

// Shared Header component with the UserMenu
function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Only show navigation on the homepage
  const showNavigation = pathname === '/';

  return (
    <header
      className={`sticky top-0 pt-2 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"} border-b border-border`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-1 font-bold">
          <Logo title='BizPortraits' className='size-8' />
          <span>BizPortraits</span>
        </Link>

        {showNavigation && (
          <nav className="hidden md:flex gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {resolvedTheme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
          {showNavigation && (
            <div className="flex items-center gap-4 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {showNavigation && mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b">
          <div className="container py-4 flex flex-col gap-4">
            <Link href="#features" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </Link>
            <Link href="#products" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link href="#testimonials" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Testimonials
            </Link>
            <Link href="#faq" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-background/95 backdrop-blur-sm">
      <div className="container flex flex-col gap-8 px-4 py-8 md:px-6 lg:py-12 m-auto">
        <div className="flex flex-col items-center gap-4 border-t border-border/40 pt-8">
          <ul className="flex gap-4 text-xs">
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} BizPortraits. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)]">
      <Header />
      {/* Main content */}
      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
      <Footer />
    </div>
  );
}
