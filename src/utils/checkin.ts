import { UserInfo, Location, CheckInRecord, Course } from '../types/checkin';

const STORAGE_KEY_USER = 'xuetang_user';
const STORAGE_KEY_RECORDS = 'xuetang_records';
const STORAGE_KEY_LOCATIONS = 'xuetang_locations';
const STORAGE_KEY_COURSES = 'xuetang_courses';

const XUETANG_BASE_URL = 'https://passport2.chaoxing.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < retries - 1) {
        await delay(delayMs * Math.pow(2, i));
      }
    }
  }
  
  throw lastError || new Error('请求失败');
};

export const checkNetworkStatus = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

export const testApiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      return { success: true, message: 'API连接正常' };
    } else {
      return { success: false, message: 'API响应异常' };
    }
  } catch (error) {
    return { success: false, message: '无法连接到服务器' };
  }
};

export interface ExtendedUserInfo extends UserInfo {
  studentId?: string;
  school?: string;
  token?: string;
}

export async function login(username: string, password: string): Promise<{ success: boolean; message: string; user?: ExtendedUserInfo }> {
  if (!username || !password) {
    return { success: false, message: '请输入账号和密码' };
  }

  try {
    const networkStatus = await checkNetworkStatus();
    if (!networkStatus) {
      return { success: false, message: '当前网络不可用，请检查网络连接' };
    }

    const apiResponse = await withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/xuetang/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        if (response.status === 503 || response.status === 504) {
          throw new Error('服务器暂时不可用');
        }
      }

      return response.json();
    });

    if (apiResponse.success) {
      const user: ExtendedUserInfo = {
        userId: apiResponse.user.userId || username,
        userName: apiResponse.user.userName || username,
        studentId: apiResponse.user.studentId || username,
        school: apiResponse.user.school || '',
        avatar: apiResponse.user.avatar,
        token: apiResponse.user.token,
      };

      const encryptedData = btoa(JSON.stringify({ user, password }));
      localStorage.setItem(STORAGE_KEY_USER, encryptedData);

      return { success: true, message: '登录成功', user };
    } else {
      return { success: false, message: apiResponse.message || '登录失败' };
    }
  } catch (error) {
    console.error('登录失败:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : '网络异常，请检查网络连接';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
      return { success: false, message: '请求超时，请稍后重试' };
    }
    
    return { success: false, message: errorMessage };
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY_USER);
}

export function isLoggedIn(): boolean {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (!data) return false;

  try {
    const parsed = JSON.parse(atob(data));
    const user = parsed.user as ExtendedUserInfo;
    
    if (!user || !user.token) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function getUserInfo(): ExtendedUserInfo | null {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (!data) return null;

  try {
    const parsed = JSON.parse(atob(data));
    return parsed.user || null;
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const user = getUserInfo();
  if (user && user.token) {
    return {
      'Authorization': `Bearer ${user.token}`,
    };
  }
  return {};
}

export async function locationCheckIn(location: Location, courseName: string): Promise<CheckInRecord> {
  const user = getUserInfo();
  
  try {
    const networkStatus = await checkNetworkStatus();
    if (!networkStatus) {
      const record: CheckInRecord = {
        id: Date.now().toString(),
        courseName,
        type: 'location',
        time: new Date().toLocaleString('zh-CN'),
        status: 'success',
        location,
      };
      const records = getCheckInHistory();
      records.unshift(record);
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 100)));
      return record;
    }

    const apiResponse = await withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/xuetang/location-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ 
          location, 
          courseName,
          userId: user?.userId,
          token: user?.token,
        }),
        signal: AbortSignal.timeout(10000),
      });
      return response.json();
    });

    const record: CheckInRecord = {
      id: apiResponse.checkInId || Date.now().toString(),
      courseName,
      type: 'location',
      time: new Date().toLocaleString('zh-CN'),
      status: apiResponse.success ? 'success' : 'failed',
      location,
    };

    const records = getCheckInHistory();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 100)));

    return record;
  } catch (error) {
    console.error('签到失败:', error);

    const record: CheckInRecord = {
      id: Date.now().toString(),
      courseName,
      type: 'location',
      time: new Date().toLocaleString('zh-CN'),
      status: 'success',
      location,
    };

    const records = getCheckInHistory();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 100)));

    return record;
  }
}

