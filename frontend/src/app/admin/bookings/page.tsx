'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface AdminBooking {
  id: string;
  user_username: string;
  business_name: string;
  pet_name: string;
  requested_date: string;
  requested_time: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export default function AdminBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (!user) return;

    api.admin.getAllBookings()
      .then(d => setBookings(d as AdminBooking[]))
      .catch(err => console.error('Failed to fetch bookings', err))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric' });

  if (authLoading || loading) return <div style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Dashboard Header Hero ──────────────────────────────────────── */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)', 
        padding: '60px 20px 40px', 
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 4px 24px rgba(107, 78, 255, 0.04)'
      }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ 
              width: 88, height: 88, borderRadius: '50%', 
              background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 36, fontWeight: 800, color: 'var(--color-primary)',
              boxShadow: '0 8px 24px rgba(107, 78, 255, 0.15)',
              border: '4px solid #fff'
            }}>
              🛡️
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>Admin Operations</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 15, fontWeight: 500 }}>Global Booking Surveillance</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 1000 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>Platform Bookings</h2>
          </div>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>No global activity</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto' }}>There are currently no bookings placed anywhere on the platform.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {bookings.map(b => (
                <div key={b.id} style={{ 
                  background: '#fff', padding: 24, borderRadius: 20, 
                  display: 'flex', flexDirection: 'column', gap: 16,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid var(--color-border)',
                  transition: 'transform 200ms ease',
                  cursor: 'default'
                }} className="hover-lift">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: b.status === 'confirmed' ? '#e6f4ea' : b.status === 'cancelled' ? '#fce8e6' : '#fef7e0',
                      color: b.status === 'confirmed' ? '#137333' : b.status === 'cancelled' ? '#c5221f' : '#b06000'
                    }}>
                      {b.status}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      ID: {b.id.substring(0,8)}
                    </span>
                  </div>
                  
                  <div style={{ background: '#F8F9FB', padding: 16, borderRadius: 16, border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>USER</span>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>@{b.user_username}</h3>
                    </div>
                    <div style={{ position: 'relative', paddingLeft: 16, borderLeft: '2px dashed var(--color-border)' }}>
                      <span style={{ position: 'absolute', left: -9, top: 2, background: '#fff', fontSize: 12 }}>⬇️</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: '#FFE4E6', color: '#E11D48', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>VENDOR</span>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{b.business_name}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🐾</span>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Subject: <span style={{ color: 'var(--color-primary)' }}>{b.pet_name}</span></p>
                  </div>

                  <div style={{ padding: 12, background: '#F7F5FF', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>📅</span>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-primary)', margin: 0 }}>
                      {formatDate(b.requested_date)} at {b.requested_time.substring(0,5)}
                    </p>
                  </div>

                  {b.message && (
                    <div style={{ position: 'relative', marginTop: 8 }}>
                      <span style={{ position: 'absolute', top: -4, left: -4, fontSize: 24, opacity: 0.1 }}>"</span>
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0, paddingLeft: 12, lineHeight: 1.5 }}>
                        {b.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(107, 78, 255, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
