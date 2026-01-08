import { X, Save, ArrowLeft, FileText } from 'lucide-react';
import { SavedRecord, storage } from '../utils/storage';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface RecordDetailModalProps {
  record: SavedRecord;
  onClose: () => void;
}

export function RecordDetailModal({ record, onClose }: RecordDetailModalProps) {
  const { t, language } = useLanguage();
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentStatus, setCurrentStatus] = useState(record.status);
  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const totalArea = record.polygons.reduce((sum, p) => sum + p.area, 0) / 1600;
    const burnArea = record.polygons.filter(p => p.type === 'burn').reduce((sum, p) => sum + p.area, 0) / 1600;
    const noBurnArea = record.polygons.filter(p => p.type === 'non-burn').reduce((sum, p) => sum + p.area, 0) / 1600;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.background = '#ffffff';
    container.style.color = '#111827';
    container.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans Thai, TH Sarabun New, Arial, sans-serif';
    container.style.padding = '24px';
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="font-size:24px">${record.type === 'rice' ? '🌾' : '🌿'}</div>
        <div style="font-weight:600">${record.type === 'rice' ? t('rice') : t('sugarcane')}</div>
        <div style="margin-left:auto;font-size:12px;color:#6b7280">${record.date} ${record.time}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="padding:8px;border:1px solid #e5e7eb;border-radius:12px">
          <div style="font-size:12px;color:#6b7280">${t('totalArea')}</div>
          <div style="font-size:18px;font-weight:700">${totalArea.toFixed(2)} ${t('rai')} • ${record.polygons.length} ${t('polygon')}</div>
        </div>
        <div style="padding:8px;border:1px solid #e5e7eb;border-radius:12px">
          <div style="font-size:12px;color:#6b7280">${t('location')}</div>
          <div style="font-size:12px;font-family:monospace">${record.location.lat.toFixed(6)}°, ${record.location.lng.toFixed(6)}°</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="padding:8px;border:1px solid #fee2e2;border-radius:12px;background:#fef2f2">
          <div style="font-size:12px;color:#ef4444">${t('burnArea')}</div>
          <div style="font-size:16px;font-weight:700">${burnArea.toFixed(2)} ${t('rai')}</div>
        </div>
        <div style="padding:8px;border:1px solid #dcfce7;border-radius:12px;background:#f0fdf4">
          <div style="font-size:12px;color:#10b981">${t('noBurnArea')}</div>
          <div style="font-size:16px;font-weight:700">${noBurnArea.toFixed(2)} ${t('rai')}</div>
        </div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px">${t('polygonList')}</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${record.polygons.map((p, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa">
              <div style="display:flex;align-items:center;gap:6px">
                <div style="width:12px;height:12px;border-radius:3px;background:${p.color}"></div>
                <div style="font-size:12px">${p.type === 'burn' ? '🔥' : '🌱'} Polygon #${i + 1}</div>
              </div>
              <div style="font-size:12px;font-weight:600">${(p.area / 1600).toFixed(2)} ${t('rai')}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ${record.photos && record.photos.length ? `
        <div style="margin-top:10px">
          <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px">${t('photos')} (${record.photos.length})</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            ${record.photos.map((photo, idx) => `
              <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#f3f4f6">
                <img src="${photo}" style="width:100%;height:160px;object-fit:cover" />
                <div style="font-size:11px;color:#6b7280;padding:4px 6px">${t('photos')} ${idx + 1}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    doc.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2));
    document.body.removeChild(container);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = language === 'th' ? `ข้อมูลพื้นที่เผา_${timestamp}.pdf` : `BurnAreaData_${timestamp}.pdf`;
    doc.save(filename);
  };

  const handleSaveDraft = () => {
    if (confirm(t('confirmSaveDraft'))) {
      storage.updateRecordStatus(record.id, 'saved');
      setCurrentStatus('saved');
    }
  };

  useEffect(() => {
    const loadMap = async () => {
      // @ts-ignore
      const L = await import('leaflet');
      
      if (!mapContainerRef.current || mapRef.current) return;

      const centerLat = record.location?.lat ?? (record.polygons[0]?.points[0]?.[0] ?? 13.7563);
      const centerLng = record.location?.lng ?? (record.polygons[0]?.points[0]?.[1] ?? 100.5018);

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="white"></circle>
          </svg>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([centerLat, centerLng], { icon: userIcon }).addTo(map)
        .bindPopup(`<strong>📍 ${t('location')}</strong>`);

      // Add polygons
      record.polygons.forEach((polygon, index) => {
        const poly = L.polygon(polygon.points, {
          color: polygon.color,
          fillColor: polygon.color,
          fillOpacity: 0.3,
          weight: 3,
        }).addTo(map);

        const areaInRai = (polygon.area / 1600).toFixed(2);
        const layerName = polygon.type === 'burn' ? `🔥 ${t('burnArea')}` : `🌱 ${t('noBurnArea')}`;
        
        poly.bindPopup(`
          <div class="text-sm">
            <strong>${layerName} #${index + 1}</strong><br/>
            <span class="text-lg font-semibold">${areaInRai} ${t('rai')}</span><br/>
            <span class="text-xs text-gray-600">≈ ${Math.round(polygon.area)} ${t('sqm')}</span>
          </div>
        `);
      });

      // Fit bounds to show all polygons
      if (record.polygons.length > 0) {
        const allPoints = record.polygons.flatMap(p => p.points);
        if (allPoints.length > 0) {
          map.fitBounds(allPoints);
        }
      }

      mapRef.current = map;
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [record]);

  const typeColor = record.type === 'rice' ? 'amber' : 'emerald';
  const typeIcon = record.type === 'rice' ? '🌾' : '🌿';
  const typeName = record.type === 'rice' ? t('rice') : t('sugarcane');
  const totalArea = record.polygons.reduce((sum, p) => sum + p.area, 0) / 1600;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .custom-marker { background: none; border: none; }
      `}</style>
      
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-600 px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <span className="text-3xl">{typeIcon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white text-xl font-semibold">{t('details')} - {typeName}</h2>
                {currentStatus === 'draft' ? (
                  <span className="bg-orange-500/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-orange-300/50">
                    📝 {t('draftStatus')}
                  </span>
                ) : (
                  <span className="bg-green-500/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-green-300/50">
                    ✓ {t('savedStatus')}
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm">{record.date} {record.time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200">
            <button onClick={exportPDF} className="px-3 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
          {/* Map */}
          <div ref={mapContainerRef} className="h-64 bg-gray-100"></div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Area Summary */}
            <div className={`p-4 bg-gradient-to-br from-${typeColor}-50 to-${typeColor}-100 rounded-2xl border-2 border-${typeColor}-200`}>
              <div className="text-sm text-gray-600 mb-1">{t('totalArea')}</div>
              <div className="text-3xl font-bold text-gray-900">{totalArea.toFixed(2)} {t('rai')}</div>
              <div className="text-sm text-gray-600 mt-1">
                {record.polygons.length} {t('polygon')} • ≈ {Math.round(totalArea * 1600)} {t('sqm')}
              </div>
            </div>

            {/* Polygons List */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('polygonList')}</h3>
              <div className="space-y-2">
                {record.polygons.map((polygon, index) => (
                  <div key={polygon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: polygon.color }}></div>
                      <span className="text-sm">
                        {polygon.type === 'burn' ? '🔥' : '🌱'} Polygon #{index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{(polygon.area / 1600).toFixed(2)} {t('rai')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rice Specific */}
            {record.type === 'rice' && (
              <div className="space-y-3">
                {record.riceFieldType && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">{t('riceFieldType')}</span>
                    <span className="text-sm font-semibold">
                      {record.riceFieldType === 'dry' ? `☀️ ${t('dryField')}` : record.riceFieldType === 'wet' ? `💧 ${t('rainyField')}` : `❓ ${t('unspecifiedField')}`}
                    </span>
                  </div>
                )}
                {record.riceVariety && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">{t('riceVariety')}</span>
                    <span className="text-sm font-semibold">{record.riceVariety}</span>
                  </div>
                )}
              </div>
            )}

            {/* Sugarcane Specific */}
            {record.type === 'sugarcane' && (
              <div className="space-y-3">
                {record.burnType && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">{t('burnType')}</span>
                    <span className="text-sm font-semibold">
                      {record.burnType === 'before' ? `🔥 ${t('burnBefore')}` : record.burnType === 'after' ? `✂️ ${t('burnAfter')}` : `❓ ${t('unspecifiedField')}`}
                    </span>
                  </div>
                )}
                {record.activities && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-2">{t('activitiesAfterBurn')}</div>
                    <div className="space-y-1 text-sm">
                      {record.activities.plowing && <div>✓ {t('plowing')}</div>}
                      {record.activities.collecting && <div>✓ {t('collecting')}</div>}
                      {record.activities.other && record.activities.otherText && (
                        <div>✓ {record.activities.otherText}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">{t('gpsLocation')}</div>
              <div className="text-sm font-mono">
                {record.location.lat.toFixed(6)}°, {record.location.lng.toFixed(6)}°
              </div>
              {record.location.accuracy && (
                <div className="text-xs text-gray-500 mt-1">
                  {t('accuracy')}: ±{record.location.accuracy}m
                </div>
              )}
            </div>

            {/* Remarks */}
            {record.remarks && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-2">{t('remarks')}</div>
                <div className="text-sm text-gray-900">{record.remarks}</div>
              </div>
            )}

            {/* Photos */}
            {record.photos && record.photos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📷</span>
                  <span>{t('photos')} ({record.photos.length})</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {record.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-md">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(photo, '_blank')}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <div className="text-xs text-white text-center">{t('photos')} {index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
              {t('recordedAt')}: {new Date(record.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
            </div>

            {/* Save Draft Button */}
            {currentStatus === 'draft' && (
              <div className="pt-4">
                <button
                  onClick={handleSaveDraft}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 active:scale-98 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{t('saveAsFinal')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
