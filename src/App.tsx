import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, PlayCircle, ArrowLeft, RefreshCw, ExternalLink, Star, Clock, X, Minimize2, Maximize2, History, List, Settings, Copy, Pause, Play, Trash2, Plus, CheckCircle2, MapPin, QrCode, LogOut, Camera, Monitor, Globe } from 'lucide-react';
import { Answer, PLATFORMS, SAMPLE_ANSWERS } from '../types';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignIn from './components/SignIn';
import LocationSign from './components/LocationSign';
import QRScan from './components/QRScan';
import CheckInHistory from './components/CheckInHistory';
import CameraCapture from './components/CameraCapture';
import ScreenShareCapture from './components/ScreenShareCapture';
import XuexitongWebview from './components/XuexitongWebview';

type Page = 'home' | 'results' | 'history' | 'continuous' | 'checkin' | 'locationSign' | 'qrScan' | 'checkinHistory' | 'camera' | 'screenShare' | 'xuexitong';

interface HistoryItem {
  id: string;
  question: string;
  answers: Answer[];
  timestamp: number;
  favorite: boolean;
}

interface ContinuousTask {
  id: string;
  questions: string[];
  currentIndex: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  results: HistoryItem[];
}

const AppContent: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [keyword, setKeyword] = useState('什么是人工智能？');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['doubao', 'qianwen', 'yuanbao']);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showFloating, setShowFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 20, y: 100 });
  const [floatingKeyword, setFloatingKeyword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const floatingRef = useRef<HTMLDivElement>(null);
  
  const [miniMode, setMiniMode] = useState(false);
  const [autoAnswerMode, setAutoAnswerMode] = useState(false);
  const [autoAnswerRunning, setAutoAnswerRunning] = useState(false);
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [continuousTask, setContinuousTask] = useState<ContinuousTask | null>(null);
  const [questionList, setQuestionList] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [showCheckInLogin, setShowCheckInLogin] = useState(false);
  const [targetCheckInPage, setTargetCheckInPage] = useState<Page | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('answerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    loadSampleData();
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker 注册失败:', err);
      });
    }
  }, []);

  const saveHistory = useCallback((item: HistoryItem) => {
    const newHistory = [item, ...history.filter(h => h.question !== item.question)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('answerHistory', JSON.stringify(newHistory));
  }, [history]);

  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search/sample');
      const data = await response.json();
      if (data.success) {
        setAnswers(data.data);
      }
    } catch (err) {
      setError('加载示例数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const [apiVersion, setApiVersion] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    checkVersion();
    const interval = setInterval(checkVersion, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkVersion = async () => {
    try {
      const response = await fetch('/api/version');
      const data = await response.json();
      if (data.success) {
        const newVersion = data.version;
        const newUpdate = data.lastUpdate;
        
        if (apiVersion && apiVersion !== newVersion) {
          setShowUpdateNotification(true);
          setTimeout(() => setShowUpdateNotification(false), 5000);
        }
        
        setApiVersion(newVersion);
        setLastUpdate(new Date(newUpdate).toLocaleString());
      }
    } catch (err) {
      console.log('Version check failed');
    }
  };

  const refreshCache = async () => {
    try {
      await fetch('/api/refresh', { method: 'POST' });
      alert('缓存已刷新，下次搜索将获取最新数据！');
    } catch (err) {
      alert('刷新失败');
    }
  };

  const performSearch = async (searchKeyword: string = keyword, forceRefresh = false) => {
    if (!searchKeyword.trim() || selectedPlatforms.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword, platforms: selectedPlatforms, refresh: forceRefresh })
      });
      const data = await response.json();
      if (data.success) {
        setAnswers(data.data);
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          question: searchKeyword,
          answers: data.data,
          timestamp: Date.now(),
          favorite: false
        };
        saveHistory(historyItem);
        setCurrentPage('results');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const trySample = async () => {
    setKeyword('什么是人工智能？');
    setSelectedPlatforms(['doubao', 'qianwen', 'yuanbao']);
    await performSearch('什么是人工智能？');
  };

  const handleFloatingSearch = async () => {
    if (!floatingKeyword.trim()) return;
    setKeyword(floatingKeyword);
    await performSearch(floatingKeyword);
    setShowFloating(false);
    setCurrentPage('results');
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - floatingPosition.x, y: clientY - floatingPosition.y });
  };

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setFloatingPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestionList([...questionList, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setQuestionList(questionList.filter((_, i) => i !== index));
  };

  const startContinuous = () => {
    if (questionList.length === 0) return;
    const task: ContinuousTask = {
      id: Date.now().toString(),
      questions: [...questionList],
      currentIndex: 0,
      status: 'running',
      results: []
    };
    setContinuousTask(task);
    runNextQuestion(task);
  };

  const runNextQuestion = async (task: ContinuousTask) => {
    if (task.currentIndex >= task.questions.length || task.status === 'paused') {
      if (task.currentIndex >= task.questions.length) {
        setContinuousTask({ ...task, status: 'completed' });
      }
      return;
    }

    const currentQuestion = task.questions[task.currentIndex];
    setIsLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: currentQuestion, platforms: selectedPlatforms })
      });
      const data = await response.json();
      if (data.success) {
        const historyItem: HistoryItem = {
          id: `${task.id}-${task.currentIndex}`,
          question: currentQuestion,
          answers: data.data,
          timestamp: Date.now(),
          favorite: false
        };
        const newTask = {
          ...task,
          currentIndex: task.currentIndex + 1,
          results: [...task.results, historyItem]
        };
        setContinuousTask(newTask);
        saveHistory(historyItem);
        setTimeout(() => runNextQuestion(newTask), 1500);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePause = () => {
    if (!continuousTask) return;
    const newStatus = continuousTask.status === 'running' ? 'paused' : 'running';
    const newTask = { ...continuousTask, status: newStatus };
    setContinuousTask(newTask);
    if (newStatus === 'running') {
      runNextQuestion(newTask);
    }
  };

  const resetContinuous = () => {
    setContinuousTask(null);
    setQuestionList([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板！');
    });
  };

  const performOCR = async (imageData: string): Promise<string> => {
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      
      const data = await response.json();
      if (data.success) {
        return data.text;
      } else {
        return '';
      }
    } catch (err) {
      console.error('OCR 识别失败:', err);
      return '';
    }
  };

  const handleImageCapture = async (imageData: string) => {
    setIsOCRProcessing(true);
    
    try {
      const text = await performOCR(imageData);
      
      if (text.trim()) {
        setKeyword(text);
        await performSearch(text);
      } else {
        alert('未能识别到文本，请重试！');
      }
    } catch (err) {
      console.error('处理失败:', err);
      alert('处理失败，请重试！');
    } finally {
      setIsOCRProcessing(false);
      setCurrentPage('home');
    }
  };

  const handleMiniModeClick = async () => {
    if (autoAnswerMode && autoAnswerRunning) {
      setAutoAnswerRunning(false);
      alert('自动答题已暂停');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const captureAndAnswer = async () => {
        if (!autoAnswerRunning || !ctx || !video.readyState) return;
        
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        const text = await performOCR(imageData);
        
        if (text.trim()) {
          setKeyword(text);
          await performSearch(text);
        }
        
        if (autoAnswerMode && autoAnswerRunning) {
          setTimeout(captureAndAnswer, 3000);
        }
      };
      
      if (!autoAnswerMode) {
        await captureAndAnswer();
        stream.getTracks().forEach(track => track.stop());
      } else {
        setAutoAnswerRunning(true);
        await captureAndAnswer();
      }
    } catch (err) {
      console.error('屏幕识别失败:', err);
      alert('无法访问屏幕，请检查权限');
    }
  };

  const toggleAutoAnswerMode = () => {
    if (autoAnswerRunning) {
      setAutoAnswerRunning(false);
    }
    setAutoAnswerMode(!autoAnswerMode);
  };

  const confirmMiniMode = () => {
    setShowFloatingSettings(false);
    setMiniMode(true);
    alert('已开启悬浮窗迷你模式，点击悬浮按钮即可识别屏幕内容');
  };

  const exitMiniMode = () => {
    setMiniMode(false);
    setAutoAnswerMode(false);
    setAutoAnswerRunning(false);
    setShowFloating(true);
  };

  const checkCheckInAuth = (page: Page) => {
    if (!isLoggedIn) {
      setShowCheckInLogin(true);
      setTargetCheckInPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleCheckInLoginSuccess = () => {
    setShowCheckInLogin(false);
    if (targetCheckInPage) {
      setCurrentPage(targetCheckInPage);
      setTargetCheckInPage(null);
    }
  };

  const cancelCheckInLogin = () => {
    setShowCheckInLogin(false);
    setTargetCheckInPage(null);
  };

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24">
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI 答题助手
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入你的问题..."
                className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择平台</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                  style={{
                    backgroundColor: selectedPlatforms.includes(platform.id) ? platform.color : undefined
                  }}
                >
                  <div className="text-sm font-medium">{platform.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => performSearch()}
              disabled={isLoading || !keyword.trim() || selectedPlatforms.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              开始搜索
            </button>
            <button
              onClick={trySample}
              disabled={isLoading}
              className="bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              体验示例
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => {
              if (miniMode) {
                exitMiniMode();
              } else {
                setShowFloating(!showFloating);
              }
            }}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-700">悬浮窗设置</div>
          </button>
          <button
            onClick={() => setCurrentPage('continuous')}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <List className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm font-medium text-gray-700">连续答题</div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setCurrentPage('camera')}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera className="w-5 h-5 text-pink-600" />
            </div>
            <div className="text-sm font-medium text-gray-700">拍照答题</div>
          </button>
          <button
            onClick={() => setCurrentPage('screenShare')}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Monitor className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-sm font-medium text-gray-700">屏幕识别</div>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => setCurrentPage('history')}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-700">历史记录</div>
          </button>
          <button
              onClick={() => checkCheckInAuth('checkin')}
              className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-sm font-medium text-gray-700">学习通签到</div>
            </button>
          <button
              onClick={() => setCurrentPage('xuexitong')}
              className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-700">内置学习通</div>
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3">快捷问题</h3>
          <div className="flex flex-wrap gap-2">
            {['什么是人工智能？', '如何学习编程？', '推荐一本好书', '今天天气怎么样？'].map((q, i) => (
              <button
                key={i}
                onClick={() => setKeyword(q)}
                className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">搜索结果</h2>
          <button
            onClick={() => performSearch()}
            className="flex items-center gap-1 text-blue-600"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">刷新</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-gray-800 font-medium">{keyword}</p>
        </div>

        {answers.length > 0 && (
          <div className="mb-4">
            <div className="grid gap-3">
              {answers.slice(0, 2).map((answer, index) => (
                <MobileAnswerCard key={answer.id} answer={answer} rank={index + 1} onCopy={copyToClipboard} />
              ))}
            </div>
            <div className="mt-3 text-center">
              <button
                onClick={() => {}}
                className="text-blue-600 text-sm"
              >
                查看全部 {answers.length} 个答案 →
              </button>
            </div>
          </div>
        )}

        {answers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无搜索结果</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderHistoryPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">历史记录</h2>
          <button
            onClick={() => {
              setHistory([]);
              localStorage.removeItem('answerHistory');
            }}
            className="text-red-500 text-sm"
          >
            清空
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setKeyword(item.question);
                  setAnswers(item.answers);
                  setCurrentPage('results');
                }}
                className="bg-white rounded-xl p-4 shadow-sm active:bg-gray-50"
              >
                <p className="font-medium text-gray-800 mb-1 line-clamp-2">{item.question}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <span>{item.answers.length} 个答案</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContinuousPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">连续答题</h2>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 py-4">
        {!continuousTask ? (
          <>
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">添加题目</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="输入题目..."
                  onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={addQuestion}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {questionList.length > 0 && (
                <div className="space-y-2">
                  {questionList.map((q, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700 flex-1">{index + 1}. {q}</span>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">快捷添加</h3>
              <div className="flex flex-wrap gap-2">
                {['问题1', '问题2', '问题3', '问题4', '问题5'].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuestionList([...questionList, q]);
                    }}
                    className="px-3 py-2 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startContinuous}
              disabled={questionList.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
            >
              开始答题 ({questionList.length} 题)
            </button>
          </>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>进度</span>
                <span>{continuousTask.currentIndex} / {continuousTask.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${(continuousTask.currentIndex / continuousTask.questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="text-center py-4">
                {continuousTask.status === 'completed' ? (
                  <div>
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-semibold">全部完成！</p>
                  </div>
                ) : continuousTask.status === 'running' ? (
                  <div>
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-blue-600 font-medium">正在答题...</p>
                    <p className="text-gray-500 text-sm mt-1">{continuousTask.questions[continuousTask.currentIndex]}</p>
                  </div>
                ) : (
                  <div>
                    <Pause className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <p className="text-orange-600 font-medium">已暂停</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={togglePause}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold"
              >
                {continuousTask.status === 'running' ? (
                  <><Pause className="w-4 h-4 inline mr-2" />暂停</>
                ) : (
                  <><Play className="w-4 h-4 inline mr-2" />继续</>
                )}
              </button>
              <button
                onClick={resetContinuous}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {continuousTask.results.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">已完成 ({continuousTask.results.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {continuousTask.results.map((result, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded-lg text-sm text-gray-600">
                      {result.question}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderCheckInPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">学习通签到</h2>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 py-4">
        {!isLoggedIn ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">学习通签到</h3>
              <p className="text-gray-500 mt-2">请先登录学习通账号</p>
            </div>
            <button
              onClick={() => setCurrentPage('home')}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-semibold"
            >
              前往登录
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.userName?.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800">{user?.userName}</p>
                    <p className="text-sm text-gray-500">学习通账号</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-red-500 text-sm flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  退出
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => checkCheckInAuth('locationSign')}
                className="bg-white rounded-xl shadow-md p-4 text-left hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">虚拟定位签到</h3>
                <p className="text-sm text-gray-500">选择位置进行签到</p>
              </button>
              <button
                onClick={() => checkCheckInAuth('qrScan')}
                className="bg-white rounded-xl shadow-md p-4 text-left hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <QrCode className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">扫码签到</h3>
                <p className="text-sm text-gray-500">扫描签到二维码</p>
              </button>
            </div>

            <button
              onClick={() => checkCheckInAuth('checkinHistory')}
              className="w-full bg-white rounded-xl shadow-md p-4 text-left hover:shadow-lg transition-shadow flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">签到记录</h3>
                  <p className="text-sm text-gray-500">查看历史签到</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderLocationSignPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('checkin')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">虚拟定位签到</h2>
          <div className="w-16" />
        </div>
      </div>
      <LocationSign onSuccess={() => {}} />
    </div>
  );

  const renderQRScanPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('checkin')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">扫码签到</h2>
          <div className="w-16" />
        </div>
      </div>
      <QRScan onSuccess={() => {}} />
    </div>
  );

  const renderCheckInHistoryPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentPage('checkin')}
            className="flex items-center gap-1 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          <h2 className="font-semibold text-gray-800">签到记录</h2>
          <div className="w-16" />
        </div>
      </div>
      <CheckInHistory />
    </div>
  );

  const renderCameraPage = () => (
    <CameraCapture
      onCapture={handleImageCapture}
      onClose={() => setCurrentPage('home')}
    />
  );

  const renderScreenSharePage = () => (
    <ScreenShareCapture
      onCapture={handleImageCapture}
      onClose={() => setCurrentPage('home')}
      autoAnswerMode={autoAnswerMode}
    />
  );

  const renderXuexitongPage = () => (
    <XuexitongWebview
      onClose={() => setCurrentPage('home')}
    />
  );

  const renderCheckInLoginModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md mx-4">
        <SignIn
          onCancel={cancelCheckInLogin}
          onSuccess={handleCheckInLoginSuccess}
        />
      </div>
    </div>
  );

  return (
    <div className="relative">
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'results' && renderResultsPage()}
      {currentPage === 'history' && renderHistoryPage()}
      {currentPage === 'continuous' && renderContinuousPage()}
      {currentPage === 'checkin' && renderCheckInPage()}
      {currentPage === 'locationSign' && renderLocationSignPage()}
      {currentPage === 'qrScan' && renderQRScanPage()}
      {currentPage === 'checkinHistory' && renderCheckInHistoryPage()}
      {currentPage === 'camera' && renderCameraPage()}
      {currentPage === 'screenShare' && renderScreenSharePage()}
      {currentPage === 'xuexitong' && renderXuexitongPage()}
      
      {showCheckInLogin && renderCheckInLoginModal()}

      {showFloating && !miniMode && (
        <div
          ref={floatingRef}
          className="fixed z-50 bg-white rounded-2xl shadow-2xl p-4 w-72"
          style={{
            left: Math.max(0, Math.min(window.innerWidth - 288, floatingPosition.x)),
            top: Math.max(0, Math.min(window.innerHeight - 288, floatingPosition.y))
          }}
        >
          <div
            className="absolute -top-8 left-0 right-0 h-8 cursor-move flex items-center justify-center"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-800">悬浮窗设置</span>
            <button
              onClick={() => setShowFloating(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">迷你模式</p>
                  <p className="text-xs text-gray-500">开启后仅显示悬浮按钮</p>
                </div>
              </div>
              <button
                onClick={() => setShowFloatingSettings(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
              >
                开启
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">自动答题</p>
                  <p className="text-xs text-gray-500">自动识别并答题</p>
                </div>
              </div>
              <button
                onClick={toggleAutoAnswerMode}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  autoAnswerMode ? 'bg-red-500 text-white' : 'bg-cyan-500 text-white'
                }`}
              >
                {autoAnswerMode ? '关闭' : '开启'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">拍照答题</p>
                  <p className="text-xs text-gray-500">拍照识别题目</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFloating(false);
                  setCurrentPage('camera');
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium"
              >
                使用
              </button>
            </div>
          </div>
        </div>
      )}

      {showFloatingSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Maximize2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">开启迷你模式</h3>
              <p className="text-gray-500 mt-2">开启后悬浮窗将变为一个小按钮，点击即可识别屏幕内容并解题</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFloatingSettings(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmMiniMode}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium"
              >
                确认开启
              </button>
            </div>
          </div>
        </div>
      )}

      {miniMode && (
        <div
          className="fixed z-50 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          style={{
            left: Math.max(10, Math.min(window.innerWidth - 50, floatingPosition.x)),
            top: Math.max(10, Math.min(window.innerHeight - 50, floatingPosition.y))
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={handleMiniModeClick}
          title={autoAnswerRunning ? '点击暂停自动答题' : '点击识别屏幕'}
        >
          {autoAnswerRunning ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>
      )}
    </div>
  );
};

const MobileAnswerCard: React.FC<{ answer: Answer; rank: number; onCopy: (text: string) => void }> = ({ answer, rank, onCopy }) => {
  const platform = PLATFORMS.find(p => p.name === answer.platform);
  const platformColor = platform?.color || '#6B7280';

  const getRankBadgeColor = (r: number) => {
    if (r === 1) return 'bg-yellow-500';
    if (r === 2) return 'bg-gray-400';
    if (r === 3) return 'bg-amber-600';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: platformColor }}
          >
            {answer.platform.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{answer.platform}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`${getRankBadgeColor(rank)} text-white text-xs px-2 py-1 rounded-full`}>
            #{rank}
          </span>
          <div className="flex items-center gap-0.5 text-yellow-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-semibold">{answer.qualityScore}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3">{answer.answer}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">{answer.source}</span>
        <button
          onClick={() => onCopy(answer.answer)}
          className="flex items-center gap-1 text-blue-600 text-xs font-medium"
        >
          <Copy className="w-3 h-3" />
          复制
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
