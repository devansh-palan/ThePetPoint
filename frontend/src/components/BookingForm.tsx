'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Pet { id: string; name: string; breed: string; }
interface Props { vendorId: string; onClose: () => void; }

export default function BookingForm({ vendorId, onClose }: Props) {
  const { user } = useAuth();
  const [pets, setPets]       = useState<Pet[]>([]);
  const [form, setForm]       = useState({ pet_id:'', requested_date:'', requested_time:'', message:'' });
  const [status, setStatus]   = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (user) api.pets.list().then(d => setPets(d as Pet[])).catch(() => {});
  }, [user]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      await api.bookings.create({ vendor_id: vendorId, ...form });
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed');
      setStatus('error');
    }
  };

  // Today's date as min
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:480, padding:40 }} onClick={e => e.stopPropagation()}>
        {status === 'success' ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <h3 style={{ marginBottom:8 }}>Booking Request Sent!</h3>
            <p style={{ color:'var(--color-text-muted)', marginBottom:24 }}>
              The vendor will review your request and get in touch. Check your account for updates.
            </p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3>Request Appointment</h3>
              <button onClick={onClose} style={{ fontSize:20, color:'var(--color-text-muted)', lineHeight:1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Select Pet*</label>
                {pets.length === 0 ? (
                  <p style={{ fontSize:13, color:'var(--color-error)' }}>
                    No pets found. <a href="/account" style={{ color:'var(--color-primary)', fontWeight:600 }}>Add a pet first →</a>
                  </p>
                ) : (
                  <select className="input" value={form.pet_id} onChange={set('pet_id')} required>
                    <option value="">Choose a pet...</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} {p.breed ? `(${p.breed})` : ''}</option>)}
                  </select>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Date*</label>
                  <input className="input" type="date" min={today} value={form.requested_date} onChange={set('requested_date')} required />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Time*</label>
                  <input className="input" type="time" value={form.requested_time} onChange={set('requested_time')} required />
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Message (optional)</label>
                <textarea className="input" placeholder="Any special instructions for the vendor?" value={form.message} onChange={set('message')} rows={3} style={{ resize:'none' }} />
              </div>

              {error && <p style={{ color:'var(--color-error)', fontSize:13 }}>{error}</p>}

              <button type="submit" className="btn btn-accent" style={{ width:'100%', justifyContent:'center' }} disabled={status==='loading' || pets.length===0}>
                {status==='loading' ? 'Sending...' : '📅 Send Booking Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
