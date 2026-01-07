import { Flame, Sprout, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LayerSwitchProps {
  activeLayer: 'burn' | 'non-burn';
  onLayerChange: (layer: 'burn' | 'non-burn') => void;
  theme?: 'rice' | 'sugarcane';
  isVisible?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function LayerSwitch({ activeLayer, onLayerChange, theme = 'rice', isVisible = true, onZoomIn, onZoomOut }: LayerSwitchProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
      {/* Collapsed Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
        >
          {activeLayer === 'burn' ? (
            <>
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('burnArea')}</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('noBurnArea')}</span>
            </>
          )}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-2 border border-gray-100">
          {/* Header */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full flex items-center justify-between px-2 py-1.5 mb-2 hover:bg-gray-50 rounded-lg transition-all"
          >
            <span className="text-xs text-gray-600 font-medium">🗂️ {t('language') === 'th' ? 'ชั้นข้อมูล' : 'Layers'}</span>
            <ChevronUp className="w-4 h-4 text-gray-500" />
          </button>

          {/* Layer Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                onLayerChange('burn');
                setIsExpanded(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                activeLayer === 'burn'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="text-xs font-medium">{t('burnArea')}</span>
            </button>
            <button
              onClick={() => {
                onLayerChange('non-burn');
                setIsExpanded(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                activeLayer === 'non-burn'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span className="text-xs font-medium">{t('noBurnArea')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      {onZoomIn && onZoomOut && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          <button
            onClick={onZoomIn}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all border-b border-gray-100"
            aria-label={t('language') === 'th' ? 'ซูมเข้า' : 'Zoom in'}
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={onZoomOut}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
            aria-label={t('language') === 'th' ? 'ซูมออก' : 'Zoom out'}
          >
            <Minus className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}