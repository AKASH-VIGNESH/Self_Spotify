import { useContext, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Heart, ChevronDown, MoreVertical, Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatTime = (time) => {
  if (isNaN(time) || !isFinite(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function PlayerView() {
  const { currentSong, isPlaying, togglePlay, progress, duration, seek, nextSong, prevSong, repeat, toggleRepeat, queue, likedSongs, toggleLikeSong } = useContext(PlayerContext);
  const [showQueue, setShowQueue] = useState(false);
  const navigate = useNavigate();

  if (!currentSong) {
    return (
      <div className="player-view" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2>No song playing</h2>
        <button onClick={() => navigate('/library')} style={{ padding: '10px 20px', background: 'var(--accent)', borderRadius: '20px', marginTop: '20px', color: 'white', fontWeight: 'bold' }}>
          Go to Library
        </button>
      </div>
    );
  }

  return (
    <div className="player-view">
      <div className="top-bar" style={{ padding: '24px 0' }}>
        <button onClick={() => navigate(-1)}><ChevronDown size={28} /></button>
        <button><MoreVertical size={24} /></button>
      </div>

      <div className="album-art-container">
        <img 
          src={`/api/art?movie=${encodeURIComponent(currentSong.movie)}&file=${encodeURIComponent(currentSong.fileName)}`} 
          alt="Album Art" 
          className="album-art-img"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/2e303a/ffffff?text=No+Cover' }}
        />
        
        <div className={`lyrics-sheet ${showQueue ? '' : 'hidden'}`}>
          <div className="lyrics-title">Up Next</div>
          <div className="lyrics-content">
            {queue.map((song, index) => (
              <div key={index} style={{ marginBottom: '12px', opacity: song.fileName === currentSong.fileName ? 1 : 0.6, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold' }}>{song.title}</span>
                <span style={{ fontSize: '12px' }}>{song.artist}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="song-info">
        <h2 className="song-title">{currentSong.title}</h2>
        <p className="song-artist">{currentSong.artist || currentSong.movie}</p>
      </div>

      <div className="progress-container">
        <input 
          type="range" 
          className="progress-bar" 
          min={0} 
          max={duration || 100} 
          value={progress || 0} 
          onChange={(e) => seek(Number(e.target.value))}
        />
        <div className="time-info">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <button className="control-btn" onClick={() => toggleLikeSong(currentSong.fileName)}>
          <Heart size={24} fill={likedSongs.includes(currentSong.fileName) ? "var(--accent)" : "transparent"} color={likedSongs.includes(currentSong.fileName) ? "var(--accent)" : "currentColor"} />
        </button>
        <button className="control-btn" onClick={prevSong}><SkipBack size={32} fill="currentColor" /></button>
        <button className="play-pause-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" style={{marginLeft: '4px'}} />}
        </button>
        <button className="control-btn" onClick={nextSong}><SkipForward size={32} fill="currentColor" /></button>
        <button className="control-btn" onClick={toggleRepeat} style={{ color: repeat ? 'var(--accent)' : 'inherit' }}><Repeat size={24} /></button>
      </div>

      <div className="queue-handle" onClick={() => setShowQueue(!showQueue)}>
        <div className="handle-bar"></div>
        <span className="queue-text">Your Queue</span>
      </div>
    </div>
  );
}