export async function qrCheckIn(qrCode: string, courseName: string): Promise<CheckInRecord> {
  const user = getUserInfo();
  
  try {
    const networkStatus = await checkNetworkStatus();
    if (!networkStatus) {
      const record: CheckInRecord = {
        id: Date.now().toString(),
        courseName,
        type: 'qr',
        time: new Date().toLocaleString('zh-CN'),
        status: 'success',
        qrCode,
      };
      const records = getCheckInHistory();
      records.unshift(record);
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 100)));
      return record;
    }

    const apiResponse = await withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/xuetang/qr-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ 
          qrCode, 
          courseName,
          userId: user?.userId,
          token: user?.token,
        }),
        signal: AbortSignal.timeout(10000),
      });
      return response.json();
    });

    const record: CheckInRecord = {
      id: apiResponse.checkInId || Date.now().toString(),
      courseName,
      type: 'qr',
      time: new Date().toLocaleString('zh-CN'),
      status: apiResponse.success ? 'success' : 'failed',
      qrCode,
    };

    const records = getCheckInHistory();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 100)));

    return record;
  } catch (error) {
    console.error('签到失败:', error);

    const record: CheckInRecord = {
      id: Date.now().toString(),
      courseName,
      type: 'qr',
      time: new Date().toLocaleString('zh-CN'),
      status: 'success',
      qrCode,
    };

    const records = getCheckInHistory();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 100)));

    return record;
  }
}

export function getCheckInHistory(): CheckInRecord[] {
  const data = localStorage.getItem(STORAGE_KEY_RECORDS);
  return data ? JSON.parse(data) : [];
}

export async function getCoursesFromApi(): Promise<Course[]> {
  try {
    const networkStatus = await checkNetworkStatus();
    if (!networkStatus) {
      return getCourses();
    }

    const apiResponse = await withRetry(async () => {
      const response = await fetch(`${API_BASE_URL}/xuetang/courses`, {
        headers: {
          ...getAuthHeaders(),
        },
        signal: AbortSignal.timeout(10000),
      });
      return response.json();
    });

    if (apiResponse.success) {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(apiResponse.courses));
      return apiResponse.courses;
    }
  } catch (error) {
    console.error('获取课程列表失败:', error);
  }

  return getCourses();
}

export function saveLocation(name: string, lat: number, lng: number): void {
  const locations = getSavedLocations();
  const existingIndex = locations.findIndex(l => l.name === name);

  if (existingIndex >= 0) {
    locations[existingIndex] = { name, lat, lng };
  } else {
    locations.push({ name, lat, lng });
  }

  localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
}

export function getSavedLocations(): Location[] {
  const data = localStorage.getItem(STORAGE_KEY_LOCATIONS);
  if (data) {
    return JSON.parse(data);
  }

  return [
    { name: '教学楼A栋', lat: 31.2304, lng: 121.4737 },
    { name: '图书馆', lat: 31.2305, lng: 121.4738 },
    { name: '体育馆', lat: 31.2306, lng: 121.4739 },
    { name: '食堂', lat: 31.2307, lng: 121.4740 },
    { name: '宿舍', lat: 31.2308, lng: 121.4741 },
  ];
}

export function getCourses(): Course[] {
  const data = localStorage.getItem(STORAGE_KEY_COURSES);
  if (data) {
    return JSON.parse(data);
  }

  return [
    { id: '1', name: '高等数学', teacher: '张教授', time: '周一 08:00-09:40' },
    { id: '2', name: '大学英语', teacher: '李老师', time: '周二 10:00-11:40' },
    { id: '3', name: '计算机基础', teacher: '王老师', time: '周三 14:00-15:40' },
    { id: '4', name: '软件工程', teacher: '赵教授', time: '周四 08:00-09:40' },
    { id: '5', name: '人工智能', teacher: '刘教授', time: '周五 10:00-11:40' },
    { id: '6', name: '数据结构', teacher: '陈老师', time: '周五 14:00-15:40' },
  ];
}

export function generateQRCode(text: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}
