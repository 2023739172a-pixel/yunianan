import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  X, 
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { checkNetworkStatus, testApiConnection } from '../../utils/checkin';

interface SignInProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function SignIn({ onCancel, onSuccess }: SignInProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [networkStatus, setNetworkStatus] = useState<boolean | null>(null);
  const [apiStatus, setApiStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [checkingNetwork, setCheckingNetwork] = useState(false);

  useEffect(() => {
    checkNetwork();
    
    const handleOnline = () => checkNetwork();
    const handleOffline = () => {
      setNetworkStatus(false);
      setApiStatus(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkNetwork = async () => {
    setCheckingNetwork(true);
    const isOnline = await checkNetworkStatus();
    setNetworkStatus(isOnline);
    
    if (isOnline) {
      const apiResult = await testApiConnection();
      setApiStatus(apiResult);
    } else {
      setApiStatus(null);
    }
    setCheckingNetwork(false);
  };

  const validateUsername = (value: string): string => {
    if (!value) {
      return '账号不能为空';
    }
    
    if (value.length < 5) {
      return '账号长度不能少于5位';
    }
    
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return '密码不能为空';
    }
    
    if (value.length < 6) {
      return '密码长度不能少于6位';
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUsernameError('');
    setPasswordError('');
    
    if (networkStatus === false) {
      setError('当前网络不可用，请检查网络连接后重试');
      return;
    }
    
    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);
    
    if (usernameErr) {
      setUsernameError(usernameErr);
      return;
    }
    
    if (passwordErr) {
      setPasswordError(passwordErr);
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError((err as Error).message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const isModal = !!onCancel;

  return (
    <div className={isModal ? '' : 'min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4'}>
      <div className={`w-full max-w-md ${isModal ? '' : ''}`}>
        <div className={`bg-white rounded-2xl shadow-2xl p-6 ${isModal ? 'relative' : ''}`}>
          {isModal && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">学习通账号登录</h2>
            <p className="text-gray-500 mt-2">使用您的学习通账号密码登录</p>
          </div>

          <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
            networkStatus === false ? 'bg-red-50 border border-red-200' : 
            networkStatus === true ? 'bg-green-50 border border-green-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center">
              {checkingNetwork ? (
                <RefreshCw className="w-5 h-5 text-gray-500 mr-2 animate-spin" />
              ) : networkStatus === true ? (
                <Wifi className="w-5 h-5 text-green-500 mr-2" />
              ) : networkStatus === false ? (
                <WifiOff className="w-5 h-5 text-red-500 mr-2" />
              ) : (
                <Wifi className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <span className={`text-sm ${
                networkStatus === false ? 'text-red-600' : 
                networkStatus === true ? 'text-green-600' :
                'text-gray-500'
              }`}>
                {checkingNetwork ? '检测网络中...' : 
                 networkStatus === true ? '网络连接正常' : 
                 networkStatus === false ? '网络连接异常' : '未知'}
              </span>
            </div>
            {networkStatus !== null && (
              <button
                onClick={checkNetwork}
                disabled={checkingNetwork}
                className="text-blue-500 hover:text-blue-600 text-sm flex items-center disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                刷新
              </button>
            )}
          </div>

          {apiStatus && (
            <div className={`mb-4 p-3 rounded-lg flex items-center ${
              apiStatus.success ? 'bg-blue-50 border border-blue-200' : 
              'bg-orange-50 border border-orange-200'
            }`}>
              <CheckCircle className={`w-5 h-5 mr-2 ${
                apiStatus.success ? 'text-blue-500' : 'text-orange-500'
              }`} />
              <span className={`text-sm ${
                apiStatus.success ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {apiStatus.message}
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                学习通账号
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError('');
                  }}
                  placeholder="请输入学习通账号"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    usernameError
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
              {usernameError && (
                <div className="mt-1 flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {usernameError}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="请输入密码"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                    passwordError
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <div className="mt-1 flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {passwordError}
                </div>
              )}
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm mb-2 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>请使用您的学习通账号（学号或手机号）和密码登录</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || networkStatus === false}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  登录中...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  登录
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>
            
            <div className="mt-4">
              <a
                href="https://passport2.chaoxing.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                前往学习通官网登录
              </a>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              登录即表示同意服务条款和隐私政策
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
