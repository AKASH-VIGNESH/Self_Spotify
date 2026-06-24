import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom' 
import { PlayerProvider, PlayerContext } from './context/PlayerContext'
import Home from './Pages/Home'
import PlayerView from './components/PlayerView'
import Library from './Pages/Library'
import Search from './Pages/Search'
import Album from './Pages/Album'
import LikedSongs from './Pages/LikedSongs'
import Playlists from './Pages/Playlists'
import PlaylistDetail from './Pages/PlaylistDetail'
import ArtistDetail from './Pages/ArtistDetail'
import TabBar from './components/TabBar'
import MiniPlayer from './components/MiniPlayer'
import { useContext } from 'react'

function AppContent() {
  const { showAsleepPrompt, isSleepMode, cancelSleepTimer, setIsPlaying } = useContext(PlayerContext);

  if (isSleepMode) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'black', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <h1 style={{ marginBottom: '24px' }}>Sleep Mode</h1>
        <button 
          onClick={() => { cancelSleepTimer(); }}
          style={{ padding: '12px 24px', background: 'var(--accent)', color: 'white', borderRadius: '24px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Wake Up
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {showAsleepPrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', textAlign: 'center', maxWidth: '300px', boxShadow: '0 12px 32px rgba(0,0,0,0.8)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>Are you asleep?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>Music has been paused. The app will close shortly if there is no response.</p>
            <button 
              onClick={() => { cancelSleepTimer(); setIsPlaying(true); }}
              style={{ width: '100%', padding: '14px', background: 'var(--accent)', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              I'm awake!
            </button>
          </div>
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<PlayerView />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/liked" element={<LikedSongs />} />
          <Route path="/library/playlists" element={<Playlists />} />
          <Route path="/search" element={<Search />} />
          <Route path="/album/:name" element={<Album />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
          <Route path="/artist/:name" element={<ArtistDetail />} />
        </Routes>
        <MiniPlayer />
        <TabBar />
      </BrowserRouter>
    </div>
  )
}

function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  )
}

export default App