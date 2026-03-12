'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Post { id: string; content: string; created_at: string; username: string; }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommunityPage() {
  const { user }                = useAuth();
  const [posts, setPosts]       = useState<Post[]>([]);
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState('');
  const [offset, setOffset]     = useState(0);
  const [hasMore, setHasMore]   = useState(true);

  const loadPosts = async (off: number) => {
    const data = await api.posts.feed(off) as Post[];
    if (data.length < 20) setHasMore(false);
    setPosts(prev => off === 0 ? data : [...prev, ...data]);
    setLoading(false);
  };

  useEffect(() => { loadPosts(0); }, []);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true); setError('');
    try {
      const p = await api.posts.create(content) as Post;
      setPosts(prev => [p, ...prev]);
      setContent('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post');
    } finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    await api.posts.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh', paddingBottom: 60, position: 'relative' }}>
      
      {/* Background Header Curve */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280, background: 'var(--color-primary)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, zIndex: 0 }} />

      <section style={{ position: 'relative', zIndex: 1, paddingTop: 40, paddingBottom: 24 }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ color: '#fff', fontSize: 32, margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>The Pet Point <br/><span style={{ fontSize: 24, fontWeight: 600 }}>Community</span></h1>
            {user && (
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Post creator matching the thin purple pill from mockup */}
          {user ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', borderRadius: 24, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 12, alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input
                placeholder="Create a New Post..."
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={1000}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 15, outline: 'none' }}
              />
              <button onClick={handlePost} disabled={posting || !content.trim()} style={{ color: '#fff', fontWeight: 700, opacity: (!content.trim() || posting) ? 0.5 : 1 }}>
                {posting ? '...' : 'Post'}
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: '16px 20px', marginBottom: 32, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#fff', margin: 0, fontSize: 14 }}>Log in to post to the community</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: 600 }}>
          {error && <p style={{ color:'var(--color-error)', fontSize:13, background: '#fff', padding: 8, borderRadius: 8, textAlign: 'center', marginBottom: 16 }}>{error}</p>}

          {/* Feed */}
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 24 }} />)}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', background: '#fff', borderRadius: 24 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🐾</div>
              <p style={{ color:'var(--color-text-muted)' }}>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap: 20 }}>
                {posts.map((post, index) => {
                  const placeholders = [
                    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
                    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400',
                    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
                    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400'
                  ];
                  const placeholderImage = placeholders[index % placeholders.length];

                  return (
                  <div key={post.id} className="card" style={{ padding: 24, borderRadius: 24, background: '#FFF', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-secondary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--color-primary)' }}>
                          {post.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: 'var(--color-text)' }}>@{post.username}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color:'var(--color-text-muted)', fontSize: 13 }}>{timeAgo(post.created_at)}</span>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(post.id)} style={{ color:'var(--color-error)', fontSize:16, fontWeight:600, padding: 4 }}>×</button>
                        )}
                      </div>
                    </div>

                    <p style={{ lineHeight: 1.6, fontSize: 15, color: '#444', marginBottom: 20 }}>{post.content}</p>

                    {/* Image placeholder */}
                    <div style={{ width: '100%', height: 220, background: 'var(--color-surface)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' }}>
                      <img src={placeholderImage} alt="Post image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Interaction Buttons */}
                    <div style={{ display: 'flex', gap: 24, padding: '12px 0 0', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>🤍 1.2k</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>💬 48</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginLeft: 'auto' }}>↗ Share</span>
                    </div>
                  </div>
                  );
                })}
              </div>
              {hasMore && (
                <div style={{ textAlign:'center', marginTop: 32 }}>
                  <button className="btn btn-outline" style={{ background: '#fff' }} onClick={() => { const o = offset + 20; setOffset(o); loadPosts(o); }}>
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
