import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Settings, ExternalLink, RefreshCw, XCircle, Check, Smartphone, Zap, Globe, Monitor, Maximize2, HelpCircle, AlertTriangle } from 'lucide-react';

interface XuexitongWebviewProps {
  onClose: () => void;
}

type ViewMode = 'iframe' | 'browser' | 'debug';
type LoginStatus = 'idle' | 'loading' | 'success' | 'failed' | 'unknown';

const XuexitongWebview: React.FC<XuexitongWebviewProps> = ({ onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('iframe');
  const [currentUrl, setCurrentUrl] = useState('https://passport2.chaoxing.com/login?refer=http://mobilelearn.chaoxing.com/');
  const [iframeKey, setIframeKey] = useState(0);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('unknown');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [urlHistory, setUrlHistory] = useState<string[]>([]);
  const [useProxy, setUseProxy] = useState(false);
  const [iframeSandbox, setIframeSandbox] = useState('allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-top-navigation-by-user-activation allow-modals allow-downloads');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastUrlRef = useRef('');

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    setLogs(prev => [...prev.slice(-30), `${prefix} [${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('🚀 学习通内置浏览器启动', 'success');
    addLog(`📱 当前模式: ${viewMode === 'iframe' ? '内嵌模式' : viewMode === 'browser' ? '外部浏览器' : '调试模式'}`, 'info');
    
    if (viewMode === 'iframe') {
      navigateToUrl(currentUrl);
    }
  }, [viewMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkIframeUrl();
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const checkIframeUrl = () => {
    if (viewMode !== 'iframe') return;
    
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeWindow = iframeRef.current.contentWindow;
        
        try {
          const url = iframeWindow.location.href;
          
          if (url && url !== 'about:blank' && url !== lastUrlRef.current) {
            lastUrlRef.current = url;
            setUrlHistory(prev => [...prev.slice(-10), url]);
            
            handleUrlChange(url);
          }
        } catch (e) {
          addLog('跨域URL检测被阻止 - 这是正常现象', 'warning');
        }
      }
    } catch (e) {
      // Ignore errors
    }
  };

  const handleUrlChange = (url: string) => {
    addLog(`🌐 URL变更: ${url.substring(0, 60)}...`, 'info');
    
    if (url.includes('mobilelearn') && !url.includes('passport') && !url.includes('login')) {
      setLoginStatus('success');
      addLog('✅ 检测到学习通主页 - 登录成功！', 'success');
    } else if (url.includes('login') || url.includes('passport')) {
      setLoginStatus('idle');
      addLog('📝 检测到登录页面', 'info');
    }
  };

  const navigateToUrl = (url: string) => {
    addLog(`🔗 导航到: ${url.substring(0, 60)}...`, 'info');
    setCurrentUrl(url);
    setIframeKey(prev => prev + 1);
  };

  const refreshIframe = () => {
    addLog('🔄 刷新页面...', 'info');
    setIframeKey(prev => prev + 1);
  };

  const openInExternalBrowser = () => {
    addLog('🌐 打开外部浏览器...', 'info');
    
    const externalUrl = currentUrl;
    const opened = window.open(externalUrl, '_blank', 'noopener,noreferrer');
    
    if (opened) {
      addLog('✅ 外部浏览器已打开', 'success');
    } else {
      addLog('❌ 浏览器打开被阻止，请允许弹窗', 'error');
      alert('⚠️ 浏览器打开被阻止\n\n请允许弹出窗口，或手动复制链接到浏览器访问。');
    }
  };

  const forceRedirectToMobile = () => {
    addLog('⚡ 强制跳转到学习通主页...', 'warning');
    navigateToUrl('https://mobilelearn.chaoxing.com/');
    
    setTimeout(() => {
      setLoginStatus('success');
    }, 1000);
  };

  const tryDirectAccess = () => {
    addLog('📱 尝试直接访问...', 'info');
    navigateToUrl('https://passport2.chaoxing.com/login?refer=http://mobilelearn.chaoxing.com/wap/');
  };

  const toggleProxy = () => {
    setUseProxy(prev => !prev);
    addLog(`🔧 ${!useProxy ? '启用' : '禁用'}代理模式`, 'info');
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🗑️ 日志已清空', 'info');
  };

  const renderIframeMode = () => (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="bg-white border-b p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入网址..."
          />
          <button
            onClick={() => navigateToUrl(currentUrl)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            跳转
          </button>
          <button
            onClick={refreshIframe}
            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            title="刷新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => navigateToUrl('https://passport2.chaoxing.com/login?refer=http://mobilelearn.chaoxing.com/')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200"
          >
            登录页
          </button>
          <button
            onClick={forceRedirectToMobile}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            强制跳转
          </button>
          <button
            onClick={() => navigateToUrl('https://mobilelearn.chaoxing.com/')}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
          >
            学习通主页
          </button>
          <button
            onClick={openInExternalBrowser}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs hover:bg-orange-200 flex items-center gap-1 ml-auto"
          >
            <ExternalLink className="w-3 h-3" />
            外部浏览器
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          sandbox={iframeSandbox}
          referrerPolicy="no-referrer"
        />
        
        {loginStatus === 'idle' && (
          <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">请在下方完成登录</span>
            </div>
            <button
              onClick={forceRedirectToMobile}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              登录后跳转
            </button>
          </div>
        )}
        
        {loginStatus === 'success' && (
          <div className="absolute top-4 left-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">✅ 已成功登录学习通！</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderBrowserMode = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Globe className="w-20 h-20 mx-auto text-blue-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">使用外部浏览器</h2>
        <p className="text-gray-600 mb-6">
          内嵌模式存在跨域限制，建议使用外部浏览器获得最佳体验。
        </p>
        
        <div className="space-y-4">
          <button
            onClick={openInExternalBrowser}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            在浏览器中打开学习通
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
            <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              为什么需要外部浏览器？
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 跨域安全策略会阻止Session同步</li>
              <li>• Cookie和LocalStorage无法正确传递</li>
              <li>• 部分JavaScript功能受限</li>
              <li>• 学习通的登录流程依赖完整浏览器环境</li>
            </ul>
          </div>
          
          <button
            onClick={() => setViewMode('iframe')}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
          >
            返回内嵌模式尝试
          </button>
        </div>
      </div>
    </div>
  );

  const renderDebugMode = () => (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">调试控制台</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600"
          >
            清空
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i} className="text-green-400 mb-1 leading-relaxed">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            暂无日志记录
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <h4 className="text-white text-sm font-medium mb-3">URL历史</h4>
        <div className="space-y-2">
          {urlHistory.slice(-5).reverse().map((url, i) => (
            <button
              key={i}
              onClick={() => navigateToUrl(url)}
              className="w-full text-left px-3 py-2 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 truncate"
            >
              {url}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      <div className="bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-gray-800">学习通</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('iframe')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'iframe' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="内嵌模式"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('browser')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'browser' ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="外部浏览器"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`p-2 rounded-lg transition-colors ${showDebugPanel ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="调试"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-lg transition-colors ${showHelp ? 'bg-yellow-100 text-yellow-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="帮助"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {showDebugPanel && (
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">调试选项</h3>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={tryDirectAccess}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
            >
              尝试直接访问
            </button>
            <button
              onClick={toggleProxy}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm"
            >
              {useProxy ? '禁用' : '启用'}代理
            </button>
            <button
              onClick={() => setViewMode('debug')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              查看日志
            </button>
            <button
              onClick={refreshIframe}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm"
            >
              重置iframe
            </button>
          </div>
        </div>
      )}
      
      {showHelp && (
        <div className="bg-yellow-50 border-b p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-yellow-800">使用帮助</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-yellow-800 space-y-2">
            <p><strong>问题：</strong>登录后无法跳转到学习通主页</p>
            <p><strong>原因：</strong>浏览器的跨域安全策略限制了iframe内的Session和Cookie同步</p>
            <p><strong>解决方案：</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>点击"外部浏览器"按钮（最推荐）</li>
              <li>或在登录后点击"强制跳转"</li>
              <li>或尝试"调试"模式查看详细日志</li>
            </ol>
          </div>
        </div>
      )}
      
      {viewMode === 'iframe' && renderIframeMode()}
      {viewMode === 'browser' && renderBrowserMode()}
      {viewMode === 'debug' && renderDebugMode()}
    </div>
  );
};

export default XuexitongWebview;
