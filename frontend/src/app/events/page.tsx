'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Event {
  id: string; title: string; location: string; date_time: string;
  description: string; rsvp_count: number; creator_username: string;
}

export default function EventsPage() {
  const { user }                    = useAuth();
  const [events, setEvents]         = useState<Event[]>([]);
  const [loading, setLoading]       = useState(true);
  const [rsvpd, setRsvpd]           = useState<Set<string>>(new Set());
  const [rsvping, setRsvping]       = useState<string | null>(null);

  useEffect(() => {
    api.events.list()
      .then(d => setEvents(d as Event[]))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRsvp = async (eventId: string) => {
    if (!user) { window.location.href = '/login'; return; }
    setRsvping(eventId);
    try {
      const res = await api.events.rsvp(eventId) as { rsvp_count: number };
      setRsvpd(prev => new Set([...prev, eventId]));
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvp_count: res.rsvp_count } : e));
    } catch {}
    setRsvping(null);
  };

  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-CA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('en-CA', { hour:'2-digit', minute:'2-digit' });

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingBottom: 60 }}>
      <section style={{ background:'var(--color-bg)', padding:'48px 20px 32px', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 style={{ marginBottom:8, fontSize: 32 }}>Make Pet Friends</h1>
          <p style={{ color:'var(--color-text-muted)', fontSize: 15 }}>Let your buddy meet new pals and enjoy joyful moments together.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20 }}>Upcoming Events</h3>
            <button style={{ color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 600 }}>See All</button>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 24 }} />)}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 20px', background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize:64, marginBottom:16 }}>📅</div>
              <h3>No upcoming events</h3>
              <p style={{ color:'var(--color-text-muted)', marginTop:8 }}>Check back soon — we add new events regularly!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {events.map((event, index) => {
                const isRsvpd = rsvpd.has(event.id);
                const dt = new Date(event.date_time);
                const monthStr = dt.toLocaleDateString('en-CA', { month: 'short' });
                const dayStr = dt.getDate();
                
                // Deterministic placeholder based on index
                const placeholders = [
                  'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=400',
                  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
                  'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&q=80&w=400',
                  'https://images.unsplash.com/photo-1599839619721-39794cb12128?auto=format&fit=crop&q=80&w=400'
                ];
                const bgImage = placeholders[index % placeholders.length];

                return (
                  <div key={event.id} className="card" style={{ 
                    background: '#fff', borderRadius: 24, padding: 12, 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' 
                  }}>
                    {/* Image Area with overlapping date */}
                    <div style={{ width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'var(--color-secondary)' }}>
                      <img src={bgImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      {/* Date Badge */}
                      <div style={{ 
                        position: 'absolute', top: 12, left: 12, 
                        background: 'var(--color-accent)', color: '#fff', 
                        padding: '6px 12px', borderRadius: 12, 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        fontWeight: 800, lineHeight: 1, boxShadow: '0 4px 12px rgba(255, 183, 3, 0.4)' 
                      }}>
                        <span style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>{monthStr}</span>
                        <span style={{ fontSize: 18 }}>{dayStr}</span>
                      </div>
                    </div>
                    
                    <div style={{ padding: '16px 8px 8px' }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        <div style={{ display: 'flex' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, border: '2px solid #fff', zIndex: 3 }}>A</span>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, border: '2px solid #fff', marginLeft: -8, zIndex: 2 }}>B</span>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, border: '2px solid #fff', marginLeft: -8, zIndex: 1 }}>C</span>
                        </div>
                        +{event.rsvp_count} pet going
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontSize: 14 }}>📍</span> {event.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>🕒</span> {formatTime(event.date_time)}
                        </span>
                      </div>

                      <button
                        className="btn"
                        onClick={() => handleRsvp(event.id)}
                        disabled={rsvping === event.id}
                        style={{ 
                          width: '100%', justifyContent: 'center', fontSize: 14, padding: '10px 0',
                          background: isRsvpd ? 'var(--color-surface)' : 'var(--color-primary)',
                          color: isRsvpd ? 'var(--color-primary)' : '#fff',
                          boxShadow: isRsvpd ? 'none' : '0 4px 12px rgba(107, 78, 255, 0.25)',
                          border: isRsvpd ? '1px solid var(--color-border)' : 'none'
                        }}
                      >
                        {rsvping === event.id ? '...' : isRsvpd ? 'Going ✓' : 'RSVP Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
