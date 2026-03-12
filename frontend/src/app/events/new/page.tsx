'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function NewEventPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'vendor' && user.role !== 'admin'))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.events.create({ title, location, date_time: new Date(dateTime).toISOString(), description });
      setSuccess(true);
      setTimeout(() => router.push('/events'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <section style={{ padding: '48px 20px', minHeight: 'calc(100vh - 68px)', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ marginBottom: 8 }}>📌 Host an Event</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>Submit an event for approval. Once reviewed by our team, it will appear on the public events board.</p>

        {success ? (
          <div className="card fade-up" style={{ padding: 32, textAlign: 'center', background: 'var(--color-surface)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: 'var(--color-success)' }}>Event Submitted!</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Your event has been submitted for admin approval.</p>
          </div>
        ) : (
          <form className="card fade-up" onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Event Title</label>
              <input className="input" placeholder="e.g. Puppy Training 101" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Date & Time</label>
                <input className="input" type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Location</label>
                <input className="input" placeholder="e.g. Trinity Bellwoods Park" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Description</label>
              <textarea className="input" rows={4} placeholder="Tell people what to expect..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            {error && <p style={{ color: 'var(--color-error)', fontSize: 13, background: '#fff1f0', padding: 12, borderRadius: 'var(--radius-sm)' }}>{error}</p>}
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: 12 }}>
              {loading ? 'Submitting...' : 'Submit Event for Approval'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
