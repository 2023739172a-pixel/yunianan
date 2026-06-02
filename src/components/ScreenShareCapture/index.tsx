import { useState, useRef, useEffect } from 'react';
import { Monitor, RefreshCw, X, Check, Play, Pause } from 'lucide-react';

interface ScreenShareCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  autoAnswerMode?: boolean;
}

export default function ScreenShareCapture({ onCapture, onClose, autoAnswerMode = false }: ScreenShareCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAutoCapture, setIsAutoCapture] = useState(autoAnswerMode);
  const [isLoading, setIsLoading] = useState(false);
  const autoCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showConfirm, setShowConfirm] = useState(autoAnswerMode);

  useEffect(() => {
    startScreenShare();
    return () => stopScreenShare();
  }, []);

  useEffect(() => {
    if (isAutoCapture && !capturedImage) {
      autoCaptureIntervalRef.current = setInterval(() => {
        captureScreenAndAnswer();
      }, 3000);
    } else {
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
      }
    }

    return () => {
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
      }
    };
  }, [isAutoCapture, capturedImage]);

  useEffect(() => {
    if (autoAnswerMode && !showConfirm) {
      setShowConfirm(true);
    }
  }, [autoAnswerMode, showConfirm]);

  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', displaySurface: 'monitor' },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
        onClose();
      };
    } catch (error) {
      console.error('无法访问屏幕:', error);
      alert('无法访问屏幕，请选择要共享的屏幕');
      onClose();
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (autoCaptureIntervalRef.current) {
      clearInterval(autoCaptureIntervalRef.current);
    }
  };

  const captureScreen = () => {
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
        setIsAutoCapture(false);
      }
    }
  };

  const captureScreenAndAnswer = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
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

  const toggleAutoCapture = () => {
    if (!isAutoCapture) {
      setShowConfirm(true);
    } else {
      setIsAutoCapture(false);
    }
  };

  const confirmAutoAnswer = () => {
    setShowConfirm(false);
    setIsAutoCapture(true);
    alert('已开启自动答题模式，将自动识别屏幕内容并答题，点击屏幕可暂停');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button onClick={onClose} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white text-lg font-semibold">屏幕识别</h2>
        {isAutoCapture && (
          <button onClick={() => setIsAutoCapture(false)} className="text-red-400 flex items-center gap-1">
            <Pause className="w-4 h-4" />
            <span className="text-sm">暂停</span>
          </button>
        )}
        {!isAutoCapture && <div className="w-10"></div>}
      </div>

      <div className="flex-1 flex items-center justify-center bg-black overflow-auto">
        {!capturedImage ? (
          <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full object-contain" />
        ) : (
          <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">开启自动答题</h3>
              <p className="text-gray-500 mt-2">开启后将自动识别屏幕内容，选择正确答案并自动切换到下一题，直到手动暂停或题目完成</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium">
                取消
              </button>
              <button onClick={confirmAutoAnswer} className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-medium">
                确认开启
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-black/50 flex items-center justify-center gap-6">
        {!capturedImage ? (
          <>
            <button onClick={toggleAutoCapture} className={`px-4 py-2 rounded-full flex items-center gap-2 ${isAutoCapture ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-90`}>
              {isAutoCapture ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isAutoCapture ? '停止自动答题' : '自动答题'}
            </button>
            <button onClick={captureScreen} className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
              <Monitor className="w-8 h-8 text-black" />
            </button>
          </>
        ) : (
          <>
            <button onClick={retake} className="px-6 py-3 bg-gray-700 text-white rounded-full flex items-center gap-2 hover:bg-gray-600">
              <RefreshCw className="w-5 h-5" />
              重新捕获
            </button>
            <button onClick={confirmCapture} disabled={isLoading} className="px-6 py-3 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              确认使用
            </button>
          </>
        )}
      </div>
    </div>
  );
}
