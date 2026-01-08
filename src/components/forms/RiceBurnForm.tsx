import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Camera, X, Flame, Sprout, RefreshCw } from 'lucide-react';
import { SegmentedControl } from '../form-fields/SegmentedControl';
import { Toggle } from '../form-fields/Toggle';
 

interface RiceBurnFormProps {
  onSave: (data: any) => void;
  onSaveDraft: (data: any) => void;
  polygons?: any[];
  onNavigateToMap?: () => void;
  mapSelectedLocation?: { lat: number; lng: number } | null;
}

export function RiceBurnForm({ onSave, onSaveDraft, polygons = [], onNavigateToMap, mapSelectedLocation }: RiceBurnFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [riceFieldType, setRiceFieldType] = useState<'dry' | 'wet'>('dry');
  const [riceVariety, setRiceVariety] = useState('');
  const [otherVariety, setOtherVariety] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, accuracy?: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get GPS location on component mount
  useEffect(() => {
    if (gpsEnabled) {
      getCurrentLocation();
    }
  }, [gpsEnabled]);
  
  useEffect(() => {
    if (mapSelectedLocation) {
      setCurrentLocation({ lat: mapSelectedLocation.lat, lng: mapSelectedLocation.lng, accuracy: currentLocation?.accuracy });
    }
  }, [mapSelectedLocation]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('GPS ไม่รองรับในเบราว์เซอร์นี้');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy
        });
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'ไม่สามารถรับตำแหน่งได้';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'ไม่ได้อนุญาตให้เข้าถึงตำแหน่ง';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'ตำแหน่งไม่พร้อมใช้งาน';
            break;
          case error.TIMEOUT:
            errorMessage = 'หมดเวลาในการรับตำแหน่ง';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    const data = {
      date,
      time,
      riceFieldType,
      riceVariety: riceVariety === 'other' ? otherVariety : riceVariety,
      remarks,
      photos,
      polygons,
      location: gpsEnabled && currentLocation ? {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: currentLocation.accuracy
      } : null,
    };
    
    if (isDraft) {
      onSaveDraft(data);
    } else {
      onSave(data);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-2 flex items-center gap-1.5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span>วันที่</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2 flex items-center gap-1.5">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <span>เวลา</span>
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm text-gray-700 mb-3 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-green-600" />
          </div>
          <span>ตำแหน่ง</span>
        </label>
        <Toggle
          label="บันทึกตำแหน่งอัตโนมัติ (GPS)"
          checked={gpsEnabled}
          onChange={setGpsEnabled}
        />
        {gpsEnabled ? (
          <div className="mt-3 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl shadow-sm">
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              {locationLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังรับตำแหน่ง GPS...</span>
                </div>
              ) : locationError ? (
                <div className="text-red-600 bg-red-50 p-2 rounded-lg">
                  ⚠️ {locationError}
                </div>
              ) : currentLocation ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📍</span>
                    <span className="text-xs text-gray-600">Latitude:</span>
                    <span>{currentLocation.lat.toFixed(6)}° N</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📍</span>
                    <span className="text-xs text-gray-600">Longitude:</span>
                    <span>{currentLocation.lng.toFixed(6)}° E</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      ✓ ความแม่นยำ: ±{currentLocation.accuracy ? Math.round(currentLocation.accuracy) : '?'} เมตร
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  ไม่มีข้อมูลตำแหน่ง
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                {locationLoading ? 'กำลังโหลด...' : '🔄 อัปเดต GPS'}
              </button>
              <button
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-98 transition-all"
                onClick={onNavigateToMap}
              >
                📌 เลือกจากแผนที่
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="X (Longitude)"
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <input
              type="text"
              placeholder="Y (Latitude)"
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        )}
      </div>

      {/* Rice Field Type */}
      <div>
        <label className="block text-sm text-gray-700 mb-3 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-base">🌾</span>
          </div>
          <span>ชนิดนาข้าว</span>
        </label>
        <SegmentedControl
          options={[
            { value: 'dry', label: '☀️ นาปี' },
            { value: 'wet', label: '💧 นาปรัง' },
          ]}
          value={riceFieldType}
          onChange={(value) => setRiceFieldType(value as 'dry' | 'wet')}
        />
      </div>

      {/* Rice Variety */}
      <div>
        <label className="block text-sm text-gray-700 mb-3 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Sprout className="w-4 h-4 text-yellow-600" />
          </div>
          <span>พันธุ์ข้าว</span>
        </label>
        <select
          value={riceVariety}
          onChange={(e) => setRiceVariety(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all"
        >
          <option value="">เลือกพันธุ์ข้าว</option>
          <option value="ข้าวหอมมะลิ">ข้าวหอมมะลิ</option>
          <option value="ข้าวเหนียว">ข้าวเหนียว</option>
          <option value="กข15">กข15</option>
          <option value="ปทุมธานี1">ปทุมธานี1</option>
          <option value="other">อื่นๆ (โปรดระบุ)</option>
        </select>
        {riceVariety === 'other' && (
          <input
            type="text"
            placeholder="โปรดระบุพันธุ์ข้าว"
            value={otherVariety}
            onChange={(e) => setOtherVariety(e.target.value)}
            className="mt-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all"
          />
        )}
      </div>

      {/* Burn Area */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-700 font-medium">พื้นที่เผา</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {polygons.filter(p => p.type === 'burn').reduce((sum, p) => sum + p.area / 1600, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            ไร่
          </div>
          <div className="text-xs text-gray-500 mt-2 bg-red-100/50 px-3 py-1.5 rounded-lg inline-block">
            {polygons.filter(p => p.type === 'burn').length} polygon
          </div>
        </div>
        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-200">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-700 font-medium">พื้นที่ไม่เผา</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {polygons.filter(p => p.type === 'non-burn').reduce((sum, p) => sum + p.area / 1600, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            ไร่
          </div>
          <div className="text-xs text-gray-500 mt-2 bg-green-100/50 px-3 py-1.5 rounded-lg inline-block">
            {polygons.filter(p => p.type === 'non-burn').length} polygon
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm text-gray-700 mb-3 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
            <Camera className="w-4 h-4 text-pink-600" />
          </div>
          <span>แนบรูปถ่าย (ทางเลือก)</span>
        </label>
        
        {/* Photo Preview Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Button */}
        <label className="w-full px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-pink-300 hover:bg-pink-50 active:scale-98 transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer">
          <Camera className="w-6 h-6 text-pink-500" />
          <span>📸 ถ่ายรูป / เลือกรูป</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </label>
        {photos.length > 0 && (
          <div className="text-xs text-gray-600 mt-2 text-center">
            {photos.length} รูป
          </div>
        )}
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-sm text-gray-700 mb-3 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-base">📝</span>
          </div>
          <span>หมายเหตุ / Remark</span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="กิจกรรมหลังเผา เช่น ไถ/ปล่อยตอซัง/อื่นๆ"
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-2xl hover:from-orange-200 hover:to-orange-300 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
          >
            📝 บันทึกฉบับร่าง
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 active:scale-98 transition-all shadow-sm"
          >
            🔄 ล้างค่า
          </button>
        </div>
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-2xl hover:from-amber-600 hover:to-yellow-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
        >
          {loading ? '⏳ กำลังบันทึก...' : '✓ บันทึกข้อมูล'}
        </button>
      </div>
    </div>
  );
}
