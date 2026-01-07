import { ReactNode, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface BottomSheetProps {
  title: string;
  status?: 'draft' | 'saved';
  children: ReactNode;
  theme?: 'rice' | 'sugarcane';
  onExpandChange?: (isExpanded: boolean) => void;
}

export function BottomSheet({ title, status, children, theme = 'rice', onExpandChange }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };
  
  const statusColors = {
    saved: theme === 'rice' 
      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300/50' 
      : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300/50',
    draft: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300/50'
  };

  const headerGradient = theme === 'rice'
    ? 'from-amber-50 to-yellow-50'
    : 'from-emerald-50 to-green-50';

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-10px_60px_rgba(0,0,0,0.2)] border-t-2 border-gray-200/50 transition-transform duration-300 ${
        isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
      }`}
      style={{ maxHeight: isExpanded ? 'calc(100vh - 120px)' : 'auto' }}
    >
      {/* Handle with better styling */}
      <button
        onClick={handleToggle}
        className="w-full py-4 flex items-center justify-center group"
      >
        <div className="w-20 h-1.5 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full group-hover:from-gray-400 group-hover:via-gray-500 group-hover:to-gray-400 transition-all shadow-sm"></div>
      </button>

      {/* Header with gradient accent */}
      <div className={`px-6 pb-4 flex items-center justify-between border-b border-gray-200/70 bg-gradient-to-r ${headerGradient}`}>
        <div className="flex items-center gap-3">
          <h2 className="text-gray-900 font-semibold">{title}</h2>
          {status && (
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-medium border shadow-sm ${statusColors[status]}`}
            >
              {status === 'saved' ? '✓ บันทึกแล้ว' : '📝 ฉบับร่าง'}
            </span>
          )}
        </div>
        <button 
          onClick={handleToggle}
          className="p-2.5 hover:bg-white/80 rounded-xl transition-all hover:shadow-md"
        >
          {isExpanded ? (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {children}
      </div>
    </div>
  );
}