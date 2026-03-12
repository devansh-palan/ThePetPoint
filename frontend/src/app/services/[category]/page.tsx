import type { Metadata } from 'next';
import Link from 'next/link';

interface Props { params: Promise<{ category: string }>; }

const CATEGORY_META: Record<string, { label: string; emoji: string; desc: string }> = {
  grooming:   { label: 'Dog Groomers',       emoji: '✂️', desc: 'Find trusted dog groomers near you.' },
  training:   { label: 'Pet Trainers',        emoji: '🎓', desc: 'Connect with certified pet trainers.' },
  boarding:   { label: 'Pet Boarding',        emoji: '🏠', desc: 'Safe and comfortable boarding for your pet.' },
  veterinary: { label: 'Veterinary Clinics',  emoji: '🩺', desc: 'Trusted vets for your pet\'s health.' },
  daycare:    { label: 'Pet Daycare',         emoji: '☀️', desc: 'Happy daytime care while you\'re at work.' },
  walking:    { label: 'Dog Walkers',         emoji: '🦮', desc: 'Reliable dog walking services in Toronto.' },
  other:      { label: 'Pet Services',        emoji: '🐾', desc: 'Other local pet services near you.' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category] || { label: 'Pet Services', emoji: '🐾', desc: 'Find local pet services.' };
  return {
    title: `${meta.label} in Toronto | The Pet Point`,
    description: `${meta.desc} Browse and book ${meta.label.toLowerCase()} in Toronto on The Pet Point.`,
    keywords: `${meta.label} Toronto, ${meta.label.toLowerCase()} near me, pet services Toronto`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const meta = CATEGORY_META[category] || { label: 'Pet Services', emoji: '🐾', desc: 'Find local pet services.' };

  return (
    <>
      <section style={{ background:'var(--color-surface)', padding:'60px 20px 40px', textAlign:'center' }}>
        <div className="container fade-up">
          <div style={{ fontSize:64, marginBottom:16 }}>{meta.emoji}</div>
          <h1 style={{ marginBottom:12 }}>{meta.label} in Toronto</h1>
          <p style={{ color:'var(--color-text-muted)', maxWidth:540, margin:'0 auto 28px' }}>{meta.desc}</p>
          <Link href={`/services?category=${category}`} className="btn btn-primary">
            Browse {meta.label}
          </Link>
        </div>
      </section>
    </>
  );
}
