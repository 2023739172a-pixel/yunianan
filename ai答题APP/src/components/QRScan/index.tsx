import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Image, Check, Clock } from 'lucide-react';
import { Course } from '../../types/checkin';
import { qrCheckIn, getCourses } from '../../utils/checkin';

interface QRScanProps {
  onSuccess?: () => void;
}

export default function QRScan({ onSuccess }: QRScanProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const courses = getCourses();

  useEffect(() => {
    if (!scanning) return;

    const startScan = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setScanning(false);
      }
    };

    startScan();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  useEffect(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = simulateQRDecode(imageData);
        
        if (code) {
          handleCodeDetected(code);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [scanning]);

  const simulateQRDecode = (imageData: ImageData): string | null => {
    const random = Math.random();
    if (random > 0.95) {
      return `签到码_${Date.now()}_${selectedCourse?.name || '课程'}`;
    }
    return null;
  };

  const handleCodeDetected = async (code: string) => {
    if (!selectedCourse) return;

    setScanning(false);
    setScannedCode(code);
    
    try {
      await qrCheckIn(code, selectedCourse.name);
      setResultSuccess(true);
    } catch {
      setResultSuccess(false);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      setScannedCode('');
      onSuccess?.();
    }, 2000);
  };

  const handleManualInput = () => {
    if (!selectedCourse) return;
    
    const mockCode = `手动输入_${selectedCourse.name}_${Date.now()}`;
    handleCodeDetected(mockCode);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex items-center mb-4">
          <QrCode className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">扫码签到</h3>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">选择课程</label>
          <div className="grid grid-cols-2 gap-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedCourse?.id === course.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium text-sm">{course.name}</div>
                <div className="text-xs opacity-70">{course.time}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
          {scanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white border-dashed rounded-lg opacity-50" />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full">
                <span className="text-white text-sm">正在扫描...</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-gray-500 mb-4" />
              <p className="text-gray-400">点击开始扫描</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setScanning(!scanning)}
            disabled={!selectedCourse}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Camera className="w-5 h-5 mr-2" />
            {scanning ? '停止扫描' : '开始扫描'}
          </button>
          <button
            onClick={handleManualInput}
            disabled={!selectedCourse}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Image className="w-5 h-5 mr-2" />
            手动输入
          </button>
        </div>
      </div>

      {showResult && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${resultSuccess ? 'bg-green-500' : 'bg-red-500'} bg-opacity-90`}>
          <div className="text-center text-white">
            {resultSuccess ? (
              <>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">扫码签到成功!</h3>
                <p className="mt-2">课程: {selectedCourse?.name}</p>
                <p className="text-sm opacity-80">{scannedCode}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold">签到失败</h3>
                <p className="mt-2">请重试</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
