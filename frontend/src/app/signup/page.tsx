'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const { signup } = useAuth();
  const router     = useRouter();
  const [form, setForm] = useState({ username:'', name:'', email:'', password:'', location:'', phone:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signup(form);
      router.push('/account');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally { setLoading(false); }
  };

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#F7F5FF 0%,#E9E4FF 100%)', padding:20 }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:480, padding:48 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🐾</div>
          <h2 style={{ marginBottom:6 }}>Join The Pet Point</h2>
          <p style={{ color:'var(--color-text-muted)', fontSize:14 }}>Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Username*</label>
              <input className="input" placeholder="@petlover" value={form.username} onChange={set('username')} required />
            </div>
            <div>
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Full Name*</label>
              <input className="input" placeholder="Jane Doe" value={form.name} onChange={set('name')} required />
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Email*</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Password*</label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} minLength={8} required />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>City</label>
              <input className="input" placeholder="Toronto" value={form.location} onChange={set('location')} />
            </div>
            <div>
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Phone</label>
              <input className="input" placeholder="416-xxx-xxxx" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          {error && <p style={{ color:'var(--color-error)', fontSize:13 }}>{error}</p>}

          <button type="submit" className="btn btn-accent" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
            {loading ? 'Creating account...' : '🐾 Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, color:'var(--color-text-muted)', fontSize:14 }}>
          Already have an account?&nbsp;
          <Link href="/login" style={{ color:'var(--color-primary)', fontWeight:600 }}>Log in</Link>
        </p>
      </div>
    </section>
  );
}
