'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/lib/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background shadow-sm">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href={isAuthenticated ? "/account/discover" : "/"} className="text-xl font-bold text-primary">
            DTA
          </Link>
          {isAuthenticated && (
            <div className="hidden md:flex items-center justify-center space-x-4 flex-grow">
              <Link href="/account/discover" className="text-foreground hover:text-primary">Discover</Link>
              <Link href="/account/messages" className="text-foreground hover:text-primary">Messages</Link>
              <Link href="/account/refer" className="text-foreground hover:text-primary">Refer</Link>
              <Link href="/account/settings" className="text-foreground hover:text-primary">Settings</Link>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <ModeToggle />
            {isAuthenticated ? (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/account/login">Login</Link>
              </Button>
            )}
          </div>
          {isAuthenticated && (
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/account/discover" className="block text-foreground hover:text-primary">Discover</Link>
            <Link href="/account/messages" className="block text-foreground hover:text-primary">Messages</Link>
            <Link href="/account/refer" className="block text-foreground hover:text-primary">Refer</Link>
            <Link href="/account/settings" className="block text-foreground hover:text-primary">Settings</Link>
          </div>
        )}
      </nav>
    </header>
  );
}