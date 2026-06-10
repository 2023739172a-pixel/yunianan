import httpRequest from './httpRequest';

const XUETANG_CONFIG = {
  baseUrl: 'https://passport2.chaoxing.com',
  apiBase: 'https://mooc1.chaoxing.com',
  encodingKey: 'tieba28386291',
  encodingMid: 'chaoxingweike',
};

const API_BASE = 'http://localhost:5000/api';

export interface UserInfo {
  userId: string;
  userName: string;
  studentId?: string;
  school?: string;
  token?: string;
  avatar?: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  checkInId?: string;
  checkInTime?: string;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  user?: UserInfo;
  message: string;
}

export interface Course {
  courseId: string;
  courseName: string;
  teacher: string;
  className: string;
  schedule: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface CheckInHistoryItem {
  id: string;
  courseName: string;
  method: 'location' | 'qr';
  location?: string;
  timestamp: string;
  status: 'success' | 'failed';
}

function getStorageKey(key: string): string {
  return `xt_${key}`;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(`${API_BASE}/xuetang/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success && data.user) {
      localStorage.setItem(getStorageKey('user'), JSON.stringify(data.user));
      localStorage.setItem(getStorageKey('token'), data.user.token);
      localStorage.setItem(getStorageKey('logged_in'), 'true');
      return {
        success: true,
        user: data.user,
        message: '登录成功',
      };
    } else {
      return {
        success: false,
        message: data.message || '登录失败',
      };
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    return {
      success: false,
      message: '网络请求失败，请检查网络连接',
    };
  }
}

export function logout(): void {
  localStorage.removeItem(getStorageKey('user'));
  localStorage.removeItem(getStorageKey('token'));
  localStorage.removeItem(getStorageKey('logged_in'));
}

export function getUserInfo(): UserInfo | null {
  const userStr = localStorage.getItem(getStorageKey('user'));
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function isLoggedIn(): boolean {
  const loggedIn = localStorage.getItem(getStorageKey('logged_in'));
  return loggedIn === 'true' && !!getUserInfo();
}

export async function locationCheckIn(
  location: { name: string; lat: number; lng: number },
  courseName: string
): Promise<CheckInResult> {
  const user = getUserInfo();
  
  if (!user?.token) {
    return {
      success: false,
      message: '请先登录学习通账号',
    };
  }

  try {
    const response = await fetch(`${API_BASE}/xuetang/location-checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        courseName,
        userId: user.userId,
        token: user.token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      const historyItem: CheckInHistoryItem = {
        id: data.checkInId,
        courseName,
        method: 'location',
        location: location.name,
        timestamp: data.checkInTime,
        status: 'success'
      };
      saveCheckInHistory(historyItem);
      
      return {
        success: true,
        message: '签到成功！',
        checkInId: data.checkInId,
        checkInTime: data.checkInTime,
      };
    } else {
      return {
        success: false,
        message: data.message || '签到失败',
      };
    }
  } catch (error) {
    console.error('签到请求失败:', error);
    return {
      success: false,
      message: '网络请求失败，请检查网络连接',
    };
  }
}

