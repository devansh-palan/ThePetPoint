'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import BookingForm from '@/components/BookingForm';

interface Vendor {
  id: string; business_name: string; owner_name: string; category: string;
  description: string; address: string; lat: number; lng: number;
  contact_phone: string; email: string; price_range: string;
  photo_urls: string[]; services: string[];
}

export default function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { user } = useAuth();
  const [vendor, setVendor]           = useState<Vendor | null>(null);
  const [loading, setLoading]         = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    api.vendors.get(unwrappedParams.id)
      .then(v => setVendor(v as Vendor))
      .catch(() => setVendor(null))
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  if (loading) return (
    <div style={{ padding:'80px 20px', textAlign:'center' }}>
      <div className="skeleton" style={{ height:400, maxWidth:800, margin:'0 auto', borderRadius:'var(--radius-lg)' }} />
    </div>
  );

  if (!vendor) return (
    <div style={{ padding:'120px 20px', textAlign:'center' }}>
      <h2>Vendor not found</h2>
      <Link href="/services" className="btn btn-primary" style={{ marginTop:24, display:'inline-flex' }}>Back to Services</Link>
    </div>
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="container" style={{ padding:'48px 20px' }}>
      <Link href="/services" style={{ color:'var(--color-primary)', fontWeight:600, fontSize:14, display:'inline-flex', alignItems:'center', gap:6, marginBottom:24 }}>
        ← Back to Services
      </Link>

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:32 }}>
        {/* Photo gallery */}
        {vendor.photo_urls?.length > 0 ? (
          <div>
            <div style={{ height:360, borderRadius:'var(--radius-lg)', overflow:'hidden', background:'var(--color-secondary)' }}>
              <img src={vendor.photo_urls[activePhoto]} alt={vendor.business_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            {vendor.photo_urls.length > 1 && (
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                {vendor.photo_urls.map((url, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)} style={{ width:64, height:64, borderRadius:'var(--radius-sm)', overflow:'hidden', border: i===activePhoto ? '3px solid var(--color-primary)' : '3px solid transparent', padding:0 }}>
                    <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ height:360, borderRadius:'var(--radius-lg)', overflow:'hidden', background:'var(--color-secondary)' }}>
              <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200" alt={vendor.business_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(0,1fr)', gap:32 }}>
          {/* Info */}
          <div>
            <span className="pill" style={{ marginBottom:12 }}>{vendor.category}</span>
            <h1 style={{ fontSize:36, marginBottom:8, marginTop:8 }}>{vendor.business_name}</h1>
            <p style={{ color:'var(--color-text-muted)', marginBottom:20 }}>📍 {vendor.address}</p>
            {vendor.price_range && <p style={{ fontWeight:700, color:'var(--color-primary)', fontSize:18, marginBottom:20 }}>{vendor.price_range}</p>}
            <p style={{ lineHeight:1.8, color:'var(--color-text)', marginBottom:28 }}>{vendor.description}</p>

            {vendor.services?.length > 0 && (
              <div>
                <h4 style={{ marginBottom:12 }}>Services Offered</h4>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {vendor.services.map(s => <span key={s} className="pill">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card" style={{ padding:24 }}>
              <h4 style={{ marginBottom:16 }}>Book Now</h4>
              {user ? (
                <button className="btn btn-accent w-full" onClick={() => setShowBooking(true)}>
                  📅 Request Appointment
                </button>
              ) : (
                <Link href="/login" className="btn btn-accent w-full" style={{ display:'flex', justifyContent:'center' }}>
                  Log in to Book
                </Link>
              )}
              {vendor.contact_phone && <p style={{ marginTop:16, color:'var(--color-text-muted)', fontSize:14 }}>📞 {vendor.contact_phone}</p>}
              {vendor.email && <p style={{ color:'var(--color-text-muted)', fontSize:14 }}>✉️ {vendor.email}</p>}
            </div>

            {/* Map */}
            {apiKey && vendor.lat && vendor.lng && (
              <div style={{ borderRadius:'var(--radius-md)', overflow:'hidden', height:200 }}>
                <iframe
                  title="Vendor location"
                  width="100%"
                  height="200"
                  style={{ border:0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${vendor.lat},${vendor.lng}&zoom=15`}
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showBooking && vendor && (
        <BookingForm vendorId={vendor.id} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}
