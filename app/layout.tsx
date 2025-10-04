import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Headshot One - Professional Headshots in seconds",
  description:
    "Transform your photos into professional headshots with our AI-powered platform. Perfect for individuals and teams.",
}

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userPromise = getUser();
  // html {
  //   overflow-x: hidden;
  //   margin-right: calc(-1 * (100vw - 100%));
  // }

  return (
    <html
      lang="en"
      className={`${manrope.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserProvider userPromise={userPromise}>{children}</UserProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
