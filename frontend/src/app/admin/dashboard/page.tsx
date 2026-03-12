'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface PendingVendor {
  id: string;
  business_name: string;
  owner_name: string;
  category: string;
  description: string;
  services: string[];
  address: string;
  contact_phone: string;
  email: string;
  price_range: string;
  user_email: string; // The email of the user account linked to the vendor
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (!user) return;

    api.admin.getPendingVendors()
      .then(d => setVendors(d as PendingVendor[]))
      .catch(err => console.error('Failed to fetch pending vendors', err))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleApprove = async (id: string) => {
    try {
      await api.admin.approveVendor(id);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Failed to approve vendor', err);
    }
  };

  if (authLoading || loading) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div className="skeleton" style={{ height: 400, maxWidth: 800, margin: '0 auto', borderRadius: 'var(--radius-lg)' }} />
    </div>
  );

  return (
    <>
      <section style={{ background: 'var(--color-surface)', padding: '48px 20px 32px' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff' }}>
              🛡️
            </div>
            <div>
              <h1 style={{ fontSize: 28, marginBottom: 2 }}>Admin Dashboard</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Review and approve pending vendor registrations</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container" style={{ maxWidth: 820 }}>
          {vendors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No pending vendors. The queue is empty!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {vendors.map(v => (
                <div key={v.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <h3 style={{ margin: 0 }}>{v.business_name}</h3>
                        <span className="badge badge-pending">Action Required</span>
                      </div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 4 }}>
                        <strong>Owner:</strong> {v.owner_name}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 4 }}>
                        <strong>Contact Email:</strong> {v.email} {v.user_email && <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>(Account: {v.user_email})</span>}
                      </p>
                      {v.contact_phone && (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 4 }}>
                          <strong>Phone:</strong> {v.contact_phone}
                        </p>
                      )}
                      {v.address && (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 4 }}>
                          <strong>Address:</strong> {v.address}
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleApprove(v.id)} 
                      className="btn btn-primary" 
                      style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                    >
                      ✓ Approve Vendor
                    </button>
                  </div>

                  <div style={{ background: 'var(--color-surface)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span className="pill" style={{ background: 'var(--color-primary)', color: 'white', fontSize: 12 }}>
                        {v.category}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{v.price_range || 'Price TBD'}</span>
                    </div>
                    
                    {v.description && (
                      <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{v.description}</p>
                    )}
                    
                    {v.services && v.services.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {v.services.map(s => (
                          <span key={s} className="pill" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', fontSize: 12 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right' }}>
                    Submitted: {new Date(v.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
