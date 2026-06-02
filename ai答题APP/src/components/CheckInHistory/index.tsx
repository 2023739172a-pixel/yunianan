import { useState, useEffect } from 'react';
import { History, MapPin, QrCode, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { CheckInRecord } from '../../types/checkin';
import { getCheckInHistory } from '../../utils/checkin';

export default function CheckInHistory() {
  const [records, setRecords] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    setRecords(getCheckInHistory());
  }, []);

  const handleRefresh = () => {
    setRecords(getCheckInHistory());
  };

  const handleClearAll = () => {
    localStorage.removeItem('xuetang_records');
    setRecords([]);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">签到记录</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="text-blue-500 text-sm"
            >
              刷新
            </button>
            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-500 text-sm flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </button>
            )}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无签到记录</p>
            <p className="text-gray-400 text-sm mt-2">完成签到后会在这里显示</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  record.type === 'location' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {record.type === 'location' ? (
                    <MapPin className="w-5 h-5 text-blue-600" />
                  ) : (
                    <QrCode className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{record.courseName}</div>
                  <div className="text-sm text-gray-500">{record.time}</div>
                  {record.location && (
                    <div className="text-xs text-gray-400">{record.location.name}</div>
                  )}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  record.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {record.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
