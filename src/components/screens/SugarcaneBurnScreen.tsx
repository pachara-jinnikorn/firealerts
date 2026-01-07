import { useState } from 'react';
import { AppBar } from '../AppBar';
import { MapWithDrawing } from '../MapWithDrawing';
import { FloatingButtons } from '../FloatingButtons';
import { BottomSheet } from '../BottomSheet';
import { SugarcaneBurnForm } from '../forms/SugarcaneBurnForm';
import { Toast } from '../Toast';
import { LayerSwitch } from '../LayerSwitch';
import { storage, SavedRecord } from '../../utils/storage';
import { useLanguage } from '../../contexts/LanguageContext';

export function SugarcaneBurnScreen() {
  const { t, language } = useLanguage();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeLayer, setActiveLayer] = useState<'burn' | 'non-burn'>('burn');
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygons, setPolygons] = useState<any[]>([]);
  const drawingControlsRef = useState<any>({});
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const handleNavigateToMap = () => {
    setIsSheetExpanded(false);
  };

  const handleSave = (data: any) => {
    const record: SavedRecord = {
      id: Date.now().toString(),
      type: 'sugarcane',
      date: data.date,
      time: data.time,
      location: data.location || {
        lat: 13.7563,
        lng: 100.5018,
        accuracy: 5,
      },
      polygons: polygons,
      burnType: data.burnType,
      activities: data.activities,
      remarks: data.remarks,
      photos: data.photos,
      createdAt: new Date().toISOString(),
      status: 'saved',
    };
    
    storage.saveRecord(record);
    const burnPolygons = polygons.filter(p => p.type === 'burn');
    const nonBurnPolygons = polygons.filter(p => p.type === 'non-burn');
    setToastMessage(`✓ ${t('saveData')} - ${t('burnArea')}: ${burnPolygons.length}, ${t('noBurnArea')}: ${nonBurnPolygons.length}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    // Reset
    setPolygons([]);
  };

  const handleSaveDraft = (data: any) => {
    const record: SavedRecord = {
      id: Date.now().toString(),
      type: 'sugarcane',
      date: data.date,
      time: data.time,
      location: data.location || {
        lat: 13.7563,
        lng: 100.5018,
        accuracy: 5,
      },
      polygons: polygons,
      burnType: data.burnType,
      activities: data.activities,
      remarks: data.remarks,
      photos: data.photos,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    
    storage.saveRecord(record);
    setToastMessage(`📝 ${t('saveDraft')}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handleLocateMe = () => {
    if (drawingControlsRef.current?.isDrawing) return;
    
    setToastMessage('🎯 ' + t('gettingLocation'));
    setShowToast(true);
    
    if (!navigator.geolocation) {
      setToastMessage('⚠️ GPS ไม่รองรับในเบราว์เซอร์นี้');
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstance) {
          mapInstance.setView([latitude, longitude], 18);
          setToastMessage(`✅ ${t('location')} ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } else {
          setToastMessage(`📍 ${t('location')}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setTimeout(() => setShowToast(false), 3000);
      },
      (error) => {
        console.error('GPS Error:', error);
        let errorMessage = '⚠️ ไม่สามารถรับตำแหน่งได้';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '⚠️ ไม่ได้อนุญาตให้เข้าถึงตำแหน่ง';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '⚠️ ตำแหน่งไม่พร้อมใช้งาน';
            break;
          case error.TIMEOUT:
            errorMessage = '⚠️ หมดเวลาในการรับตำแหน่ง';
            break;
        }
        setToastMessage(errorMessage);
        setTimeout(() => setShowToast(false), 3000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };
  
  const handleDropPin = () => {
    if (drawingControlsRef.current?.isDrawing) return;
    setToastMessage('📍 ' + (language === 'th' ? 'คลิกบนแผนที่เพื่อเลือกตำแหน่ง' : 'Click on map to select location'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handleDrawPolygon = () => {
    if (drawingControlsRef.current?.startDrawing) {
      drawingControlsRef.current.startDrawing();
      setIsDrawing(true);
      const layerText = activeLayer === 'burn' ? t('burnArea') : t('noBurnArea');
      setToastMessage(`🎨 ${language === 'th' ? `เริ่มวาด ${layerText} - คลิกเพื่อเพิ่มจุด, ดับเบิลคลิกเพื่อสิ้นสุด` : `Draw ${layerText} - Click to add points, Double-click to finish`}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };
  
  const handleStopDrawing = () => {
    if (drawingControlsRef.current?.stopDrawing) {
      drawingControlsRef.current.stopDrawing();
      setIsDrawing(false);
    }
  };
  
  const handlePolygonCreated = (polygon: any) => {
    setPolygons(prev => [...prev, polygon]);
    setIsDrawing(false);
    const layerText = polygon.type === 'burn' ? `🔥 ${t('burnArea')}` : `🌱 ${t('noBurnArea')}`;
    setToastMessage(`✓ ${language === 'th' ? 'สร้าง' : 'Created'} ${layerText} - ${(polygon.area / 1600).toFixed(2)} ${t('rai')}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handlePolygonDeleted = (id: string) => {
    setPolygons(prev => prev.filter(p => p.id !== id));
    setToastMessage('🗑️ ' + (language === 'th' ? 'ลบ Polygon แล้ว' : 'Polygon deleted'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <AppBar title={t('appTitle')} subtitle={t('appSubtitle')} theme="sugarcane" />

      {/* Map with Floating Buttons */}
      <div className="flex-1 relative">
        <MapWithDrawing 
          theme="sugarcane"
          activeLayer={activeLayer}
          onPolygonCreated={handlePolygonCreated}
          onPolygonDeleted={handlePolygonDeleted}
          onMapReady={setMapInstance}
        >
          {(controls: any) => {
            drawingControlsRef.current = controls;
            return (
              <>
                <LayerSwitch 
                  activeLayer={activeLayer} 
                  onLayerChange={setActiveLayer}
                  theme="sugarcane"
                  isVisible={!isSheetExpanded}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                />
                <FloatingButtons
                  theme="sugarcane"
                  isDrawing={controls.isDrawing}
                  onLocateMe={handleLocateMe}
                  onDropPin={handleDropPin}
                  onDrawPolygon={handleDrawPolygon}
                  onStopDrawing={handleStopDrawing}
                  onEdit={() => {
                    setToastMessage('💡 ' + (language === 'th' ? 'คลิกที่ Polygon บนแผนที่ แล้วกดปุ่ม "ลบ" ใน popup' : 'Click on polygon, then press "Delete" in popup'));
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                />
              </>
            );
          }}
        </MapWithDrawing>

        {/* Bottom Sheet with Form */}
        <BottomSheet title={`${t('sugarcaneTitle')} (${t('sugarcaneSubtitle')})`} status="draft" theme="sugarcane" onExpandChange={setIsSheetExpanded}>
          <SugarcaneBurnForm onSave={handleSave} onSaveDraft={handleSaveDraft} polygons={polygons} onNavigateToMap={handleNavigateToMap} />
        </BottomSheet>
      </div>

      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} />}
    </div>
  );
}