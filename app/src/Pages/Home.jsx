import { useContext, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Menu, Settings, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-coverflow';

export default function Home() {
  const { library, startSleepTimer, cancelSleepTimer, isSleepTimerActive, playHistory, featuredPlaylistId, playlists, playAlbum } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleViewAlbum = (movie) => {
    navigate(`/album/${encodeURIComponent(movie.name)}`);
  };

  let carouselItems = [];
  let carouselTitle = '';
  let isSongCarousel = false;

  const featuredPlaylist = playlists.find(p => p.id === featuredPlaylistId);

  if (featuredPlaylist && featuredPlaylist.songs.length > 0) {
    carouselItems = featuredPlaylist.songs;
    carouselTitle = `Featured: ${featuredPlaylist.name}`;
    isSongCarousel = true;
  } else {
    // Calculate most played songs
    const allSongs = library.flatMap(movie => movie.songs.map(s => ({ ...s, movieName: movie.name })));
    const sortedSongs = allSongs.sort((a, b) => {
      const keyA = `${a.movieName || a.movie}/${a.fileName}`;
      const keyB = `${b.movieName || b.movie}/${b.fileName}`;
      const playsA = playHistory[keyA] || 0;
      const playsB = playHistory[keyB] || 0;
      return playsB - playsA;
    });
    
    const topPlayed = sortedSongs.filter(s => {
      const key = `${s.movieName || s.movie}/${s.fileName}`;
      return (playHistory[key] || 0) > 0;
    }).slice(0, 10);

    if (topPlayed.length > 0) {
      carouselItems = topPlayed;
      carouselTitle = 'Most Played';
      isSongCarousel = true;
    } else {
      carouselItems = library.slice(0, 5);
      carouselTitle = 'Recently Added';
      isSongCarousel = false;
    }
  }

  const handlePlayCarouselSong = (index) => {
    playAlbum(carouselTitle, carouselItems, index);
  };

  const allArtistsMap = new Map();
  library.forEach(movie => {
    if(movie.songs) {
      movie.songs.forEach(song => {
        if (song.artist && song.artist !== 'Unknown Artist') {
          // Split combined artists
          const splitArtists = song.artist.split(/,|;|&|\//);
          splitArtists.forEach(a => {
            const rawName = a.trim();
            if (rawName && rawName.toLowerCase() !== 'unknown artist') {
              const lowerName = rawName.toLowerCase();
              if (!allArtistsMap.has(lowerName)) {
                allArtistsMap.set(lowerName, rawName);
              }
            }
          });
        }
      });
    }
  });
  const artists = Array.from(allArtistsMap.values()).sort();

  // Function to generate a unique color based on string hash
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      // Keep colors somewhat bright by OR-ing with 0x40
      color += ('00' + (value | 0x40).toString(16)).slice(-2);
    }
    return color;
  };

  return (
    <div className="library-view">
      <div className="top-bar" style={{ padding: '0 0 24px 0', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/hermit_logo.png" alt="Hermit" style={{ height: '40px', borderRadius: '12px' }} />
        
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ color: 'var(--text-primary)' }}>
            <Menu size={28} />
          </button>
          
          {showMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-secondary)', padding: '8px', borderRadius: '12px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: '180px', marginTop: '8px' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderRadius: '8px', color: 'var(--text-primary)' }}
                onClick={() => { alert('Settings coming soon!'); setShowMenu(false); }}
                className="menu-item-hover"
              >
                <Settings size={20} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Settings</span>
              </div>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderRadius: '8px', color: 'var(--text-primary)' }}
                onClick={() => {
                  setShowMenu(false);
                  if (isSleepTimerActive) {
                    cancelSleepTimer();
                    alert('Sleep timer cancelled.');
                  } else {
                    const mins = prompt('Enter sleep timer duration in minutes:', '60');
                    if (mins && !isNaN(mins) && Number(mins) > 0) {
                      startSleepTimer(Number(mins));
                      alert(`Sleep timer set for ${mins} minute(s).`);
                    }
                  }
                }}
                className="menu-item-hover"
              >
                <Timer size={20} color={isSleepTimerActive ? 'var(--accent)' : 'currentColor'} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: isSleepTimerActive ? 'var(--accent)' : 'inherit' }}>
                  {isSleepTimerActive ? 'Cancel Sleep Timer' : 'Sleep Timer'}
                </span>
              </div>
            </div>
          )}
        </div>
        <style>{`.menu-item-hover:hover { background: rgba(255, 255, 255, 0.1); }`}</style>
      </div>

      <h2 className="library-header" style={{ marginBottom: '16px' }}>{carouselTitle}</h2>
      <div className="carousel-section">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: true,
          }}
          modules={[EffectCoverflow]}
          className="recently-added-swiper"
        >
          {carouselItems.map((item, index) => (
            <SwiperSlide key={index} onClick={() => isSongCarousel ? handlePlayCarouselSong(index) : handleViewAlbum(item)}>
              <div className="swiper-slide-inner" style={{ position: 'relative' }}>
                <img 
                  src={isSongCarousel 
                    ? `/api/art?movie=${encodeURIComponent(item.movieName || item.movie)}&file=${encodeURIComponent(item.fileName)}`
                    : `/api/art?movie=${encodeURIComponent(item.name)}&file=${encodeURIComponent(item.songs?.[0]?.fileName || '')}`
                  } 
                  alt={isSongCarousel ? item.title : item.name} 
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400/2e303a/ffffff?text=' + (isSongCarousel ? 'Song' : 'Album') }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', color: 'white' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isSongCarousel ? item.title : item.name}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isSongCarousel ? (item.artist || item.movie || item.movieName) : `${item.songs.length} Tracks`}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <h2 className="library-header">Playlist and Albums</h2>

      <div className="album-grid">
        {library.map((movie, index) => (
          <div key={index} className="album-card" onClick={() => handleViewAlbum(movie)}>
            <img 
              src={`/api/art?movie=${encodeURIComponent(movie.name)}&file=${encodeURIComponent(movie.songs?.[0]?.fileName || '')}`} 
              alt={movie.name} 
              onError={(e) => { e.target.src = 'https://placehold.co/400x400/2e303a/ffffff?text=Album' }}
            />
            <div className="album-info">
              <h3 className="album-name">{movie.name}</h3>
              <p className="album-desc">{movie.songs.length} Tracks</p>
            </div>
          </div>
        ))}
      </div>

      {artists.length > 0 && (
        <>
          <h2 className="library-header" style={{ marginTop: '32px' }}>Artists</h2>
          <div className="artist-grid">
            {artists.map((artist, index) => (
              <div key={index} className="artist-card" onClick={() => navigate(`/artist/${encodeURIComponent(artist)}`)}>
                <div className="artist-avatar" style={{ background: stringToColor(artist) }}>
                  {artist.charAt(0).toUpperCase()}
                </div>
                <div className="artist-name">{artist}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}