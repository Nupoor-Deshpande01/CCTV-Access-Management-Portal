import React, { useState, useEffect, useRef } from 'react';
import Card from './common/Card';
import { Download, Clock, ShieldAlert } from 'lucide-react';
import Button from './common/Button';

const FootageViewer = ({ url, approvedAt, expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);

    // Face blurring states
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [faceApiLoaded, setFaceApiLoaded] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    const isVideo = url && (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm'));

    useEffect(() => {
        // Expiry calculation
        const updateTimer = () => {
            const expiryTime = expiresAt ? expiresAt : (new Date(approvedAt).getTime() + 48 * 60 * 60 * 1000);
            const now = new Date().getTime();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setExpired(true);
                setTimeLeft('Expired');
            } else {
                setExpired(false);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m remaining`);
            }
        };

        if (approvedAt || expiresAt) {
            updateTimer();
            const interval = setInterval(updateTimer, 60000);
            return () => clearInterval(interval);
        }
    }, [approvedAt, expiresAt]);

    useEffect(() => {
        if (!isVideo || expired) return;

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.js';
        script.async = true;
        script.onload = () => setFaceApiLoaded(true);
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [isVideo, expired]);

    useEffect(() => {
        if (!faceApiLoaded) return;
        const loadModels = async () => {
            setIsProcessing(true);
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            try {
                await Promise.all([
                    window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                setIsProcessing(false);
            } catch (err) {
                console.error("Error loading face-api models", err);
                setIsProcessing(false);
            }
        };
        loadModels();
    }, [faceApiLoaded]);

    const handleVideoPlay = () => {
        if (!modelsLoaded || !videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas to match video dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const drawFrame = async () => {
            if (video.paused || video.ended) return;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw original frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Detect faces on the canvas
            if (window.faceapi) {
                try {
                    const detections = await window.faceapi.detectAllFaces(canvas, new window.faceapi.TinyFaceDetectorOptions());
                    
                    // Blur face bounding boxes
                    for (const detection of detections) {
                        const { x, y, width, height } = detection.box;
                        ctx.filter = 'blur(20px)';
                        // Redraw heavily blurred region
                        ctx.drawImage(canvas, x, y, width, height, x, y, width, height);
                        ctx.filter = 'none'; // reset
                    }
                } catch (e) {
                    console.error("Detection error: ", e);
                }
            }
            
            requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
    };

    if (expired) {
        return (
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <Clock size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p className="text-muted">This footage link has expired. Contact support to request an extension.</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Approved Footage</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isVideo && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={12} /> Privacy Filter On
                        </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {timeLeft}
                    </span>
                </div>
            </div>

            <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVideo ? (
                    <>
                        {isProcessing && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', zIndex: 10 }}>
                                Processing privacy filters...
                            </div>
                        )}
                        <video 
                            ref={videoRef}
                            src={url} 
                            crossOrigin="anonymous"
                            controls={false} // Disable default controls, we will interact via canvas or custom overlay
                            onPlay={handleVideoPlay}
                            // Add native controls for testing/fallback but hide video visually
                            style={{ display: 'none', width: '100%', height: '100%', objectFit: 'contain' }}
                            autoPlay
                            muted
                            loop
                        >
                            Your browser does not support the video tag.
                        </video>
                        {/* We use canvas strictly to render the filtered frames */}
                        <canvas 
                            ref={canvasRef} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 5, pointerEvents: 'none' }}
                        />
                        {/* Fake minimal controls for canvas */}
                        <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 20 }}>
                            <Button size="sm" onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}>
                                Play / Pause
                            </Button>
                        </div>
                    </>
                ) : (
                    <iframe 
                        src={url} 
                        sandbox="allow-scripts allow-same-origin"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="CCTV Footage"
                    ></iframe>
                )}
            </div>

            <div style={{ textAlign: 'right' }}>
                <a href={url} target="_blank" rel="noopener noreferrer" download>
                    <Button size="sm" variant="outline" style={{ gap: '8px' }}>
                        <Download size={16} /> Download Source
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default FootageViewer;
