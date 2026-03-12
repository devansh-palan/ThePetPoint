'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login }    = useAuth();
  const router       = useRouter();
  const [expectedRole, setExpectedRole] = useState<'user'|'vendor'|'admin'>('user');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password, expectedRole);
      // Need to re-trigger auth context fetch or reload
      window.location.href = expectedRole === 'admin' ? '/admin/dashboard' : expectedRole === 'vendor' ? '/vendor/dashboard' : '/account';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleTestLogin = (role: 'user'|'vendor'|'admin') => {
    setExpectedRole(role);
    if (role === 'user') setEmail('jane@example.com');
    if (role === 'vendor') setEmail('vendor1@example.com');
    if (role === 'admin') setEmail('admin@thepetpoint.ca');
    setPassword('password123');
  };

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#F7F5FF 0%,#E9E4FF 100%)', padding:20 }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:440, padding:48 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>
            {expectedRole === 'admin' ? '🛡️' : expectedRole === 'vendor' ? '🏪' : '🐾'}
          </div>
          <h2 style={{ marginBottom:6 }}>{expectedRole === 'admin' ? 'Admin Portal' : expectedRole === 'vendor' ? 'Vendor Portal' : 'Welcome back'}</h2>
          <p style={{ color:'var(--color-text-muted)', fontSize:14 }}>Log in to The Pet Point</p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', background: 'var(--color-surface)', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
          {(['user', 'vendor', 'admin'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => { setExpectedRole(r); setError(''); setEmail(''); setPassword(''); }}
              style={{
                flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: expectedRole === r ? 'var(--color-bg)' : 'transparent',
                color: expectedRole === r ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: expectedRole === r ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:14, marginBottom:6 }}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:14, marginBottom:6 }}>Password</label>
            <input className="input" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color:'var(--color-error)', fontSize:13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, color:'var(--color-text-muted)', fontSize:14 }}>
          Don&apos;t have an account?&nbsp;
          <Link href="/signup" style={{ color:'var(--color-primary)', fontWeight:600 }}>Sign up</Link>
        </p>
      </div>
    </section>
  );
}
