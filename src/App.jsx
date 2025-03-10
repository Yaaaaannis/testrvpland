import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import videosData from './data/videos.json'
import gsap from 'gsap'

import './App.css'
import Header from './components/Header'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [player, setPlayer] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isVolumeControlVisible, setIsVolumeControlVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videosData.videos[currentVideoIndex];
  const [isTransitioning, setIsTransitioning] = useState(false);
  const artistRef = useRef(null);
  const titleRef = useRef(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const ytPlayer = new window.YT.Player('youtube-player', {
        videoId: currentVideo.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
          loop: 0,
          playlist: currentVideo.id,
          playsinline: 1,
          vq: 'hd1080'
        },
        events: {
          onReady: (event) => {
            event.target.setPlaybackQuality('hd1080');
            setPlayer(event.target);
          },
          onStateChange: (event) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              handleNext();
            }
          }
        }
      });
    };
  }, [currentVideoIndex]);

  useLayoutEffect(() => {
    const createSprayEffect = (element) => {
      const text = element.textContent;
      element.innerHTML = '';
      element.style.whiteSpace = 'pre';
      
      const chars = text.split('').map(char => {
        const span = document.createElement('span');
        if (char === ' ') {
          span.innerHTML = '&nbsp;';
        } else {
          span.textContent = char;
        }
        span.style.display = 'inline-block';
        element.appendChild(span);
        return span;
      });

      const animateChar = (char) => {
        const willHavePermEffect = Math.random() < 0.4;
        const pauseDuration = gsap.utils.random(2, 4);
        
        gsap.to(char, {
          filter: 'blur(8px)',
          opacity: 0.7,
          duration: 0.5,
          repeat: 3,
          yoyo: true,
          ease: 'power1.inOut',
          delay: Math.random() * 2,
          onComplete: () => {
            // Période statique
            gsap.to(char, {
              filter: willHavePermEffect ? 'blur(5px)' : 'blur(0px)',
              opacity: willHavePermEffect ? 0.85 : 1,
              duration: 0.5,
              onComplete: () => {
                // Relance l'animation après la pause
                gsap.delayedCall(pauseDuration, () => animateChar(char));
              }
            });
          }
        });

        gsap.to(char, {
          x: 'random(-3, 3)',
          y: 'random(-3, 3)',
          duration: 0.5,
          repeat: 3,
          yoyo: true,
          ease: 'none',
          delay: Math.random() * 2,
          onComplete: () => {
            gsap.to(char, {
              x: willHavePermEffect ? gsap.utils.random(-2, 2) : 0,
              y: willHavePermEffect ? gsap.utils.random(-2, 2) : 0,
              duration: 0.5
            });
          }
        });
      };

      chars.forEach(animateChar);
    };

    if (artistRef.current && titleRef.current) {
      createSprayEffect(artistRef.current);
      createSprayEffect(titleRef.current);
    }
  }, [currentVideo]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '') return '.';
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '';
        });
      }, 600);

      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [isPlaying]);

  const handleStart = () => {
    if (player) {
      player.playVideo();
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
      if (newVolume === 0) {
        player.mute();
        setIsMuted(true);
      } else if (isMuted) {
        player.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleMuteToggle = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(volume);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  
  const handleNext = () => {
    if (player && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        player.stopVideo();
        setCurrentVideoIndex((prevIndex) => {
          const newIndex = prevIndex === videosData.videos.length - 1 ? 0 : prevIndex + 1;
          player.loadVideoById(videosData.videos[newIndex].id);
          return newIndex;
        });
        setIsPlaying(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }, 1000);
    }
  };

  const handlePrev = () => {
    if (player && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        player.stopVideo();
        setCurrentVideoIndex((prevIndex) => {
          const newIndex = prevIndex === 0 ? videosData.videos.length - 1 : prevIndex - 1;
          player.loadVideoById(videosData.videos[newIndex].id);
          return newIndex;
        });
        setIsPlaying(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }, 1000);
    }
  };


  return (
    <div className="relative min-h-screen">
      {/* Add transition overlay */}
      <div className={`fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-1000 ${
        isTransitioning ? 'opacity-100' : 'opacity-0'
      }`}></div>

      {/* Video Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="relative w-[300%] h-[300%] -left-[100%] -top-[100%]">
          <div 
            id="youtube-player"
            className="absolute w-full h-full"
          ></div>
        </div>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black font-sans" >
          <button
            onClick={handleStart}
            className="text-white text-2xl hover:text-gray-300 transition-colors"
          >
            Appuyez pour commencer
          </button>
        </div>
      )}
      

      {/* Navigation Bars */}
      <div className="fixed inset-y-0 left-0 w-24 flex flex-col items-center justify-center z-20 mt-100">
        <div className="flex flex-col items-start">
          <div className="h-[3px] w-128 bg-white mb-4"></div>
          <button 
            onClick={handlePrev}
            className="text-white hover:text-[#FCC200] transition-colors whitespace-nowrap ml-114 text-xl hover:cursor-pointer"
          >
            PREV
          </button>
        </div>
      </div>

      <div className="fixed inset-y-0 right-0 w-24 flex flex-col items-center justify-center z-20 mt-100">
        <div className="flex flex-col items-end">
          <div className="h-[3px] w-128 bg-white mb-4"></div>
          <button className="text-white hover:text-[#FCC200] transition-colors whitespace-nowrap mr-114 text-xl hover:cursor-pointer"
            onClick={handleNext}
          >
            NEXT
          </button>
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 
            ref={artistRef}
            className="text-6xl mb-8 font-staatliches relative mix-blend-difference"
            style={{ 
              display: 'inline-block',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {currentVideo.artist}
          </h1>
          <div className="w-12 h-1.5 bg-white mx-auto mb-8"></div>
          <h2 
            ref={titleRef}
            className="text-6xl font-staatliches relative mix-blend-difference"
            style={{ 
              display: 'inline-block',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {currentVideo.title}
          </h2>
        </div>
      </div>

      {/* Volume Control */}
      {!isLoading && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4"
          onMouseEnter={() => setIsVolumeControlVisible(true)}
          onMouseLeave={() => setIsVolumeControlVisible(false)}
        >
          <div className="text-white text-sm">VOLUME</div>
          {/* Volume Bars */}
          <div className={`
            flex gap-[2px] items-end h-4
            ${isVolumeControlVisible ? 'w-32 opacity-100' : 'w-0 opacity-0'}
            transition-all duration-300 overflow-hidden
          `}>
            {[...Array(10)].map((_, index) => {
              const barHeight = ((index + 1) / 10) * 100;
              const isActive = (volume / 10) > index;
              return (
                <div
                  key={index}
                  className={`w-2 cursor-pointer transition-colors duration-200 ${
                    isActive ? 'bg-[#FCC200]' : 'bg-white/30'
                  }`}
                  style={{ height: `${barHeight}%` }}
                  onClick={() => {
                    const newVolume = (index + 1) * 10;
                    setVolume(newVolume);
                    if (player) {
                      player.setVolume(newVolume);
                      if (newVolume === 0) {
                        player.mute();
                        setIsMuted(true);
                      } else if (isMuted) {
                        player.unMute();
                        setIsMuted(false);
                      }
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Mute/Unmute Button */}
          <button
            onClick={handleMuteToggle}
            className="text-white hover:text-[#FCC200] transition-colors"
          >
            {isMuted || volume === 0 ? 'MUTED' : ''}
          </button>
        </div>
      )}

      {/* Play/Pause Button */}
      {!isLoading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handlePlayPause}
            className=" p-3 rounded-full  transition-colors group hover:cursor-pointer"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white group-hover:text-[#FCC200] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white group-hover:text-[#FCC200] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Ajout du titre de la musique en cours de lecture */}
      {!isLoading && (
        <div className={`fixed bottom-6 left-6 z-50 transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className=" px-4 py-2 rounded-lg">
            <p className="text-[#FCC200] text-sm">
              {isPlaying ? (
                <span className="flex items-center gap-1">
                  Playing: {currentVideo.title + " - " + currentVideo.artist}
                  <span className="inline-block w-6">{dots}</span>
                </span>
              ) : (
                <span>Paused: {currentVideo.title + " - " + currentVideo.artist}</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
