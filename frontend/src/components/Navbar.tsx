'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = !user ? [
    { href: '/services',   label: 'Find Services' },
    { href: '/community',  label: 'Community' },
    { href: '/events',     label: 'Events' },
  ] : user.role === 'admin' ? [
    { href: '/admin/dashboard',  label: 'Validate Vendors' },
    { href: '/admin/bookings',   label: 'All Bookings' },
    { href: '/admin/events',     label: 'Manage Events' },
    { href: '/community',        label: 'Community' },
  ] : user.role === 'vendor' ? [
    { href: '/vendor/dashboard', label: 'Bookings' },
    { href: '/community',        label: 'Community' },
    { href: '/events',           label: 'Events' },
    { href: '/events/new',       label: 'Add Event' },
  ] : [
    { href: '/services',   label: 'Find Services' },
    { href: '/community',  label: 'Community' },
    { href: '/events',     label: 'Events' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }}>
      <div className="container" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontSize: 32, filter: 'drop-shadow(0 4px 8px rgba(255,183,3,0.3))' }}>🐾</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>The Pet Point</span>
        </Link>

        {/* Desktop links */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 40 }} className="desktop-nav">
          <Link
              href="/"
              style={{
                fontWeight: 600, fontSize: 15,
                color: pathname === '/' ? 'var(--color-primary)' : 'var(--color-text)',
                transition: 'color 150ms',
              }}
          >
            Home
          </Link>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontWeight: 600, fontSize: 15,
                color: pathname === link.href ? 'var(--color-primary)' : 'var(--color-text)',
                transition: 'color 150ms',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link 
                    href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'vendor' ? '/vendor/dashboard' : '/account'} 
                    className="btn btn-primary"
                    style={{ borderRadius: 'var(--radius-pill)', padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600 }}
                  >
                    {user.role === 'admin' ? '🛡️ Admin' : user.role === 'vendor' ? '🏪 Vendor Dash' : `@${user.username}`}
                  </Link>
                  <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 15, marginRight: 8, textDecoration: 'none' }}>Log in</Link>
                  <Link href="/signup" style={{ background: 'var(--color-accent)', color: '#333', padding: '10px 28px', borderRadius: 'var(--radius-pill)', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(255,183,3,0.3)' }}>Sign Up</Link>
                </>
              )}
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{ display: 'none', flexDirection: 'column', gap: 5, padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
            className="hamburger"
          >
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 80, left: 0, right: 0,
          background: '#fff', padding: 20,
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 8px 24px rgba(107,78,255,0.12)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontWeight: 600, padding: '10px 16px', borderRadius: 'var(--radius-md)', color: 'var(--color-text)' }}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link 
                href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'vendor' ? '/vendor/dashboard' : '/account'} 
                onClick={() => setMenuOpen(false)} 
                className="btn btn-outline" 
                style={{ display:'flex', justifyContent:'center' }}
              >
                {user.role === 'admin' ? '🛡️ Admin Dashboard' : user.role === 'vendor' ? '🏪 Vendor Dashboard' : `@${user.username}`}
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-sm" style={{ color: 'var(--color-text-muted)' }}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/login"              className="btn btn-outline" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/list-your-service"  className="btn btn-accent"  onClick={() => setMenuOpen(false)}>List Your Service</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger    { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
