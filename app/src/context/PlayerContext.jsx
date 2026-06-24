import { createContext, useState, useEffect, useRef } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [library, setLibrary] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState(false);
  
  const [isSleepTimerActive, setIsSleepTimerActive] = useState(false);
  const [showAsleepPrompt, setShowAsleepPrompt] = useState(false);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const sleepTimerRef = useRef(null);
  const promptTimerRef = useRef(null);

  const [likedSongs, setLikedSongs] = useState(() => {
    const saved = localStorage.getItem('likedSongs');
    return saved ? JSON.parse(saved) : [];
  });
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('playlists');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [playHistory, setPlayHistory] = useState(() => {
    const saved = localStorage.getItem('playHistory');
    return saved ? JSON.parse(saved) : {};
  });

  const [featuredPlaylistId, setFeaturedPlaylistId] = useState(() => {
    return localStorage.getItem('featuredPlaylistId') || null;
  });

  useEffect(() => {
    if (featuredPlaylistId) {
      localStorage.setItem('featuredPlaylistId', featuredPlaylistId);
    } else {
      localStorage.removeItem('featuredPlaylistId');
    }
  }, [featuredPlaylistId]);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('app-theme', 'dark');
  }, []);

  useEffect(() => {
    fetch('/api/library')
      .then(res => res.json())
      .then(data => setLibrary(data))
      .catch(err => console.error("Failed to load library", err));
  }, []);

  const currentSong = currentSongIndex >= 0 ? queue[currentSongIndex] : null;

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => {
       // if duration is finite use it, else fallback to metadata if possible (flac duration sometimes takes time)
       if(Number.isFinite(audio.duration)) {
           setDuration(audio.duration);
       }
    };
    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSongIndex, queue, repeat]);

  useEffect(() => {
    if (currentSong) {
      // Set duration from metadata first as fallback since FLAC duration calculation can be slow in browser
      if (currentSong.duration) {
          setDuration(currentSong.duration);
      }
      audioRef.current.src = `/@fs/D:/songs/${encodeURIComponent(currentSong.movie)}/${encodeURIComponent(currentSong.fileName)}`;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
      
      // Track play count
      const songKey = `${currentSong.movie}/${currentSong.fileName}`;
      setPlayHistory(prev => {
        const newHistory = { ...prev, [songKey]: (prev[songKey] || 0) + 1 };
        localStorage.setItem('playHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying && currentSong) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const playAlbum = (movieName, songs, startIndex = 0) => {
    setQueue(songs);
    setCurrentSongIndex(startIndex);
    setIsPlaying(true);
  };

  const nextSong = () => {
    if (currentSongIndex < queue.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const prevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }
  };

  const togglePlay = () => {
      if(currentSong) setIsPlaying(prev => !prev);
  }

  const seek = (time) => {
    if (Number.isFinite(time)) {
        audioRef.current.currentTime = time;
        setProgress(time);
    }
  };

  const toggleRepeat = () => setRepeat(prev => !prev);

  const startSleepTimer = (minutes) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    
    setIsSleepTimerActive(true);
    setShowAsleepPrompt(false);
    setIsSleepMode(false);

    sleepTimerRef.current = setTimeout(() => {
      setIsPlaying(false);
      setShowAsleepPrompt(true);
      
      promptTimerRef.current = setTimeout(() => {
        setIsSleepMode(true);
        setShowAsleepPrompt(false);
        try {
          window.close();
        } catch (e) {
          console.error(e);
        }
      }, 60000); // Wait 1 minute for response
    }, minutes * 60000);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    setIsSleepTimerActive(false);
    setShowAsleepPrompt(false);
    setIsSleepMode(false);
  };

  const toggleLikeSong = (fileName) => {
    setLikedSongs(prev => {
      const newLiked = prev.includes(fileName) 
        ? prev.filter(f => f !== fileName) 
        : [...prev, fileName];
      localStorage.setItem('likedSongs', JSON.stringify(newLiked));
      return newLiked;
    });
  };

  const createPlaylist = (name) => {
    setPlaylists(prev => {
      const newPlaylists = [...prev, { id: Date.now().toString(), name, songs: [] }];
      localStorage.setItem('playlists', JSON.stringify(newPlaylists));
      return newPlaylists;
    });
  };

  const addSongToPlaylist = (playlistId, songData) => {
    setPlaylists(prev => {
      const newPlaylists = prev.map(p => {
        if (p.id === playlistId) {
          if (p.songs.some(s => s.fileName === songData.fileName)) return p;
          return { ...p, songs: [...p.songs, songData] };
        }
        return p;
      });
      localStorage.setItem('playlists', JSON.stringify(newPlaylists));
      return newPlaylists;
    });
  };

  const removePlaylist = (playlistId) => {
    setPlaylists(prev => {
      const newPlaylists = prev.filter(p => p.id !== playlistId);
      localStorage.setItem('playlists', JSON.stringify(newPlaylists));
      return newPlaylists;
    });
  };

  const removeSongFromPlaylist = (playlistId, fileName) => {
    setPlaylists(prev => {
      const newPlaylists = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, songs: p.songs.filter(s => s.fileName !== fileName) };
        }
        return p;
      });
      localStorage.setItem('playlists', JSON.stringify(newPlaylists));
      return newPlaylists;
    });
  };

  const renamePlaylist = (playlistId, newName) => {
    setPlaylists(prev => {
      const newPlaylists = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, name: newName };
        }
        return p;
      });
      localStorage.setItem('playlists', JSON.stringify(newPlaylists));
      return newPlaylists;
    });
  };

  const updatePlaylistCover = (playlistId, coverUrl) => {
    setPlaylists(prev => {
      const newPlaylists = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, coverUrl };
        }
        return p;
      });
      localStorage.setItem('playlists', JSON.stringify(newPlaylists));
      return newPlaylists;
    });
  };

  return (
    <PlayerContext.Provider value={{
      library,
      queue,
      currentSong,
      isPlaying,
      progress,
      duration,
      repeat,
      playAlbum,
      nextSong,
      prevSong,
      togglePlay,
      seek,
      toggleRepeat,
      likedSongs,
      toggleLikeSong,
      playlists,
      createPlaylist,
      addSongToPlaylist,
      removePlaylist,
      removeSongFromPlaylist,
      renamePlaylist,
      updatePlaylistCover,
      isSleepTimerActive,
      showAsleepPrompt,
      isSleepMode,
      startSleepTimer,
      cancelSleepTimer,
      setIsPlaying,
      playHistory,
      featuredPlaylistId,
      setFeaturedPlaylistId
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
