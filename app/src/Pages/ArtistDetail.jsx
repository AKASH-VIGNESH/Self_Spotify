import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Play, ArrowLeft } from 'lucide-react';

export default function ArtistDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { library, playAlbum } = useContext(PlayerContext);
  
  const decodedName = decodeURIComponent(name);

  // Collect all songs by this artist
  const artistSongs = [];
  library.forEach(movie => {
    if (movie.songs) {
      movie.songs.forEach(song => {
        if (song.artist && song.artist !== 'Unknown Artist') {
          const splitArtists = song.artist.split(/,|;|&|\//).map(a => a.trim());
          // Check if this specific artist name is in the split list
          if (splitArtists.some(a => a.toLowerCase() === decodedName.toLowerCase())) {
            artistSongs.push(song);
          }
        }
      });
    }
  });

  // Calculate duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = artistSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const totalMins = Math.floor(totalDuration / 60);

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + (value | 0x40).toString(16)).slice(-2);
    }
    return color;
  };

  const handlePlayArtist = () => {
    if (artistSongs.length > 0) {
      playAlbum(`Artist: ${decodedName}`, artistSongs, 0);
    }
  };

  const handlePlaySong = (index) => {
    playAlbum(`Artist: ${decodedName}`, artistSongs, index);
  };

  return (
    <div className="album-detail-view" style={{ flex: 1, overflowY: 'auto', paddingBottom: '150px' }}>
      <div 
        className="album-header" 
        style={{ 
          padding: '40px 24px', 
          background: `linear-gradient(to bottom, ${stringToColor(decodedName)}88, var(--bg-primary))`,
          position: 'relative'
        }}
      >
        <button 
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
        >
          <ArrowLeft size={24} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          <div 
            style={{ 
              width: '180px', 
              height: '180px', 
              borderRadius: '50%', 
              background: stringToColor(decodedName), 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              fontSize: '80px', 
              fontWeight: 'bold', 
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              marginBottom: '24px'
            }}
          >
            {decodedName.charAt(0).toUpperCase()}
          </div>
          
          <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', textAlign: 'center' }}>{decodedName}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Artist • {artistSongs.length} Tracks • {totalMins} mins</p>
          
          <button 
            className="play-btn-large" 
            onClick={handlePlayArtist}
            style={{ marginTop: '24px', background: 'var(--accent)', border: 'none', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          >
            <Play fill="white" size={28} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </div>

      <div className="song-list" style={{ padding: '0 24px' }}>
        {artistSongs.map((song, index) => (
          <div 
            key={index} 
            className="song-list-item" 
            onClick={() => handlePlaySong(index)}
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
          >
            <img 
              src={`/api/art?movie=${encodeURIComponent(song.movie)}&file=${encodeURIComponent(song.fileName)}`} 
              alt={song.title} 
              style={{ width: '48px', height: '48px', borderRadius: '8px', marginRight: '16px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://placehold.co/100x100/2e303a/ffffff?text=Music' }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{song.movie}</div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '16px' }}>
              {formatDuration(song.duration)}
            </div>
          </div>
        ))}
        {artistSongs.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
            No songs found for this artist.
          </div>
        )}
      </div>
    </div>
  );
}
