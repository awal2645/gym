import React, { useState, useRef, useEffect } from 'react';

const isMobile = () => typeof window !== 'undefined' && (window.innerWidth < 640 || 'ontouchstart' in window);

export default function VideoPlayer({ src, className = '', controls = true, autoPlay = false, previewOnly = false }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [mobile, setMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const controlsTimeoutRef = useRef(null);

    useEffect(() => {
        setMobile(isMobile());
        const check = () => setMobile(isMobile());
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleVolumeChange = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);
        const handleError = () => setIsLoading(false);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('volumechange', handleVolumeChange);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('volumechange', handleVolumeChange);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('error', handleError);
        };
    }, []);

    useEffect(() => {
        if (!src) setIsLoading(false);
    }, [src]);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(console.error);
        }
    }, [autoPlay]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch(console.error);
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        if (!video) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    };

    const handleVolumeChange = (e) => {
        const video = videoRef.current;
        if (!video) return;
        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    /** Open video in new tab for fullscreen/watch in new tab (works reliably on mobile). */
    const openInNewTab = () => {
        if (!src) return;
        window.open(src, '_blank', 'noopener,noreferrer');
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const handleMouseLeave = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            setShowControls(false);
        }
    };

    const controlsVisible = mobile ? true : showControls;

    if (previewOnly) {
        return (
            <div ref={containerRef} className={`relative bg-black rounded-xl overflow-hidden pointer-events-none ${className}`}>
                <video ref={videoRef} src={src} className="w-full h-full object-contain" playsInline preload="metadata" />
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="mt-2 text-white/80 text-xs">Loading...</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-xl overflow-hidden group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                playsInline
            />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="mt-3 text-white/90 text-sm font-medium">Loading video...</p>
                </div>
            )}

            {controls && (
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 touch-manipulation ${
                        controlsVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    onTouchStart={() => {
                        if (!mobile) {
                            setShowControls(true);
                            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                            controlsTimeoutRef.current = setTimeout(() => {
                                if (isPlaying) setShowControls(false);
                            }, 3000);
                        }
                    }}
                >
                    {/* Progress Bar */}
                    <div className="absolute bottom-14 sm:bottom-16 left-0 right-0 px-4 sm:px-6">
                        <div
                            className="h-1.5 bg-white/25 rounded-full cursor-pointer relative touch-manipulation"
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg -ml-1.5 transition-all pointer-events-none"
                                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Big tap-to-play overlay when paused - hide during loading */}
                    {!isLoading && !isPlaying && (
                        <button
                            onClick={togglePlay}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3 active:bg-black/20 transition-colors"
                            aria-label="Play video"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span className="text-white text-sm font-medium drop-shadow-lg">Tap to play</span>
                        </button>
                    )}

                    {/* Controls - compact bar with clear hierarchy */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-h-[52px] sm:min-h-0">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Time */}
                            <span className="text-white/90 text-sm font-medium tabular-nums shrink-0">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>

                            {/* Volume - mute only on mobile, slider on desktop */}
                            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 justify-end">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors shrink-0"
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted || volume === 0 ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        </svg>
                                    ) : volume < 0.5 ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="hidden sm:block w-16 lg:w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white shrink-0"
                                />
                            </div>

                            {/* Open in new tab / fullscreen */}
                            <button
                                onClick={openInNewTab}
                                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ml-auto"
                                aria-label="Open video in new tab"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
