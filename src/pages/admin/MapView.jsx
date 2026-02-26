import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Layers, Info } from 'lucide-react';
import { adminService } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await adminService.getLocationData();
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Institut Teknologi Del coordinates
  const center = [2.3832151975860763, 99.14605250841045];

  const getColor = (count) => {
    if (count >= 8) return '#ef4444';
    if (count >= 6) return '#f97316';
    if (count >= 4) return '#f59e0b';
    if (count >= 2) return '#eab308';
    return '#22c55e';
  };

  const getRadius = (count) => {
    return count * 80;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Peta Lokasi Kejadian</p>
            <p className="text-sm text-blue-700 mt-1">
              Peta ini menampilkan sebaran lokasi kejadian perundungan di Institut Teknologi Del. 
              Warna lebih gelap menunjukkan lebih banyak laporan di area tersebut.
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <MapContainer 
              center={center} 
              zoom={16} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((location, index) => (
                <CircleMarker
                  key={index}
                  center={[location.lat, location.lng]}
                  radius={getRadius(location.count) / 10}
                  fillColor={getColor(location.count)}
                  color={getColor(location.count)}
                  fillOpacity={0.6}
                  opacity={0.8}
                  onClick={() => setSelectedLocation(location)}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">{location.name}</p>
                      <p className="text-sm">{location.count} laporan</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm">1-2 laporan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">3-4 laporan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">5-6 laporan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">7+ laporan</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lokasi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {locations.sort((a, b) => b.count - a.count).map((location, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span className="font-medium">{location.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getColor(location.count) }}
                    />
                    <span className="font-semibold">{location.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
