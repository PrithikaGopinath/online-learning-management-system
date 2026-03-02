import { useState, useRef } from "react";
import { Play } from "lucide-react";

export default function VideoPlayer({ url, poster }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // If it's a YouTube embed url
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
        let embedUrl = url;
        if (url.includes("watch?v=")) {
            embedUrl = url.replace("watch?v=", "embed/");
        }
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={embedUrl}
                    title="Video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // Standard HTML5 Video
    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg group">
            <video
                ref={videoRef}
                src={url}
                poster={poster}
                className="w-full h-full object-cover"
                controls={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />

            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover:bg-black/30 transition-all"
                    onClick={togglePlay}
                >
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 text-white fill-white" />
                    </div>
                </div>
            )}
        </div>
    );
}
