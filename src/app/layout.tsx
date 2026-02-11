import type { Metadata } from "next";
import "./globals.css";
import "./dropdown-opacity-fix.css";
import "./mobile-positioning-fix.css";
import { Inter, Outfit } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./register/actions";
import { NavBar } from "@/components/nav-bar";
import { MobileFooter } from "@/components/mobile-footer";
import { Toaster } from "@/components/ui/toaster";
import { CurrencyProvider } from "@/lib/currency/currency-context";
import type { UserRole } from "@/lib/types/roles";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AutoLot | Premium Automotive Marketplace",
  description: "Experience the pinnacle of automotive excellence.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user role if authenticated
  let userRole: UserRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    userRole = profile?.role as UserRole || null;
  }

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <CurrencyProvider>
          <NavBar user={user} userRole={userRole} signOut={signOut} />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-border/40 py-12 mt-20">
            <div className="container text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} AUTOLOT. All rights reserved.
              </p>
            </div>
          </footer>
          <MobileFooter />
          <Toaster />
        </CurrencyProvider>
      </body>
    </html>
  );
}
