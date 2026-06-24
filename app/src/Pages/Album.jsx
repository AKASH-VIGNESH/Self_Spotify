import { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { Play, ChevronLeft, Plus } from 'lucide-react';
import './Album.css';

export default function Album() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { library, playAlbum, playlists, addSongToPlaylist } = useContext(PlayerContext);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  const [toastMessage, setToastMessage] = useState('');

  const album = library.find(m => m.name === name);

  if (!album) {
    return (
      <div className="album-view library-view" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2>Album not found</h2>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: 'var(--accent)', borderRadius: '20px', marginTop: '20px', color: 'white', fontWeight: 'bold' }}>
          Go Back
        </button>
      </div>
    );
  }

  const handlePlaySong = (index) => {
    playAlbum(album.name, album.songs, index);
    navigate('/');
  };

  const handleAddToPlaylist = (e, song, playlistId) => {
    e.stopPropagation();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist?.songs.some(s => s.fileName === song.fileName)) {
      setToastMessage('Already in playlist!');
    } else {
      addSongToPlaylist(playlistId, { ...song, movie: album.name });
      setToastMessage('Added to playlist!');
    }
    setShowPlaylistMenu(null);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="album-view library-view">
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '12px 24px', borderRadius: '24px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
          {toastMessage}
        </div>
      )}
      <div className="top-bar" style={{ padding: '0 0 24px 0', justifyContent: 'flex-start' }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={28} /></button>
      </div>

      <div className="album-header"> 
        <img 
          src={`/api/art?movie=${encodeURIComponent(album.name)}&file=${encodeURIComponent(album.songs?.[0]?.fileName || '')}`} 
          alt={album.name} 
          className="album-cover"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/2e303a/ffffff?text=Album' }}
        />
        <div className="album-header-info">
          <h2>{album.name}</h2>
          <p>{album.songs.length} Tracks</p>
        </div>
      </div>

      <div className="album-songs">
        {album.songs.map((song, index) => (
          <div key={index} className="album-song-item" onClick={() => handlePlaySong(index)}>
            <div className="song-index">{index + 1}</div>
            <div className="song-info">
              <h4 className="song-title">{song.title}</h4>
              <p className="song-artist">{song.artist || album.name}</p>
            </div>
            
            <div style={{ position: 'relative' }}>
              <button 
                className="song-add-btn" 
                onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(showPlaylistMenu === index ? null : index); }}
                style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '8px', marginRight: '8px', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={20} />
              </button>

              {showPlaylistMenu === index && (
                <div style={{ position: 'absolute', right: '0', top: '100%', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '8px', zIndex: 10, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  {playlists.length === 0 ? (
                    <div style={{ padding: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>No playlists</div>
                  ) : (
                    playlists.map(p => (
                      <div 
                        key={p.id} 
                        onClick={(e) => handleAddToPlaylist(e, song, p.id)}
                        style={{ padding: '8px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--bg-primary)' }}
                      >
                        {p.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="song-play-btn" onClick={(e) => { e.stopPropagation(); handlePlaySong(index); }}>
              <Play size={20} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
