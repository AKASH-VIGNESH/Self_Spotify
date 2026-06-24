import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Play, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LikedSongs() {
  const { library, likedSongs, playAlbum } = useContext(PlayerContext);
  const navigate = useNavigate();

  const allSongs = library.flatMap(movie => 
    movie.songs.map(song => ({ ...song, movieName: movie.name }))
  );

  const likedSongsList = allSongs.filter(song => likedSongs.includes(song.fileName));

  const handlePlaySong = (song) => {
    const movie = library.find(m => m.name === song.movieName);
    if (movie) {
      const songIndex = movie.songs.findIndex(s => s.fileName === song.fileName);
      playAlbum(movie.name, movie.songs, songIndex !== -1 ? songIndex : 0);
      navigate('/player');
    }
  };

  return (
    <div className="search-view library-view" style={{ paddingTop: '24px' }}>
      <div className="top-bar" style={{ padding: '0 0 24px 0', justifyContent: 'flex-start' }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={28} /></button>
      </div>
      
      <h2 className="library-header" style={{ marginBottom: '24px' }}>Liked Songs</h2>

      <div className="search-results">
        {likedSongsList.length === 0 ? (
          <div className="search-empty-state">
            <p>You haven't liked any songs yet.</p>
          </div>
        ) : (
          <div className="song-list">
            {likedSongsList.map((song, index) => (
              <div key={index} className="song-list-item" onClick={() => handlePlaySong(song)}>
                <img 
                  src={`/api/art?movie=${encodeURIComponent(song.movieName)}&file=${encodeURIComponent(song.fileName)}`} 
                  alt={song.title} 
                  className="song-list-art"
                  onError={(e) => { e.target.src = 'https://placehold.co/100x100/2e303a/ffffff?text=Art' }}
                />
                <div className="song-list-info">
                  <h4 className="song-list-title">{song.title}</h4>
                  <p className="song-list-artist">{song.artist || song.movieName}</p>
                </div>
                <button className="song-list-play"><Play size={20} fill="currentColor" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
