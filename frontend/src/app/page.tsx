'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const categories = [
  { icon: '🛍️', label: 'Pet Shop', slug: '', image: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=200' },
  { icon: '🐾', label: 'Playmates', slug: 'playmates', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200' },
  { icon: '🩺', label: 'Vets Nearby', slug: 'veterinary', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=200' },
  { icon: '✂️', label: 'Pet Care', slug: 'grooming', image: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=200' },
  { icon: '🏠', label: 'Boarding', slug: 'boarding', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=200' },
];

interface Vendor { id: string; business_name: string; photo_urls: string[]; category: string; }
interface Event { id: string; title: string; location: string; date_time: string; rsvp_count: number; }

export default function HomePage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.vendors.list({}),
      api.events.list()
    ])
      .then(([v, e]) => {
        setVendors((v as Vendor[]).slice(0, 4));
        setEvents((e as Event[]).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return { month: d.toLocaleDateString('en-CA', { month: 'short' }), day: d.getDate() };
  };
  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Massive Bold Hero ──────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-surface)',
        padding: '60px 20px 0',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        overflow: 'hidden',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        boxShadow: '0 4px 32px rgba(107, 78, 255, 0.12)'
      }}>
        <div className="container" style={{ maxWidth: 800, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(56px, 12vw, 120px)',
            lineHeight: 0.85,
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            marginBottom: 24,
            letterSpacing: '-0.02em',
            textShadow: '4px 6px 0px var(--color-accent)'
          }}>
            THE PET<br />POINT
          </h1>



          <div style={{ marginBottom: 40 }}>
            <Link href="/services" className="btn btn-accent btn-lg" style={{
              fontSize: 18,
              padding: '16px 40px',
              boxShadow: '4px 8px 0px var(--color-primary)',
              transform: 'rotate(-2deg)',
              display: 'inline-block',
              border: '3px solid var(--color-primary)',
              borderRadius: 16
            }}>
              EXPLORE SERVICE
            </Link>
          </div>
        </div>

        {/* Dogs Image Placeholder at bottom */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          height: 280,
          margin: '0 auto',
          zIndex: 1,
          bottom: -10
        }}>
          <img
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1200"
            alt="Happy dogs"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              borderRadius: '40px 40px 0 0'
            }}
          />
        </div>
      </section>

      <div className="container" style={{ maxWidth: 800, marginTop: 40 }}>

        {/* ── App Greeting / Match Banner (If logged in, or guest prompt) ── */}
        <div style={{ padding: '0 20px', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Hello {user ? user.username : 'Pet Lover'}!</h2>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 14 }}>Ready for today's walk?</p>
            </div>
          </div>


        </div>

        {/* ── Categories ──────────────────────────────────────── */}
        <div style={{ marginBottom: 32, padding: '0 20px' }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>What do you need today?</h3>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, margin: '0 -20px', paddingLeft: 20, paddingRight: 20, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {categories.map(c => (
              <Link key={c.label} href={c.slug ? `/services?category=${c.slug}` : '/services'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 64, textDecoration: 'none' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <img src={c.image} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', textAlign: 'center' }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Trending Places Nearby ───────────────────────────── */}
        <div style={{ marginBottom: 32, padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, margin: 0 }}>Trending Places Nearby</h3>
            <Link href="/services" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'none' }}>View All</Link>
          </div>

          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24, margin: '0 -20px', paddingLeft: 20, paddingRight: 20, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {loading ? (
              [1, 2].map(i => <div key={i} className="skeleton" style={{ minWidth: 240, height: 200, borderRadius: 24 }} />)
            ) : vendors.map((v, i) => {
              const bg = [
                'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1516734212-f46ae5c4b8b6?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'
              ][i % 3];

              return (
                <Link key={v.id} href={`/vendors/${v.id}`} className="card" style={{ minWidth: 260, flex: '0 0 auto', background: '#fff', borderRadius: 24, padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '100%', height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 12 }}>
                    <img src={v.photo_urls?.[0] || bg} alt={v.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>☆</div>
                  </div>
                  <div style={{ padding: '0 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>{v.business_name}</h4>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>★ 4.8</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {v.category.charAt(0).toUpperCase() + v.category.slice(1)} • Toronto</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Upcoming Events ────────────────────────────────── */}
        <div style={{ marginBottom: 32, padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, margin: 0 }}>Upcoming Events</h3>
            <Link href="/events" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'none' }}>See All</Link>
          </div>

          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24, margin: '0 -20px', paddingLeft: 20, paddingRight: 20, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {loading ? (
              [1, 2].map(i => <div key={i} className="skeleton" style={{ minWidth: 260, height: 260, borderRadius: 24 }} />)
            ) : events.map((e, i) => {
              const bg = [
                'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&q=80'
              ][i % 3];
              const date = formatDate(e.date_time);

              return (
                <div key={e.id} className="card" style={{ minWidth: 280, flex: '0 0 auto', background: '#fff', borderRadius: 24, padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 12 }}>
                    <img src={bg} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--color-accent)', color: '#fff', padding: '6px 12px', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', fontWeight: 800, lineHeight: 1, boxShadow: '0 4px 12px rgba(255,183,3,0.4)' }}>
                      <span style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>{date.month}</span>
                      <span style={{ fontSize: 18 }}>{date.day}</span>
                    </div>
                  </div>
                  <div style={{ padding: '0 4px' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-primary)', display: 'block', border: '2px solid #fff', zIndex: 3 }}></span>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-accent)', display: 'block', border: '2px solid #fff', marginLeft: -8, zIndex: 2 }}></span>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-primary-dark)', display: 'block', border: '2px solid #fff', marginLeft: -8, zIndex: 1 }}></span>
                      </div>
                      +{e.rsvp_count} pet going
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <span>🕒 {formatTime(e.date_time)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
