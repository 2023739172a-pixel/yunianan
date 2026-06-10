import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, ExternalLink, RefreshCw, XCircle, Check, 
  Chrome, Monitor, BookOpen, MapPin, QrCode, 
  MessageSquare, Users, Calendar, ChevronRight,
  Home, Globe, HelpCircle, AlertCircle, Clock, History, LogOut, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCourses as fetchCourses } from '../../utils/checkin';

interface XuexitongWebviewProps {
  onClose: () => void;
}

type ViewMode = 'webview-login' | 'courses-list' | 'course-detail' | 'all-courses';
type LoginStatus = 'idle' | 'loading' | 'success' | 'failed';

interface Course {
  id: string;
  name: string;
  teacher: string;
  className: string;
  time: string;
  hasCheckIn: boolean;
  hasChat: boolean;
}

interface CheckInRecord {
  id: string;
  courseName: string;
  method: 'location' | 'qr';
  location?: string;
  time: string;
  status: 'success' | 'failed';
}

const XuexitongWebview: React.FC<XuexitongWebviewProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('webview-login');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentUrl, setCurrentUrl] = useState('https://passport2.chaoxing.com/login?refer=http://mobilelearn.chaoxing.com/');
  const [iframeKey, setIframeKey] = useState(0);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [courses, setCourses] = useState<Course[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [showCheckInHistory, setShowCheckInHistory] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 模拟课程数据
  const mockCourses: Course[] = [
    {
      id: '1',
      name: '高等数学',
      teacher: '张老师',
      className: '软件工程1班',
      time: '周一 10:00-12:00',
      hasCheckIn: true,
      hasChat: true
    },
    {
      id: '2',
      name: '大学英语',
      teacher: '李老师',
      className: '软件工程1班',
      time: '周二 14:00-16:00',
      hasCheckIn: true,
      hasChat: true
    },
    {
      id: '3',
      name: '计算机基础',
      teacher: '王老师',
      className: '软件工程1班',
      time: '周三 16:00-18:00',
      hasCheckIn: true,
      hasChat: true
    },
    {
      id: '4',
      name: '软件工程',
      teacher: '刘老师',
      className: '软件工程1班',
      time: '周四 08:00-10:00',
      hasCheckIn: true,
      hasChat: true
    }
  ];

  useEffect(() => {
    if (viewMode === 'courses-list' && courses.length === 0) {
      // 加载课程
      setCourses(mockCourses);
    }
  }, [viewMode]);

  const refreshIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  const navigateToUrl = (url: string) => {
    setCurrentUrl(url);
    setIframeKey(prev => prev + 1);
  };

  const handleLoginComplete = () => {
    setLoginStatus('success');
    setViewMode('courses-list');
  };

  const handleGoToCourse = (course: Course) => {
    setSelectedCourse(course);
    setViewMode('course-detail');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setViewMode('courses-list');
  };

  const handleCheckIn = async (type: 'location' | 'qr') => {
    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      courseName: selectedCourse!.name,
      method: type,
      location: type === 'location' ? '学校教学楼' : undefined,
      time: new Date().toLocaleString('zh-CN'),
      status: 'success'
    };
    
    setCheckInRecords(prev => [newRecord, ...prev]);
    setIsChecking(false);
    alert(`✅ ${selectedCourse?.name} ${type === 'location' ? '位置' : '扫码'}签到成功！`);
  };

  // 渲染登录页（webview）
  const renderLoginWebview = () => (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-white">学习通</h2>
          <button onClick={() => setShowHelp(!showHelp)} className="text-white">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {showHelp && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            使用说明
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. 在下方iframe中登录学习通账号</li>
            <li>2. 如iframe无法登录，请点击右上角"外部浏览器"按钮</li>
            <li>3. 登录成功后点击右下角"已登录，进入课程"</li>
            <li>4. 即可使用课程签到等功能</li>
          </ul>
        </div>
      )}
      
      <div className="bg-white border-b p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="输入网址..."
          />
          <button
            onClick={refreshIframe}
            className="p-2 bg-blue-500 text-white rounded-lg"
            title="刷新页面"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.open(currentUrl, '_blank')}
            className="p-2 bg-green-500 text-white rounded-lg"
            title="外部浏览器打开"
          >
            <Chrome className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => navigateToUrl('https://passport2.chaoxing.com/login?refer=http://mobilelearn.chaoxing.com/')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
          >
            登录页
          </button>
          <button
            onClick={() => navigateToUrl('https://mobilelearn.chaoxing.com/')}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
          >
            主页
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-top-navigation-by-user-activation allow-modals allow-downloads allow-pointer-lock allow-orientation-lock allow-presentation"
          referrerPolicy="no-referrer"
          allow="geolocation; microphone; camera; autoplay; fullscreen"
        />
        
        {/* 登录成功检测按钮 */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-3">
          <button
            onClick={() => window.open(currentUrl, '_blank')}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="font-semibold">外部浏览器登录</span>
          </button>
          <button
            onClick={handleLoginComplete}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Check className="w-5 h-5" />
            <span className="font-semibold">已登录，进入课程</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染课程列表
  const renderCoursesList = () => (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-white">学习通</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('webview-login')} className="text-white" title="打开网页版">
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-blue-100 text-sm mt-1">{user?.userName ? `欢迎, ${user.userName}` : '学习通用户'}</p>
      </div>
      
      {user && (
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.userName?.charAt(0) || '用'}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user.userName}</p>
                <p className="text-gray-500 text-xs">已登录</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCheckInHistory(true)}
                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-1"
              >
                <History className="w-4 h-4" />
                签到历史
              </button>
              <button
                onClick={() => {
                  logout();
                  setViewMode('webview-login');
                }}
                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{course.name}</h3>
                    <p className="text-gray-500 text-sm">
                      <Users className="w-4 h-4 inline mr-1" />
                      {course.teacher} · {course.className}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {course.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleGoToCourse(course)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex gap-2 mt-3">
                  {course.hasCheckIn && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> 可签到
                    </span>
                  )}
                  {course.hasChat && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> 群聊
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleGoToCourse(course)}
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 py-3 text-center text-blue-600 font-semibold text-sm hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                进入课程
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white border-t p-4">
        <button
          onClick={() => setViewMode('webview-login')}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
        >
          <Monitor className="w-5 h-5" />
          打开学习通网页版
        </button>
      </div>
    </div>
  );
  
  // 渲染签到历史
  const renderCheckInHistory = () => (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-lg">签到历史</h3>
          <button
            onClick={() => setShowCheckInHistory(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {checkInRecords.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无签到记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkInRecords.map(record => (
                <div key={record.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{record.courseName}</p>
                      <p className="text-gray-500 text-xs">{record.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status === 'success' ? '成功' : '失败'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    {record.method === 'location' ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    <span>
                      {record.method === 'location' ? '位置签到' : '扫码签到'}
                      {record.location && ` - ${record.location}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 渲染课程详情
  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    
    return (
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={handleBackToCourses} className="flex items-center gap-2 text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-white">{selectedCourse.name}</h2>
            <div className="w-10"></div>
          </div>
        </div>
        
        <div className="bg-white border-b p-4">
          <h3 className="font-bold text-gray-800">{selectedCourse.name}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {selectedCourse.teacher} · {selectedCourse.className} · {selectedCourse.time}
          </p>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {/* 功能网格 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleCheckIn('location')}
              disabled={isChecking}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">位置签到</p>
                <p className="text-gray-500 text-xs">虚拟位置签到</p>
              </div>
            </button>
            
            <button
              onClick={() => handleCheckIn('qr')}
              disabled={isChecking}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">扫码签到</p>
                <p className="text-gray-500 text-xs">扫描二维码签到</p>
              </div>
            </button>
            
            <button
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">课程群聊</p>
                <p className="text-gray-500 text-xs">查看群聊消息</p>
              </div>
            </button>
            
            <button
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">课程安排</p>
                <p className="text-gray-500 text-xs">查看课程进度</p>
              </div>
            </button>
          </div>
          
          {/* 课程信息 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              课程操作
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setViewMode('webview-login')}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                在学习通网页版打开课程
              </button>
            </div>
          </div>
          
          {/* 签到历史 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              最近签到
            </h3>
            <div className="text-center py-4 text-gray-400">
              <p>暂无签到记录</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {viewMode === 'webview-login' && renderLoginWebview()}
      {viewMode === 'courses-list' && renderCoursesList()}
      {viewMode === 'course-detail' && renderCourseDetail()}
      {showCheckInHistory && renderCheckInHistory()}
    </div>
  );
};

export default XuexitongWebview;
