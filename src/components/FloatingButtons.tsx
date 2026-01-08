import { Locate, MapPin, Pentagon, Edit3, XCircle } from 'lucide-react';
import { useState } from 'react';

interface FloatingButtonsProps {
  onLocateMe?: () => void;
  onDropPin?: () => void;
  onDrawPolygon?: () => void;
  onStopDrawing?: () => void;
  onEdit?: () => void;
  theme?: 'rice' | 'sugarcane';
  isDrawing?: boolean;
  isPinDropping?: boolean;
}

export function FloatingButtons({
  onLocateMe,
  onDropPin,
  onDrawPolygon,
  onStopDrawing,
  onEdit,
  theme = 'rice',
  isDrawing = false,
  isPinDropping = false,
}: FloatingButtonsProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  
  const primaryGradient = theme === 'rice'
    ? 'from-amber-500 to-yellow-600'
    : 'from-emerald-500 to-green-600';
    
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-3 z-10">
      {!isDrawing ? (
        <>
          <div className="relative">
            <button
              onClick={onLocateMe}
              onMouseEnter={() => setTooltip('locate')}
              onMouseLeave={() => setTooltip(null)}
              className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl active:scale-95 transition-all border border-gray-100"
              aria-label="ระบุตำแหน่งฉัน"
            >
              <Locate className="w-6 h-6 text-blue-600" />
            </button>
            {tooltip === 'locate' && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                ระบุตำแหน่งฉัน
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={onDropPin}
              onMouseEnter={() => setTooltip('pin')}
              onMouseLeave={() => setTooltip(null)}
              className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all border ${isPinDropping ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-300' : 'bg-white text-purple-600 border-gray-100 hover:shadow-2xl'}`}
              aria-label="บันทึกจุด"
            >
              <MapPin className={`w-6 h-6 ${isPinDropping ? 'text-white' : 'text-purple-600'}`} />
            </button>
            {tooltip === 'pin' && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                {isPinDropping ? 'คลิกบนแผนที่เพื่อปักหมุด' : 'เปิดโหมดปักหมุด'}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={onDrawPolygon}
              onMouseEnter={() => setTooltip('polygon')}
              onMouseLeave={() => setTooltip(null)}
              className={`w-14 h-14 bg-gradient-to-br ${primaryGradient} rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl active:scale-95 transition-all animate-pulse`}
              aria-label="วาดขอบเขตแปลง"
            >
              <Pentagon className="w-6 h-6 text-white" />
            </button>
            {tooltip === 'polygon' && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                วาดขอบเขตแปลง
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={onEdit}
              onMouseEnter={() => setTooltip('edit')}
              onMouseLeave={() => setTooltip(null)}
              className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl active:scale-95 transition-all border border-gray-100"
              aria-label="แก้ไข/ลบรูปทรง"
            >
              <Edit3 className="w-6 h-6 text-orange-600" />
            </button>
            {tooltip === 'edit' && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                คลิก Polygon เพื่อลบ
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="relative">
          <button
            onClick={onStopDrawing}
            className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl flex items-center justify-center hover:shadow-2xl active:scale-95 transition-all animate-bounce"
            aria-label="ยกเลิกการวาด"
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            ยกเลิกการวาด
          </div>
        </div>
      )}
    </div>
  );
}
