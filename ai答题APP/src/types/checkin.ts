export interface UserInfo {
  userId: string;
  userName: string;
  avatar?: string;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface CheckInRecord {
  id: string;
  courseName: string;
  type: 'location' | 'qr';
  time: string;
  status: 'success' | 'failed';
  location?: Location;
  qrCode?: string;
}

export interface Course {
  id: string;
  name: string;
  teacher: string;
  time: string;
}

export interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
