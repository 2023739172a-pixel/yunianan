import { useState, useEffect } from 'react';
import { QrCode, Send, Check, Copy, Link as LinkIcon } from 'lucide-react';

interface QRHelperProps {
  params: {
    courseId?: string;
    courseName?: string;
    userId?: string;
  };
}

export default function QRHelper({ params }: QRHelperProps) {
  const [qrCode, setQrCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (!qrCode.trim()) return;
    
    // 将二维码内容发送到服务器
    const shareData = {
      qrContent: qrCode,
      courseId: params.courseId,
      courseName: params.courseName,
      userId: params.userId,
      timestamp: Date.now()
    };
    
    // 存储到localStorage作为临时传递方式
    localStorage.setItem('pendingQRCode', JSON.stringify(shareData));
    setSubmitted(true);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/qr-helper?courseId=${params.courseId}&courseName=${encodeURIComponent(params.courseName || '')}&userId=${params.userId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">扫码辅助</h1>
          <p className="text-gray-600 text-sm">
            {params.courseName ? `正在辅助签到：${params.courseName}` : '请输入二维码内容'}
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">提交成功!</h2>
            <p className="text-gray-600 mb-6">二维码内容已提交，请返回原APP查看签到结果</p>
            
            <button
              onClick={() => window.close()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg"
            >
              关闭页面
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                请输入二维码内容
              </label>
              <textarea
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="粘贴或输入二维码内容..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
              />
              <p className="text-gray-500 text-xs mt-2">
                请将扫码后显示的内容粘贴到上方输入框
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!qrCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 mr-2" />
              提交二维码
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCopyLink}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center transition-all"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {copied ? '已复制!' : '复制分享链接'}
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            辅助他人完成扫码签到
          </p>
        </div>
      </div>
    </div>
  );
}
