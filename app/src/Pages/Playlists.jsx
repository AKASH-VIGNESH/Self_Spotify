import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { ChevronLeft, Plus, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Playlists() {
  const navigate = useNavigate();
  const { playlists, createPlaylist, removePlaylist, playAlbum } = useContext(PlayerContext);

  const handleCreatePlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs.length > 0) {
      playAlbum(playlist.name, playlist.songs, 0);
    } else {
      alert("This playlist is empty.");
    }
  };

  const handleViewPlaylist = (playlist) => {
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <div className="library-view" style={{ paddingTop: '24px' }}>
      <div className="top-bar" style={{ padding: '0 0 24px 0', justifyContent: 'flex-start' }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={28} /></button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="library-header" style={{ marginBottom: 0 }}>Playlists</h2>
        <button onClick={handleCreatePlaylist} style={{ color: 'var(--accent)' }}><Plus size={24} /></button>
      </div>

      {playlists.length === 0 ? (
        <div className="search-empty-state">
          <p>No playlists created yet.</p>
        </div>
      ) : (
        <div className="playlist-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playlists.map((playlist) => (
            <div key={playlist.id} className="album-song-item" style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}>
              <div className="song-info" onClick={() => handleViewPlaylist(playlist)} style={{ cursor: 'pointer', flex: 1 }}>
                <h4 className="song-title">{playlist.name}</h4>
                <p className="song-artist">{playlist.songs.length} Tracks</p>
              </div>
              <button 
                onClick={() => handlePlayPlaylist(playlist)}
                style={{ background: 'var(--accent)', color: 'white', borderRadius: '50%', padding: '8px', marginRight: '10px', display: 'flex', alignItems: 'center' }}
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button onClick={() => removePlaylist(playlist.id)} style={{ color: 'var(--text-secondary)', padding: '8px', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
