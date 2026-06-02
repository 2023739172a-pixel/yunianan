import { UserInfo, Location, CheckInRecord, Course } from '../types/checkin';

const STORAGE_KEY_USER = 'xuetang_user';
const STORAGE_KEY_RECORDS = 'xuetang_records';
const STORAGE_KEY_LOCATIONS = 'xuetang_locations';
const STORAGE_KEY_COURSES = 'xuetang_courses';

export async function login(username: string, password: string): Promise<{ success: boolean; message: string; user?: UserInfo }> {
  if (!username || !password) {
    return { success: false, message: '请输入账号和密码' };
  }
  
  const mockUser: UserInfo = {
    userId: username,
    userName: username,
  };
  
  const encryptedData = btoa(JSON.stringify({ user: mockUser, password }));
  localStorage.setItem(STORAGE_KEY_USER, encryptedData);
  
  return { success: true, message: '登录成功', user: mockUser };
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY_USER);
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEY_USER) !== null;
}

export function getUserInfo(): UserInfo | null {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(atob(data));
    return parsed.user || null;
  } catch {
    return null;
  }
}

export async function locationCheckIn(location: Location, courseName: string): Promise<CheckInRecord> {
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

export async function qrCheckIn(qrCode: string, courseName: string): Promise<CheckInRecord> {
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

export function getCheckInHistory(): CheckInRecord[] {
  const data = localStorage.getItem(STORAGE_KEY_RECORDS);
  return data ? JSON.parse(data) : [];
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
    { id: '1', name: '高等数学', teacher: '张老师', time: '周一 08:00-09:40' },
    { id: '2', name: '大学英语', teacher: '李老师', time: '周二 10:00-11:40' },
    { id: '3', name: '计算机基础', teacher: '王老师', time: '周三 14:00-15:40' },
    { id: '4', name: '软件工程', teacher: '赵老师', time: '周四 08:00-09:40' },
    { id: '5', name: '人工智能', teacher: '刘老师', time: '周五 10:00-11:40' },
  ];
}

export function generateQRCode(text: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}