export async function qrCodeCheckIn(qrCode: string): Promise<CheckInResult> {
  const user = getUserInfo();
  
  if (!user?.token) {
    return {
      success: false,
      message: '请先登录学习通账号',
    };
  }

  try {
    const response = await fetch(`${API_BASE}/xuetang/qr-checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qrCode,
        userId: user.userId,
        token: user.token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      const historyItem: CheckInHistoryItem = {
        id: data.checkInId,
        courseName: '扫码签到',
        method: 'qr',
        timestamp: data.checkInTime,
        status: 'success'
      };
      saveCheckInHistory(historyItem);
      
      return {
        success: true,
        message: '签到成功！',
        checkInId: data.checkInId,
        checkInTime: data.checkInTime,
      };
    } else {
      return {
        success: false,
        message: data.message || '签到失败',
      };
    }
  } catch (error) {
    console.error('签到请求失败:', error);
    return {
      success: false,
      message: '网络请求失败，请检查网络连接',
    };
  }
}

export async function qrCheckIn(qrCode: string): Promise<CheckInResult> {
  return qrCodeCheckIn(qrCode);
}

export function checkNetworkStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve(false);
      return;
    }

    const img = document.createElement('img');
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'https://passport2.chaoxing.com/favicon.ico?t=' + Date.now();
    
    setTimeout(() => resolve(true), 1000);
  });
}

export async function testApiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: data.success === true,
        message: data.success ? '后端服务连接正常' : '后端服务异常'
      };
    }
    return {
      success: false,
      message: '无法连接后端服务'
    };
  } catch (error) {
    console.error('API连接测试失败:', error);
    return {
      success: false,
      message: '网络连接失败'
    };
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE}/xuetang/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.courses) {
        return data.courses;
      }
    }
    
    return [
      { courseId: '1', courseName: '高等数学', teacher: '张老师', className: '软件工程1班', schedule: '周一 10:00' },
      { courseId: '2', courseName: '大学英语', teacher: '李老师', className: '软件工程1班', schedule: '周二 14:00' },
      { courseId: '3', courseName: '计算机基础', teacher: '王老师', className: '软件工程1班', schedule: '周三 16:00' },
      { courseId: '4', courseName: '软件工程', teacher: '刘老师', className: '软件工程1班', schedule: '周四 08:00' },
    ];
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return [
      { courseId: '1', courseName: '高等数学', teacher: '张老师', className: '软件工程1班', schedule: '周一 10:00' },
      { courseId: '2', courseName: '大学英语', teacher: '李老师', className: '软件工程1班', schedule: '周二 14:00' },
      { courseId: '3', courseName: '计算机基础', teacher: '王老师', className: '软件工程1班', schedule: '周三 16:00' },
      { courseId: '4', courseName: '软件工程', teacher: '刘老师', className: '软件工程1班', schedule: '周四 08:00' },
    ];
  }
}

export function getSavedLocations(): SavedLocation[] {
  try {
    const locations = localStorage.getItem(getStorageKey('saved_locations'));
    if (locations) {
      return JSON.parse(locations);
    }
  } catch (error) {
    console.error('获取保存的位置失败:', error);
  }
  
  return [
    { id: '1', name: '教学楼A栋', lat: 31.2304, lng: 121.4737, description: '教学楼A栋大厅' },
    { id: '2', name: '图书馆', lat: 31.2305, lng: 121.4738, description: '图书馆正门' },
    { id: '3', name: '体育馆', lat: 31.2306, lng: 121.4739, description: '体育馆入口' },
    { id: '4', name: '食堂', lat: 31.2307, lng: 121.4740, description: '食堂门口' },
  ];
}

export function saveLocation(location: SavedLocation): void {
  try {
    const locations = getSavedLocations();
    const existingIndex = locations.findIndex(l => l.id === location.id);
    
    if (existingIndex >= 0) {
      locations[existingIndex] = location;
    } else {
      locations.push(location);
    }
    
    localStorage.setItem(getStorageKey('saved_locations'), JSON.stringify(locations));
  } catch (error) {
    console.error('保存位置失败:', error);
  }
}

export function deleteLocation(locationId: string): void {
  try {
    const locations = getSavedLocations();
    const filtered = locations.filter(l => l.id !== locationId);
    localStorage.setItem(getStorageKey('saved_locations'), JSON.stringify(filtered));
  } catch (error) {
    console.error('删除位置失败:', error);
  }
}

export function getCheckInHistory(): CheckInHistoryItem[] {
  try {
    const history = localStorage.getItem(getStorageKey('checkin_history'));
    if (history) {
      return JSON.parse(history);
    }
  } catch (error) {
    console.error('获取签到历史失败:', error);
  }
  return [];
}

function saveCheckInHistory(item: CheckInHistoryItem): void {
  try {
    const history = getCheckInHistory();
    history.unshift(item);
    const limited = history.slice(0, 100);
    localStorage.setItem(getStorageKey('checkin_history'), JSON.stringify(limited));
  } catch (error) {
    console.error('保存签到历史失败:', error);
  }
}

export function clearCheckInHistory(): void {
  try {
    localStorage.removeItem(getStorageKey('checkin_history'));
  } catch (error) {
    console.error('清空签到历史失败:', error);
  }
}
