import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Play, Pause, SkipForward } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MiniPlayer.css';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong } = useContext(PlayerContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentSong || location.pathname === '/player') {
    return null;
  }

  const handleMiniPlayerClick = (e) => {
    // Only navigate if we didn't click a button
    if (e.target.closest('.mini-player-controls')) return;
    navigate('/player');
  };

  return (
    <div className="mini-player" onClick={handleMiniPlayerClick}>
      <img 
        src={`/api/art?movie=${encodeURIComponent(currentSong.movie)}&file=${encodeURIComponent(currentSong.fileName)}`} 
        alt={currentSong.title} 
        className="mini-player-art"
        onError={(e) => { e.target.src = 'https://placehold.co/100x100/2e303a/ffffff?text=Art' }}
      />
      
      <div className="mini-player-info">
        <div className="mini-player-title">{currentSong.title}</div>
        <div className="mini-player-artist">{currentSong.artist || currentSong.movie}</div>
      </div>

      <div className="mini-player-controls">
        <button className="mini-control-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <button className="mini-control-btn" onClick={(e) => { e.stopPropagation(); nextSong(); }}>
          <SkipForward size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
