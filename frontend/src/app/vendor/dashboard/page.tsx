'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface VendorBooking {
  id: string;
  business_name: string;
  category: string;
  pet_name: string;
  pet_breed: string;
  requested_date: string;
  requested_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  username: string;
  user_email: string;
  age: number;
  notes: string;
}

export default function VendorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'vendor' && user.role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (!user) return;

    api.bookings.forVendor()
      .then(d => setBookings(d as VendorBooking[]))
      .catch(err => console.error('Failed to fetch vendor bookings', err))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.bookings.updateStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (authLoading || loading) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div className="skeleton" style={{ height: 400, maxWidth: 800, margin: '0 auto', borderRadius: 'var(--radius-lg)' }} />
    </div>
  );

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Dashboard Header Hero ──────────────────────────────────────── */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)', 
        padding: '60px 20px 40px', 
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 4px 24px rgba(107, 78, 255, 0.04)'
      }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ 
              width: 88, height: 88, borderRadius: '50%', 
              background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 36, fontWeight: 800, color: 'var(--color-primary)',
              boxShadow: '0 8px 24px rgba(107, 78, 255, 0.15)',
              border: '4px solid #fff'
            }}>
              🏪
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>Vendor Dashboard</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 15, fontWeight: 500 }}>Manage your incoming booking requests</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 820 }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📫</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Inbox Zero</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto' }}>You have no customer booking requests at the moment. When pet owners book your services, they'll appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {bookings.map(b => (
                <div key={b.id} style={{ 
                  background: '#fff', padding: 24, borderRadius: 20, 
                  display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid var(--color-border)' 
                }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
                        {b.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>@{b.username}</h4>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>{b.user_email}</p>
                      </div>
                    </div>
                    
                    <div style={{ padding: 16, background: 'var(--color-surface)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: b.notes ? 8 : 0 }}>
                        <span style={{ fontSize: 20 }}>🐾</span>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{b.pet_name} <span style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>({b.pet_breed}{b.age ? `, ${b.age}yrs` : ''})</span></p>
                      </div>
                      {b.notes && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>"{b.notes}"</p>}
                    </div>
                    
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📅</span>
                      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)', margin: 0 }}>
                        {new Date(b.requested_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {b.requested_time.substring(0,5)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, minWidth: 140 }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: b.status === 'confirmed' ? '#e6f4ea' : b.status === 'cancelled' ? '#fce8e6' : '#fef7e0',
                      color: b.status === 'confirmed' ? '#137333' : b.status === 'cancelled' ? '#c5221f' : '#b06000'
                    }}>
                      {b.status}
                    </span>
                    
                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                        <button onClick={() => handleUpdateStatus(b.id, 'confirmed')} className="btn btn-primary" style={{ background: '#137333', borderColor: '#137333', borderRadius: 100, padding: '10px 16px', display: 'flex', justifyContent: 'center', gap: 4 }}>
                          <span>✓</span> Confirm
                        </button>
                        <button onClick={() => handleUpdateStatus(b.id, 'cancelled')} className="btn btn-outline" style={{ borderRadius: 100, padding: '10px 16px', display: 'flex', justifyContent: 'center', gap: 4 }}>
                          <span>✕</span> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
