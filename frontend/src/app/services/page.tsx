'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const CATEGORIES = [
  { slug: '', label: 'All', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=200' },
  { slug: 'grooming', label: 'Grooming', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&q=80&w=200' },
  { slug: 'training', label: 'Training', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200' },
  { slug: 'boarding', label: 'Boarding', image: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=200' },
  { slug: 'veterinary', label: 'Veterinary', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=200' },
  { slug: 'daycare', label: 'Daycare', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=200' },
  { slug: 'walking', label: 'Walking', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&q=80&w=200' },
];

interface Vendor {
  id: string; business_name: string; category: string;
  description: string; address: string; price_range: string;
  photo_urls: string[]; services: string[];
}

function ServicesContent() {
  const { user } = useAuth();
  const params = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(params.get('category') || '');

  useEffect(() => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (category) p.category = category;
    if (location) p.location = location;
    if (search) p.search = search;
    api.vendors.list(p)
      .then(d => setVendors(d as Vendor[]))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [category, location, search]);

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 24 }}>

        {/* Search Bar matching mockup rounded style */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: 14, fontSize: 18, color: 'var(--color-primary)' }}>🔍</span>
            <input
              className="input"
              placeholder="Search services or vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 44, borderRadius: 30, background: '#fff', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            />
          </div>
          <input
            className="input"
            placeholder="Location..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            style={{ width: 140, borderRadius: 30, background: '#fff', border: '1px solid var(--color-border)', flexShrink: 0 }}
          />
        </div>

        {/* Promotional Banner matching the orange rounded banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)',
          borderRadius: 24,
          padding: '32px 24px',
          color: '#333',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 8px 24px rgba(255, 183, 3, 0.25)'
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 8, maxWidth: '60%', lineHeight: 1.2 }}>Care for Your Pet, Save More</h2>
          <p style={{ fontSize: 13, marginBottom: 16, maxWidth: '60%', fontWeight: 600, opacity: 0.9 }}>Earn 10% cashback on verified sitter bookings nearby.</p>
          {user ? (
            <a href="#vendors-grid" style={{ background: '#fff', color: '#333', padding: '10px 20px', borderRadius: 30, fontSize: 14, fontWeight: 700, display: 'inline-block', textDecoration: 'none', position: 'relative', zIndex: 2 }}>Explore Vendors</a>
          ) : (
            <Link href="/signup" style={{ background: '#fff', color: '#333', padding: '10px 20px', borderRadius: 30, fontSize: 14, fontWeight: 700, display: 'inline-block', position: 'relative', zIndex: 2 }}>Book Now</Link>
          )}
          <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80" alt="Dog" style={{ position: 'absolute', right: -20, bottom: -50, width: 200, height: 200, objectFit: 'cover', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.2)', zIndex: 1 }} />
        </div>

        {/* Categories matching the tile format */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18 }}>Categories</h3>
          <button style={{ color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 600 }} onClick={() => setCategory('')}>See all</button>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, margin: '0 -20px', paddingLeft: 20, paddingRight: 20, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => {
            const isActive = category === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => setCategory(c.slug)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72, cursor: 'pointer',
                  opacity: (category && !isActive) ? 0.6 : 1, transition: 'all 200ms ease', background: 'transparent', border: 'none', padding: 0
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? '0 8px 16px rgba(107, 78, 255, 0.3)' : '0 4px 8px rgba(0,0,0,0.05)', transition: 'all 200ms ease', overflow: 'hidden', border: isActive ? '2px solid var(--color-primary)' : '2px solid transparent'
                }}>
                  <img src={c.image} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}>{c.label}</span>
              </button>
            )
          })}
        </div>

        {/* Recommended / Results matching "Pet Buy & Sell" / "Backers nearby" layout */}
        <div id="vendors-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 16, scrollMarginTop: 100 }}>
          <h3 style={{ fontSize: 18 }}>{category ? `Results in ${CATEGORIES.find(c => c.slug === category)?.label.split(' ')[1]}` : 'Recommended Providers'}</h3>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 24 }} />)}
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
            <h3 style={{ marginBottom: 8 }}>No providers found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {vendors.map((v, i) => {
              const placeholders = [
                'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400'
              ];
              const placeholderImage = placeholders[i % placeholders.length];

              return (
                <Link key={v.id} href={`/vendors/${v.id}`} className="card" style={{ borderRadius: 24, background: 'var(--color-secondary)', position: 'relative', overflow: 'hidden', padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', background: '#dcd6fa', position: 'relative' }}>
                    {v.photo_urls?.[0] ? (
                      <img src={v.photo_urls[0]} alt={v.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={placeholderImage} alt={v.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {/* Floating Action Button a la mockup */}
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, background: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(255,183,3,0.4)' }}>
                      ↗
                    </div>
                  </div>

                  {/* Info block resembling the curved pill from mockup */}
                  <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 16, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.business_name}</h4>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{v.category}</span>
                    </div>
                    {v.price_range && <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>{v.price_range}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
