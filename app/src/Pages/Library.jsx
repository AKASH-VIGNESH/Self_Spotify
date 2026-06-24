import { Menu, Heart, ListMusic, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const navigate = useNavigate();

  return (
    <div className="library-view">
      <div className="top-bar" style={{ padding: '0 0 24px 0', justifyContent: 'flex-end' }}>
        <button><Menu size={28} /></button>
      </div>

      <h2 className="library-header" style={{ marginBottom: '32px' }}>Your Library</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', cursor: 'pointer' }}
          onClick={() => navigate('/library/liked')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #450af5, #c4efd9)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px' }}>
            <Heart size={24} fill="white" color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Liked Songs</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Your favorite tracks</p>
          </div>
          <ChevronRight size={24} color="var(--text-secondary)" />
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', cursor: 'pointer' }}
          onClick={() => navigate('/library/playlists')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px' }}>
            <ListMusic size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Playlists</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Your custom mixes</p>
          </div>
          <ChevronRight size={24} color="var(--text-secondary)" />
        </div>
      </div>
    </div>
  );
}