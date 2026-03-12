'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface AdminEvent {
  id: string; title: string; location: string; date_time: string;
  description: string; rsvp_count: number; creator_username: string;
  approved_status: boolean;
}

export default function AdminEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (!user) return;

    api.admin.getUnapprovedEvents()
      .then(d => setEvents(d as AdminEvent[]))
      .catch(err => console.error('Failed to fetch events', err))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleApprove = async (id: string) => {
    try {
      await api.admin.approveEvent(id);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, approved_status: true } : e));
    } catch (err) {
      console.error('Failed to approve event', err);
    }
  };

  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

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
        <div className="container" style={{ maxWidth: 900 }}>
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
              <p style={{ color: 'var(--color-text-muted)', fontSize: 15, fontWeight: 500 }}>Community Event Moderation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 900 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>Pending Events</h2>
          </div>

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>All caught up!</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto' }}>There are currently no community events waiting for administrative approval.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {events.map(ev => (
                <div key={ev.id} style={{ 
                  background: '#fff', padding: 24, borderRadius: 20, 
                  display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'center', flexWrap: 'wrap',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid var(--color-border)' 
                }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{ev.title}</h3>
                      {!ev.approved_status && <span style={{ background: '#fef7e0', color: '#b06000', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review Needed</span>}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--color-primary)' }}>
                          {ev.creator_username[0].toUpperCase()}
                        </div>
                        <strong>@{ev.creator_username}</strong>
                      </div>
                      <span>•</span>
                      <span>👥 {ev.rsvp_count} Attendees</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: 'var(--color-text-muted)', marginBottom: ev.description ? 16 : 0, background: '#F8F9FB', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 16 }}>📍</span> <span style={{ fontWeight: 600 }}>{ev.location}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 16 }}>🕒</span> <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{formatDate(ev.date_time)}</span></div>
                    </div>

                    {ev.description && (
                      <div style={{ position: 'relative', marginTop: 12 }}>
                        <span style={{ position: 'absolute', top: -4, left: -4, fontSize: 24, opacity: 0.1 }}>"</span>
                        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
                          {ev.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160, alignSelf: 'stretch', justifyContent: 'center', borderLeft: '1px solid var(--color-border)', paddingLeft: 24 }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 32 }}>🎟️</span>
                    </div>
                    {!ev.approved_status ? (
                      <button onClick={() => handleApprove(ev.id)} className="btn btn-primary" style={{ background: '#137333', borderColor: '#137333', borderRadius: 100, padding: '12px 16px', display: 'flex', justifyContent: 'center', gap: 6, width: '100%', boxShadow: '0 4px 12px rgba(19, 115, 51, 0.2)' }}>
                        <span>✓</span> Approve
                      </button>
                    ) : (
                      <div style={{ background: '#e6f4ea', color: '#137333', padding: '10px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, textAlign: 'center', border: '1px solid #137333' }}>
                        ✓ Approved
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
