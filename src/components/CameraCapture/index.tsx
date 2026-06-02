import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('无法访问摄像头:', error);
      alert('无法访问摄像头，请检查权限设置');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      setIsLoading(true);
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button onClick={onClose} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white text-lg font-semibold">拍照答题</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 bg-black/50 flex items-center justify-center gap-6">
        {!capturedImage ? (
          <button
            onClick={captureImage}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Camera className="w-8 h-8 text-black" />
          </button>
        ) : (
          <>
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-700 text-white rounded-full flex items-center gap-2 hover:bg-gray-600"
            >
              <RefreshCw className="w-5 h-5" />
              重拍
            </button>
            <button
              onClick={confirmCapture}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              使用照片
            </button>
          </>
        )}
      </div>
    </div>
  );
}
