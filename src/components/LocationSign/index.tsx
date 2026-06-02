import { useState } from 'react';
import { MapPin, Search, Plus, Check, Clock, Map } from 'lucide-react';
import { Location, Course } from '../../types/checkin';
import { locationCheckIn, getSavedLocations, saveLocation, getCourses } from '../../utils/checkin';

interface LocationSignProps {
  onSuccess?: () => void;
}

export default function LocationSign({ onSuccess }: LocationSignProps) {
  const locations = getSavedLocations();
  const courses = getCourses();
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(locations[0] || null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);

  const handleSignIn = async () => {
    if (!selectedLocation || !selectedCourse) return;

    setLoading(true);
    try {
      await locationCheckIn(selectedLocation, selectedCourse.name);
      setResultSuccess(true);
    } catch {
      setResultSuccess(false);
    } finally {
      setLoading(false);
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        onSuccess?.();
      }, 2000);
    }
  };

  const handleSaveCustom = () => {
    if (!customLocation || !customLat || !customLng) return;
    
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    saveLocation(customLocation, lat, lng);
    setSelectedLocation({ name: customLocation, lat, lng });
    setShowCustom(false);
    setCustomLocation('');
    setCustomLat('');
    setCustomLng('');
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex items-center mb-4">
          <MapPin className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">虚拟定位签到</h3>
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

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-700 text-sm font-medium">选择位置</label>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="text-blue-500 text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加位置
            </button>
          </div>

          {showCustom && (
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="位置名称"
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="纬度"
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="经度"
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleSaveCustom}
                className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg text-sm"
              >
                保存位置
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {locations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setSelectedLocation(loc)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedLocation?.name === loc.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <Map className="w-4 h-4 mr-2" />
                  <span className="font-medium text-sm">{loc.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignIn}
          disabled={!selectedLocation || !selectedCourse || loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              签到中...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              确认签到
            </>
          )}
        </button>
      </div>

      {showResult && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${resultSuccess ? 'bg-green-500' : 'bg-red-500'} bg-opacity-90`}>
          <div className="text-center text-white">
            {resultSuccess ? (
              <>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">签到成功!</h3>
                <p className="mt-2">课程: {selectedCourse?.name}</p>
                <p>位置: {selectedLocation?.name}</p>
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
