import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { fontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'ESOCS Ordination Portal | Holy Order Apex Directorate',
  description: 'Enterprise canonical ordination management, vetting, investiture passes, and anti-forgery credential system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full dark ${fontVariables}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-[#F9FAFB] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 antialiased selection:bg-gold-500/20 selection:text-gold-900 dark:selection:text-gold-200 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
