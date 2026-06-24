import { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { Play, ChevronLeft, Trash2, Edit2, Plus, Search as SearchIcon, Image as ImageIcon } from 'lucide-react';
import './Album.css';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { library, playlists, playAlbum, removeSongFromPlaylist, renamePlaylist, updatePlaylistCover, addSongToPlaylist, featuredPlaylistId, setFeaturedPlaylistId } = useContext(PlayerContext);

  const [showAddSongs, setShowAddSongs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="album-view library-view" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2>Playlist not found</h2>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: 'var(--accent)', borderRadius: '20px', marginTop: '20px', color: 'white', fontWeight: 'bold' }}>
          Go Back
        </button>
      </div>
    );
  }

  const handlePlaySong = (index) => {
    playAlbum(playlist.name, playlist.songs, index);
  };

  const handleRename = () => {
    const newName = prompt("Enter new name for playlist:", playlist.name);
    if (newName && newName.trim() && newName !== playlist.name) {
      renamePlaylist(playlist.id, newName.trim());
    }
  };

  const handleRemoveSong = (e, fileName) => {
    e.stopPropagation();
    if(confirm("Remove this song from the playlist?")) {
      removeSongFromPlaylist(playlist.id, fileName);
    }
  };

  const handleUpdateCover = () => {
    const newCover = prompt("Enter Image URL for playlist cover:", playlist.coverUrl || '');
    if (newCover !== null) {
      updatePlaylistCover(playlist.id, newCover.trim());
    }
  };

  const handleAddSong = (e, song, movieName) => {
    e.stopPropagation();
    if (playlist.songs.some(s => s.fileName === song.fileName)) {
      setToastMessage('Already in playlist!');
    } else {
      addSongToPlaylist(playlist.id, { ...song, movie: movieName });
      setToastMessage('Added to playlist!');
    }
    setTimeout(() => setToastMessage(''), 3000);
  };

  const allSongs = library.flatMap(movie => movie.songs.map(s => ({ ...s, movieName: movie.name })));
  const filteredSongs = allSongs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.artist && s.artist.toLowerCase().includes(searchQuery.toLowerCase())) || 
    s.movieName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50); // limit to 50 to avoid performance issues

  let coverSrc = null;
  if (playlist.coverUrl) {
    coverSrc = playlist.coverUrl;
  } else if (playlist.songs.length > 0) {
    coverSrc = `/api/art?movie=${encodeURIComponent(playlist.songs[0].movie)}&file=${encodeURIComponent(playlist.songs[0].fileName)}`;
  }

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

      <div className="album-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}> 
        <div 
          style={{ width: '120px', height: '120px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--glass-shadow)', overflow: 'hidden', flexShrink: 0, position: 'relative', cursor: 'pointer' }}
          onClick={handleUpdateCover}
          title="Edit Playlist Cover"
        >
           {coverSrc ? (
             <img 
               src={coverSrc} 
               alt={playlist.name} 
               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
               onError={(e) => { e.target.src = 'https://placehold.co/400x400/2e303a/ffffff?text=Playlist' }}
             />
           ) : (
             <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Empty</span>
           )}
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="playlist-cover-overlay">
             <ImageIcon size={32} color="white" />
           </div>
        </div>
        
        <style>{`.playlist-cover-overlay:hover { opacity: 1 !important; }`}</style>

        <div className="album-header-info" style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ margin: 0 }}>{playlist.name}</h2>
            <button onClick={handleRename} style={{ color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
            <button 
              onClick={() => {
                if (featuredPlaylistId === playlist.id) {
                  setFeaturedPlaylistId(null);
                  setToastMessage('Removed from Home Carousel');
                } else {
                  setFeaturedPlaylistId(playlist.id);
                  setToastMessage('Featured on Home Carousel');
                }
                setTimeout(() => setToastMessage(''), 3000);
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: featuredPlaylistId === playlist.id ? 'var(--accent)' : 'transparent', 
                border: featuredPlaylistId === playlist.id ? 'none' : '1px solid var(--text-secondary)', 
                padding: '4px 12px', 
                borderRadius: '16px', 
                color: featuredPlaylistId === playlist.id ? 'white' : 'var(--text-secondary)', 
                fontWeight: 'bold', 
                fontSize: '12px', 
                cursor: 'pointer' 
              }}
            >
              {featuredPlaylistId === playlist.id ? '★ Featured in Carousel' : '☆ Show in Carousel'}
            </button>
          </div>
          <p style={{ margin: 0 }}>{playlist.songs.length} Tracks</p>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setShowAddSongs(!showAddSongs)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '20px', color: 'var(--text-primary)', fontWeight: 'bold' }}
          >
            <Plus size={20} />
            Add Songs
          </button>
          
          {playlist.songs.length > 0 && (
            <button 
              onClick={() => handlePlaySong(0)}
              style={{ background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}
            >
              <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
            </button>
          )}
        </div>
      </div>

      {showAddSongs && (
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '10px 16px', borderRadius: '20px', marginBottom: '16px' }}>
            <SearchIcon size={20} color="var(--text-secondary)" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Search for songs to add..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
            />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredSongs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No songs found.</p>
            ) : (
              filteredSongs.map((song, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{song.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{song.artist || song.movieName}</p>
                  </div>
                  <button 
                    onClick={(e) => handleAddSong(e, song, song.movieName)}
                    style={{ background: 'transparent', color: 'var(--accent)', padding: '8px' }}
                  >
                    <Plus size={24} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="album-songs">
        {playlist.songs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Add songs using the button above.</p>
        ) : (
          playlist.songs.map((song, index) => (
            <div key={index} className="album-song-item" onClick={() => handlePlaySong(index)}>
              <div className="song-index">{index + 1}</div>
              <div className="song-info">
                <h4 className="song-title">{song.title}</h4>
                <p className="song-artist">{song.artist || song.movie}</p>
              </div>
              
              <button 
                onClick={(e) => handleRemoveSong(e, song.fileName)}
                style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '8px', marginRight: '8px', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={20} />
              </button>

              <button className="song-play-btn" onClick={(e) => { e.stopPropagation(); handlePlaySong(index); }}>
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
