'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const CATEGORIES = ['grooming','training','boarding','veterinary','daycare','walking','other'];

export default function ListYourServicePage() {
  const [form, setForm] = useState({
    business_name:'', owner_name:'', category:'grooming', email:'',
    contact_phone:'', address:'', description:'', price_range:'', services:'',
  });
  const [status, setStatus]   = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [error, setError]     = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      const services = form.services.split(',').map(s => s.trim()).filter(Boolean);
      await api.vendors.register({ ...form, services });
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setStatus('error');
    }
  };

  if (status === 'success') return (
    <section style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
        <h2 style={{ marginBottom:12 }}>Registration Submitted!</h2>
        <p style={{ color:'var(--color-text-muted)', lineHeight:1.7, marginBottom:28 }}>
          Thanks for joining The Pet Point! Our team will review your submission and get back to you within 2–3 business days.
        </p>
        <a href="/" className="btn btn-primary">Back to Home</a>
      </div>
    </section>
  );

  return (
    <>
      <section style={{ background:'linear-gradient(135deg,#6B4EFF,#9B7FFF)', padding:'60px 20px 40px', textAlign:'center' }}>
        <div className="container fade-up">
          <h1 style={{ color:'#fff', marginBottom:12 }}>List Your Pet Business</h1>
          <p style={{ color:'rgba(255,255,255,0.85)', fontSize:17 }}>Join Toronto&apos;s fastest growing pet services platform</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container" style={{ maxWidth:680 }}>
          <form className="card" style={{ padding:40 }} onSubmit={handleSubmit}>
            <h3 style={{ marginBottom:8 }}>Business Information</h3>
            <p style={{ color:'var(--color-text-muted)', fontSize:14, marginBottom:28 }}>Tell us about your business — our admin will review and approve your listing.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Business Name*</label>
                  <input className="input" placeholder="Happy Paws Grooming" value={form.business_name} onChange={set('business_name')} required />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Your Name*</label>
                  <input className="input" placeholder="Jane Smith" value={form.owner_name} onChange={set('owner_name')} required />
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Category*</label>
                <select className="input" value={form.category} onChange={set('category')} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Business Email*</label>
                  <input className="input" type="email" placeholder="hello@yourshop.ca" value={form.email} onChange={set('email')} required />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Phone</label>
                  <input className="input" placeholder="416-xxx-xxxx" value={form.contact_phone} onChange={set('contact_phone')} />
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Address</label>
                <input className="input" placeholder="123 Main St, Toronto, ON" value={form.address} onChange={set('address')} />
              </div>

              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Description</label>
                <textarea className="input" placeholder="Tell pet owners what makes your business special..." value={form.description} onChange={set('description')} rows={4} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Services Offered*</label>
                  <input className="input" placeholder="Bath, Nail trim, Haircut (comma-separated)" value={form.services} onChange={set('services')} />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:5 }}>Price Range</label>
                  <input className="input" placeholder="e.g. $40–$80" value={form.price_range} onChange={set('price_range')} />
                </div>
              </div>

              {error && <p style={{ color:'var(--color-error)', fontSize:13 }}>{error}</p>}

              <button type="submit" className="btn btn-accent btn-lg" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={status==='loading'}>
                {status==='loading' ? 'Submitting...' : '🐾 Submit for Review'}
              </button>
              <p style={{ textAlign:'center', fontSize:12, color:'var(--color-text-muted)' }}>
                Listings are reviewed within 2–3 business days. Free to list.
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
