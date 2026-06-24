import { useContext, useState, useMemo } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Search as SearchIcon, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

function Search() {
  const { library, playAlbum } = useContext(PlayerContext);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const allSongs = useMemo(() => {
    return library.flatMap(movie => 
      movie.songs.map(song => ({
        ...song,
        movieName: movie.name
      }))
    );
  }, [library]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allSongs.filter(song => 
      song.title.toLowerCase().includes(lowerQuery) || 
      (song.artist && song.artist.toLowerCase().includes(lowerQuery)) ||
      song.movieName.toLowerCase().includes(lowerQuery)
    );
  }, [query, allSongs]);

  const handlePlaySong = (song) => {
    const movie = library.find(m => m.name === song.movieName);
    if (movie) {
      const songIndex = movie.songs.findIndex(s => s.fileName === song.fileName);
      playAlbum(movie.name, movie.songs, songIndex !== -1 ? songIndex : 0);
      navigate('/');
    }
  };

  return (
    <div className="search-view library-view">
      <div className="search-header">
        <h2 className="library-header" style={{ marginBottom: '16px' }}>Search</h2>
        <div className="search-input-container">
          <SearchIcon size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="search-results">
        {query.trim() === '' ? (
          <div className="search-empty-state">
            <p>Search for songs, artists, or albums</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="search-empty-state">
            <p>No results found for "{query}"</p>
          </div>
        ) : (
          <div className="song-list">
            {searchResults.map((song, index) => (
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

export default Search;