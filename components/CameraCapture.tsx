import React, { useRef, useEffect, useState } from 'react';
import { Camera, FlipHorizontal, Image as ImageIcon, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip if user facing
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg');
        onCapture(imageSrc);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`flex-1 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Face Guide Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-80 border-2 border-white/30 rounded-[40%] border-dashed"></div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between z-10">
        <label className="p-3 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <ImageIcon className="text-white w-6 h-6" />
        </label>
        
        <button 
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform bg-white/10 backdrop-blur-sm"
        >
            <div className="w-16 h-16 bg-white rounded-full"></div>
        </button>

        <button 
            onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
            className="p-3 rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
        >
            <FlipHorizontal className="text-white w-6 h-6" />
        </button>
      </div>

      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 p-2 rounded-full bg-black/40 text-white backdrop-blur z-20"
      >
        <X size={24} />
      </button>
    </div>
  );
};
