import React, { useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoModal({ isOpen, onClose, src, embedUrl, title = 'Video' }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-0 sm:-right-12 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
                    aria-label="Close"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Video container */}
                <div className="rounded-xl overflow-hidden bg-black flex-1 min-h-0 flex items-center justify-center">
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={title}
                            className="w-full h-full min-h-[50vh] aspect-video rounded-lg"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                        />
                    ) : src ? (
                        <VideoPlayer
                            src={src}
                            className="w-full h-full min-h-[50vh] aspect-video"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
