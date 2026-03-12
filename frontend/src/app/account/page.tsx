'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Tab = 'bookings' | 'pets';

interface Booking { id:string; business_name:string; category:string; pet_name:string; pet_breed:string; requested_date:string; requested_time:string; status:'pending'|'confirmed'|'cancelled'; }
interface Pet { id:string; name:string; breed:string; age:number; notes:string; photo_url:string; }

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab]             = useState<Tab>('bookings');
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [pets, setPets]           = useState<Pet[]>([]);
  const [loading, setLoading]     = useState(true);

  // New pet form
  const [petForm, setPetForm]     = useState({ name:'', breed:'', age:'', notes:'' });
  const [addingPet, setAddingPet] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;
    Promise.all([
      api.bookings.mine().then(d => setBookings(d as Booking[])).catch(() => {}),
      api.pets.list().then(d => setPets(d as Pet[])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleAddPet = async () => {
    if (!petForm.name) return;
    setAddingPet(true);
    try {
      const p = await api.pets.create({ ...petForm, age: petForm.age ? parseInt(petForm.age) : undefined }) as Pet;
      setPets(prev => [p, ...prev]);
      setPetForm({ name:'', breed:'', age:'', notes:'' });
      setShowAddPet(false);
    } catch {} finally { setAddingPet(false); }
  };

  const handleDeletePet = async (id: string) => {
    await api.pets.delete(id);
    setPets(prev => prev.filter(p => p.id !== id));
  };

  if (authLoading || loading) return (
    <div style={{ padding:'80px 20px', textAlign:'center' }}>
      <div className="skeleton" style={{ height:400, maxWidth:800, margin:'0 auto', borderRadius:'var(--radius-lg)' }} />
    </div>
  );

  const petEmojis: Record<string,string> = { cat:'🐱', dog:'🐶', rabbit:'🐰', bird:'🦜', fish:'🐠', hamster:'🐹' };
  const petEmoji = (breed:string) => {
    const b = breed?.toLowerCase() || '';
    return Object.entries(petEmojis).find(([k]) => b.includes(k))?.[1] || '🐾';
  };

  const emojiFallback = (cat: string) => {
    switch(cat) {
      case 'walking': return '🦮';
      case 'daycare': return '🎾';
      default: return '🐾';
    }
  }

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Profile Header Hero ──────────────────────────────────────── */}
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
              {user?.username[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>@{user?.username}</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 15, fontWeight: 500 }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 820 }}>
          
          {/* Segmented Controls (Tabs) */}
          <div style={{ 
            display: 'flex', background: '#e0d9ff', padding: 6, borderRadius: 100,
            maxWidth: 320, margin: '0 0 32px'
          }}>
            {(['bookings', 'pets'] as Tab[]).map(t => (
              <button 
                key={t} 
                onClick={() => setTab(t)} 
                style={{ 
                  flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === t ? '0 4px 12px rgba(107, 78, 255, 0.15)' : 'none',
                  transition: 'all 200ms ease'
                }}
              >
                {t === 'bookings' ? '📅 My Bookings' : '🐾 My Pets'}
              </button>
            ))}
          </div>

          {/* BOOKINGS TAB */}
          {tab === 'bookings' && (
            bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>No bookings yet</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto 24px' }}>You haven't requested any pet care services yet. Explore our trusted vendors to get started.</p>
                <a href="/services" className="btn btn-primary" style={{ display: 'inline-flex', borderRadius: 100, padding: '12px 28px' }}>Explore Services</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bookings.map(b => (
                  <div key={b.id} style={{ 
                    background: '#fff', padding: 24, borderRadius: 20, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid var(--color-border)' 
                  }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        {b.category === 'grooming' ? '✂️' : b.category === 'training' ? '🎾' : b.category === 'boarding' ? '🏠' : b.category === 'veterinary' ? '🩺' : emojiFallback(b.category)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{b.business_name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          <span>🐾 {b.pet_name}</span>
                          <span>•</span>
                          <span>📅 {new Date(b.requested_date).toLocaleDateString()} at {b.requested_time.substring(0,5)}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: b.status === 'confirmed' ? '#e6f4ea' : b.status === 'cancelled' ? '#fce8e6' : '#fef7e0',
                      color: b.status === 'confirmed' ? '#137333' : b.status === 'cancelled' ? '#c5221f' : '#b06000'
                    }}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* PETS TAB */}
          {tab === 'pets' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20 }}>Furry Family Members</h3>
                <button className={showAddPet ? "btn btn-outline" : "btn btn-accent"} style={{ borderRadius: 100, padding: '10px 20px' }} onClick={() => setShowAddPet(!showAddPet)}>
                  {showAddPet ? '✕ Cancel' : '+ Add Pet'}
                </button>
              </div>

              {showAddPet && (
                <div style={{ background: '#fff', padding: 32, borderRadius: 24, marginBottom: 32, boxShadow: '0 8px 32px rgba(107,78,255,0.08)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><span>🐕</span> New Pet Profile</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)' }}>Pet Name *</label>
                      <input className="input" placeholder="e.g. Bella" value={petForm.name} onChange={e => setPetForm(p => ({ ...p, name: e.target.value }))} style={{ border: '2px solid var(--color-border)', borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)' }}>Breed</label>
                      <input className="input" placeholder="e.g. Golden Retriever" value={petForm.breed} onChange={e => setPetForm(p => ({ ...p, breed: e.target.value }))} style={{ border: '2px solid var(--color-border)', borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)' }}>Age (Years)</label>
                      <input className="input" placeholder="e.g. 3" type="number" min="0" value={petForm.age} onChange={e => setPetForm(p => ({ ...p, age: e.target.value }))} style={{ border: '2px solid var(--color-border)', borderRadius: 12 }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--color-text)' }}>Special Notes</label>
                      <textarea className="input" placeholder="Allergies, personality quirks, etc..." value={petForm.notes} onChange={e => setPetForm(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ resize: 'none', border: '2px solid var(--color-border)', borderRadius: 12 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button className="btn btn-primary" style={{ borderRadius: 100, padding: '12px 32px' }} onClick={handleAddPet} disabled={addingPet || !petForm.name}>
                        {addingPet ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              )}

              {pets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
                  <h3 style={{ fontSize: 20, marginBottom: 8 }}>No pets yet</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto' }}>Add your furry friends to easily book services for them in the future.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 24 }}>
                  {pets.map(pet => (
                    <div key={pet.id} style={{ 
                      background: '#fff', borderRadius: 24, padding: 24, position: 'relative',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid var(--color-border)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                    }}>
                      <button onClick={() => handleDeletePet(pet.id)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#F8F9FB', color: 'var(--color-text-muted)', fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove pet">✕</button>
                      
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-secondary)', fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: 'inset 0 4px 8px rgba(107, 78, 255, 0.1)' }}>
                        {petEmoji(pet.breed)}
                      </div>
                      
                      <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{pet.name}</h4>
                      {pet.breed && <div style={{ background: '#F7F5FF', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{pet.breed}</div>}
                      
                      {pet.age != null && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 8 }}>{pet.age} {pet.age === 1 ? 'Year' : 'Years'} Old</p>}
                      {pet.notes && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5, background: '#F8F9FB', padding: '8px 12px', borderRadius: 12, width: '100%' }}>"{pet.notes}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
