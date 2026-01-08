import { useEffect, useRef, useState } from 'react';

interface Polygon {
  id: string;
  points: [number, number][];
  area: number; // in square meters
  type: 'burn' | 'non-burn';
  color: string;
}

interface MapWithDrawingProps {
  children?: React.ReactNode | ((controls: any) => React.ReactNode);
  theme?: 'rice' | 'sugarcane';
  activeLayer?: 'burn' | 'non-burn';
  onPolygonCreated?: (polygon: Polygon) => void;
  onPolygonDeleted?: (id: string) => void;
  onMapReady?: (map: any) => void;
  onLocationSelected?: (location: { lat: number; lng: number }) => void;
  onControlsReady?: (controls: any) => void;
}

export function MapWithDrawing({ 
  children, 
  theme = 'rice',
  activeLayer = 'burn',
  onPolygonCreated,
  onPolygonDeleted,
  onMapReady,
  onLocationSelected,
  onControlsReady
}: MapWithDrawingProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState({ lat: 13.7563, lng: 100.5018 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPinDropping, setIsPinDropping] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const markersRef = useRef<any[]>([]);
  const polygonLayersRef = useRef<any[]>([]);
  const tempMarkersRef = useRef<any[]>([]);
  const tempLineRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  
  // Refs to access latest state in callbacks/closures
  const activeLayerRef = useRef(activeLayer);
  const themeRef = useRef(theme);
  const drawingPointsRef = useRef(drawingPoints);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  // Calculate polygon area using Leaflet GeometryUtil
  const calculateArea = (points: [number, number][]) => {
    if (!LRef.current || points.length < 3) return 0;
    
    // Simple area calculation using shoelace formula
    let area = 0;
    const earthRadius = 6371000; // meters
    
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const lat1 = points[i][0] * Math.PI / 180;
      const lat2 = points[j][0] * Math.PI / 180;
      const lng1 = points[i][1] * Math.PI / 180;
      const lng2 = points[j][1] * Math.PI / 180;
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * earthRadius * earthRadius / 2);
    return area;
  };

  const startDrawing = () => {
    console.log('🎨 Starting drawing mode...');
    setIsDrawing(true);
    setIsPinDropping(false); // Ensure pin dropping is off
    setDrawingPoints([]);
    // Clear temporary markers
    tempMarkersRef.current.forEach(m => m.remove());
    tempMarkersRef.current = [];
    if (tempLineRef.current) {
      tempLineRef.current.remove();
      tempLineRef.current = null;
    }
  };

  const stopDrawing = (pointsArg?: [number, number][]) => {
    console.log('⏸️ Stopping drawing mode...');
    setIsDrawing(false);
    
    const points = pointsArg && pointsArg.length ? pointsArg : drawingPointsRef.current;
    if (points.length >= 3) {
      // Create polygon
      const area = calculateArea(points);
      const currentActiveLayer = activeLayerRef.current;
      const currentTheme = themeRef.current;

      const color = currentActiveLayer === 'burn' 
        ? (currentTheme === 'rice' ? '#f59e0b' : '#ef4444')
        : '#10b981';
      
      const newPolygon: Polygon = {
        id: Date.now().toString(),
        points: points,
        area,
        type: currentActiveLayer,
        color,
      };
      
      console.log('✅ Creating polygon:', newPolygon);
      setPolygons(prev => [...prev, newPolygon]);
      if (onPolygonCreated) {
        onPolygonCreated(newPolygon);
      }
      
      // Draw polygon on map
      if (LRef.current && mapRef.current) {
        const polygonLayer = LRef.current.polygon(points, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          weight: 3,
        }).addTo(mapRef.current);
        
        const areaInRai = (area / 1600).toFixed(2);
        const layerName = currentActiveLayer === 'burn' ? '🔥 พื้นที่เผา' : '🌱 พื้นที่ไม่เผา';
        
        polygonLayer.bindPopup(`
          <div class="text-sm">
            <strong class="${currentActiveLayer === 'burn' ? 'text-red-600' : 'text-green-600'}">${layerName}</strong><br/>
            <span class="text-lg font-semibold">${areaInRai} ไร่</span><br/>
            <span class="text-xs text-gray-600">≈ ${Math.round(area)} ตร.ม.</span><br/>
            <button class="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600" onclick="window.deletePolygon('${newPolygon.id}')">
              ลบ Polygon
            </button>
          </div>
        `);
        
        polygonLayersRef.current.push({ id: newPolygon.id, layer: polygonLayer });
      }
    }
    
    // Clear temporary markers and lines
    tempMarkersRef.current.forEach(m => m.remove());
    tempMarkersRef.current = [];
    if (tempLineRef.current) {
      tempLineRef.current.remove();
      tempLineRef.current = null;
    }
    setDrawingPoints([]);
  };

  const deletePolygon = (id: string) => {
    console.log('🗑️ Deleting polygon:', id);
    setPolygons(prev => prev.filter(p => p.id !== id));
    const polygonLayer = polygonLayersRef.current.find(p => p.id === id);
    if (polygonLayer) {
      polygonLayer.layer.remove();
      polygonLayersRef.current = polygonLayersRef.current.filter(p => p.id !== id);
    }
    if (onPolygonDeleted) {
      onPolygonDeleted(id);
    }
  };

  const startPinDrop = () => {
    console.log('📍 Starting pin drop mode...');
    setIsPinDropping(true);
    setIsDrawing(false); // Ensure drawing is off
  };

  const stopPinDrop = () => {
    console.log('📍 Stopping pin drop mode...');
    setIsPinDropping(false);
  };
 
  const togglePinDrop = () => {
    setIsPinDropping(prev => {
      const next = !prev;
      console.log('📍 Toggling pin drop mode:', next);
      if (next) {
        setIsDrawing(false);
      }
      return next;
    });
  };

  useEffect(() => {
    // Make deletePolygon available globally
    (window as any).deletePolygon = deletePolygon;
    
    return () => {
      delete (window as any).deletePolygon;
    };
  }, []);

  useEffect(() => {
    const loadMap = async () => {
      const L = await import('leaflet');
      LRef.current = L;
      
      if (!mapContainerRef.current || mapRef.current) return;

      console.log('🗺️ Initializing map...');
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false, // Disable default zoom control
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative">
            <div class="absolute w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-pulse" style="top: -64px; left: -64px;"></div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="2" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="white"></circle>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userIcon,
        zIndexOffset: 1000 
      }).addTo(map);
      
      userMarker.bindPopup(`
        <div class="text-sm">
          <strong>📍 ตำแหน่งปัจจุบัน</strong><br/>
          Lat: ${userLocation.lat.toFixed(4)}°<br/>
          Lng: ${userLocation.lng.toFixed(4)}°
        </div>
      `);

      L.circle([userLocation.lat, userLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 50,
      }).addTo(map);

      // Map click handler - FIXED
      map.on('click', (e: any) => {
        const originalTarget = e.originalEvent ? (e.originalEvent.target as HTMLElement) : null;
        if (originalTarget && originalTarget.closest('.overlay-controls')) {
          return;
        }
        console.log('🖱️ Map clicked. Drawing mode:', (window as any).__isDrawingMode);
        
        // Check if we're in drawing mode using the current state from the ref
        // We need to use a ref to get the latest state in the event handler
        if ((window as any).__isDrawingMode) {
          console.log('✏️ Adding point:', e.latlng.lat, e.latlng.lng);
          const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
          
          setDrawingPoints(prev => {
            const updated = [...prev, newPoint];
            console.log(`📍 Total points: ${updated.length}`);
            
            const currentActiveLayer = activeLayerRef.current;

            // Add temporary marker
            const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
              radius: 6,
              fillColor: currentActiveLayer === 'burn' ? '#ef4444' : '#10b981',
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            }).addTo(map);
            
            tempMarkersRef.current.push(marker);
            
            // Draw temporary line
            if (tempLineRef.current) {
              tempLineRef.current.remove();
            }
            
            if (updated.length > 1) {
              tempLineRef.current = L.polyline(updated, {
                color: currentActiveLayer === 'burn' ? '#ef4444' : '#10b981',
                weight: 2,
                dashArray: '5, 5',
              }).addTo(map);
            }
            
            if (updated.length >= 3 && LRef.current) {
              const first = updated[0];
              const current = newPoint;
              const firstLatLng = LRef.current.latLng(first[0], first[1]);
              const currentLatLng = LRef.current.latLng(current[0], current[1]);
              const distance = currentLatLng.distanceTo(firstLatLng);
              const threshold = 30;
              if (distance <= threshold) {
                stopDrawing(updated);
              }
            }
            
            return updated;
          });
        } else if ((window as any).__isPinDropping) {
          console.log('📌 Pin drop mode active');
          // Pin drop only when mode is active
          markersRef.current.forEach(m => m.remove());
          markersRef.current = [];

          const newMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: L.divIcon({
              className: 'custom-pin-marker',
              html: `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#8b5cf6" stroke="white" stroke-width="2" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                </svg>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })
          }).addTo(map);

          newMarker.bindPopup(`
            <div class="text-sm">
              <strong>📌 ตำแหน่งที่เลือก</strong><br/>
              Lat: ${e.latlng.lat.toFixed(6)}°<br/>
              Lng: ${e.latlng.lng.toFixed(6)}°
            </div>
          `).openPopup();

          markersRef.current.push(newMarker);
          
          if (onLocationSelected) {
            onLocationSelected({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        } else {
          // No pin dropping; allow normal map interactions (pan/zoom)
        }
      });

      // Double click to finish drawing - FIXED
      map.on('dblclick', (e: any) => {
        const originalTarget = e.originalEvent ? (e.originalEvent.target as HTMLElement) : null;
        if (originalTarget && originalTarget.closest('.overlay-controls')) {
          return;
        }
        if ((window as any).__isDrawingMode) {
          console.log('✅ Double-click detected - finishing polygon');
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          stopDrawing();
        }
      });

      mapRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLat = position.coords.latitude;
            const newLng = position.coords.longitude;
            setUserLocation({ lat: newLat, lng: newLng });
            map.setView([newLat, newLng], 15);
            userMarker.setLatLng([newLat, newLng]);
          },
          () => {}
        );
      }

      // Call onMapReady callback
      if (onMapReady) {
        onMapReady(map);
      }
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Dependencies - Init map once

  // Update drawing mode flag when state changes
  useEffect(() => {
    (window as any).__isDrawingMode = isDrawing;
    console.log('🔄 Drawing mode updated:', isDrawing);
  }, [isDrawing]);

  // Update pin drop mode flag when state changes
  useEffect(() => {
    (window as any).__isPinDropping = isPinDropping;
    console.log('🔄 Pin drop mode updated:', isPinDropping);
  }, [isPinDropping]);

  // Clear temp drawings if stopped without completing
  useEffect(() => {
    if (!isDrawing && drawingPoints.length > 0) {
      tempMarkersRef.current.forEach(m => m.remove());
      tempMarkersRef.current = [];
      if (tempLineRef.current) {
        tempLineRef.current.remove();
        tempLineRef.current = null;
      }
      setDrawingPoints([]);
    }
  }, [isDrawing]);

  // Controls object to pass to children
  const controls = {
    startDrawing,
    stopDrawing,
    isDrawing,
    polygons,
    startPinDrop,
    stopPinDrop,
    togglePinDrop,
    isPinDropping,
  };

  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(controls);
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        
        .custom-user-marker, .custom-pin-marker {
          background: none;
          border: none;
        }
        
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 0;
          cursor: ${isDrawing ? 'crosshair' : 'grab'};
        }
        
        .leaflet-container:active {
          cursor: ${isDrawing ? 'crosshair' : 'grabbing'};
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
        }
        
        .leaflet-popup-content {
          margin: 8px;
        }
      `}</style>
      <div ref={mapContainerRef} className="relative w-full h-full">
        {/* Drawing Instructions */}
        {isDrawing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-gray-700">
            <div className="text-sm text-center">
              <div className="font-semibold mb-1">🎨 กำลังวาด {activeLayer === 'burn' ? 'พื้นที่เผา' : 'พื้นที่ไม่เผา'}</div>
              <div className="text-xs text-gray-300">
                คลิกเพื่อเพิ่มจุด • ดับเบิลคลิกเพื่อสิ้นสุด • จุด: {drawingPoints.length}
              </div>
            </div>
          </div>
        )}

        {/* Polygon Summary */}
        {polygons.length > 0 && !isDrawing && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-gray-100 max-w-xs">
            <div className="text-sm font-semibold mb-2">📊 สรุป Polygon</div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {polygons.map((polygon, index) => (
                <div key={polygon.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: polygon.color }}></div>
                    <span>{polygon.type === 'burn' ? '🔥' : '🌱'} #{index + 1}</span>
                  </div>
                  <span className="font-semibold">{(polygon.area / 1600).toFixed(2)} ไร่</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 font-semibold flex justify-between">
                <span>รวม:</span>
                <span>{polygons.reduce((sum, p) => sum + p.area / 1600, 0).toFixed(2)} ไร่</span>
              </div>
            </div>
          </div>
        )}

        {/* Children (Floating Buttons) - pass drawing controls */}
        <div
          className="overlay-controls relative z-[1000]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {typeof children === 'function' 
            ? children(controls)
            : children
          }
        </div>
      </div>
    </>
  );
}
