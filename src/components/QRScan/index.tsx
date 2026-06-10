import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Image, Check, Clock, Share2, Copy, ExternalLink } from 'lucide-react';
import { Course } from '../../types/checkin';
import { qrCheckIn, getCourses } from '../../utils/checkin';

interface QRScanProps {
  onSuccess?: () => void;
  userId?: string;
}

export default function QRScan({ onSuccess, userId = 'anonymous' }: QRScanProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
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

  // 生成分享链接
  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/qr-helper?courseId=${selectedCourse?.id}&courseName=${encodeURIComponent(selectedCourse?.name || '')}&userId=${userId}`;
    return shareUrl;
  };

  // 复制分享链接
  const handleCopyLink = () => {
    const shareUrl = generateShareLink();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 在新窗口打开分享页面
  const handleOpenSharePage = () => {
    const shareUrl = generateShareLink();
    window.open(shareUrl, '_blank');
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

        {/* 分享功能按钮 */}
        <div className="mt-3">
          <button
            onClick={() => setShowShare(!showShare)}
            disabled={!selectedCourse}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Share2 className="w-5 h-5 mr-2" />
            分享链接辅助签到
          </button>
        </div>

        {/* 分享链接弹窗 */}
        {showShare && selectedCourse && (
          <div className="mt-3 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <Share2 className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-purple-800">分享链接</h4>
            </div>
            <p className="text-purple-700 text-sm mb-3">
              分享此链接给好友，好友可在浏览器中打开并辅助扫码签到
            </p>
            <div className="bg-white rounded-lg p-3 mb-3 break-all">
              <code className="text-xs text-gray-600">{generateShareLink()}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg flex items-center justify-center transition-all"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? '已复制!' : '复制链接'}
              </button>
              <button
                onClick={handleOpenSharePage}
                className="flex-1 bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 font-medium py-2 rounded-lg flex items-center justify-center transition-all"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                打开链接
              </button>
            </div>
            <p className="text-purple-600 text-xs mt-2 text-center">
              好友无需下载APP，直接在浏览器中打开即可辅助扫码
            </p>
          </div>
        )}
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
