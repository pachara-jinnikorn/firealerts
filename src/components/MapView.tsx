import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  children?: React.ReactNode;
  theme?: 'rice' | 'sugarcane';
}

export function MapView({ children, theme = 'rice' }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState({ lat: 13.7563, lng: 100.5018 });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<any[]>([]);
  const polygonRef = useRef<any>(null);

  const calculateAreaFromLatLngs = (latlngs: Array<{ lat: number; lng: number }>) => {
    if (!latlngs || latlngs.length < 3) return 0;
    const earthRadius = 6371000;
    let area = 0;
    for (let i = 0; i < latlngs.length; i++) {
      const j = (i + 1) % latlngs.length;
      const lat1 = latlngs[i].lat * Math.PI / 180;
      const lat2 = latlngs[j].lat * Math.PI / 180;
      const lng1 = latlngs[i].lng * Math.PI / 180;
      const lng2 = latlngs[j].lng * Math.PI / 180;
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs(area * earthRadius * earthRadius / 2);
    return area;
  };

  useEffect(() => {
    // Import Leaflet dynamically
    const loadMap = async () => {
      // @ts-ignore
      const L = await import('leaflet');
      
      if (!mapContainerRef.current || mapRef.current) return;

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom user location icon
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

      // Add user location marker
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

      // Add accuracy circle
      L.circle([userLocation.lat, userLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 50,
      }).addTo(map);

      // Add sample polygon
      const polygonPoints: [number, number][] = [
        [userLocation.lat + 0.001, userLocation.lng - 0.001],
        [userLocation.lat + 0.002, userLocation.lng + 0.001],
        [userLocation.lat + 0.0015, userLocation.lng + 0.002],
        [userLocation.lat + 0.0005, userLocation.lng + 0.0015],
      ];

      const polygon = L.polygon(polygonPoints, {
        color: theme === 'rice' ? '#f59e0b' : '#ef4444',
        fillColor: theme === 'rice' ? '#fbbf24' : '#ef4444',
        fillOpacity: 0.3,
        weight: 3,
      }).addTo(map);

      polygonRef.current = polygon;

      // Calculate area (rough estimation)
      const latlngs: Array<{ lat: number; lng: number }> = (polygon.getLatLngs()[0] || []).map((p: any) => ({ lat: p.lat, lng: p.lng }));
      const area = calculateAreaFromLatLngs(latlngs);
      const areaInRai = (area / 1600).toFixed(2); // Convert to Rai (1 Rai ≈ 1600 m²)

      polygon.bindPopup(`
        <div class="text-sm">
          <strong class="text-red-600">🔥 พื้นที่เผา</strong><br/>
          <span class="text-lg font-semibold">${areaInRai} ไร่</span><br/>
          <span class="text-xs text-gray-600">≈ ${Math.round(area)} ตร.ม.</span>
        </div>
      `);

      // Click to add marker
      map.on('click', (e: any) => {
        setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        
        // Remove previous selected marker
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new marker
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
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [theme]);

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
        {/* Children (Floating Buttons) */}
        <div className="relative z-[1000]">
          {children}
        </div>
      </div>
    </>
  );
}
