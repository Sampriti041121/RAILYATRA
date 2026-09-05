import React, { useState } from 'react';
import { X, Navigation, CheckCircle2, ArrowRight, MapPin, RefreshCw, AlertCircle, Compass } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (stationCode: string) => void;
}

interface PanIndiaStation {
  code: string;
  name: string;
  zone: string;
  state: string;
  lat: number;
  lon: number;
  platforms: number;
  distanceKm?: number;
}

// Major Pan-India Junction Dataset across Railway Zones
const PAN_INDIA_STATIONS: PanIndiaStation[] = [
  { code: 'NDLS', name: 'New Delhi Junction', zone: 'Northern Railway (NR)', state: 'Delhi', lat: 28.6424, lon: 77.2195, platforms: 16 },
  { code: 'CNB', name: 'Kanpur Central', zone: 'North Central Railway (NCR)', state: 'Uttar Pradesh', lat: 26.4542, lon: 80.3500, platforms: 10 },
  { code: 'PRYJ', name: 'Prayagraj Junction', zone: 'North Central Railway (NCR)', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, platforms: 11 },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', zone: 'East Central Railway (ECR)', state: 'Uttar Pradesh', lat: 25.2818, lon: 83.1152, platforms: 8 },
  { code: 'PNBE', name: 'Patna Junction', zone: 'East Central Railway (ECR)', state: 'Bihar', lat: 25.6093, lon: 85.1376, platforms: 10 },
  { code: 'HWH', name: 'Howrah Junction', zone: 'Eastern Railway (ER)', state: 'West Bengal', lat: 22.5839, lon: 88.3431, platforms: 23 },
  { code: 'CSMT', name: 'Mumbai CSMT', zone: 'Central Railway (CR)', state: 'Maharashtra', lat: 18.9401, lon: 72.8347, platforms: 18 },
  { code: 'SBC', name: 'KSR Bengaluru City', zone: 'South Western Railway (SWR)', state: 'Karnataka', lat: 12.9781, lon: 77.5694, platforms: 10 },
  { code: 'MAS', name: 'Chennai Central', zone: 'Southern Railway (SR)', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, platforms: 12 },
  { code: 'SC', name: 'Secunderabad Junction', zone: 'South Central Railway (SCR)', state: 'Telangana', lat: 17.4339, lon: 78.5017, platforms: 10 },
  { code: 'GHY', name: 'Guwahati Junction', zone: 'Northeast Frontier Railway (NFR)', state: 'Assam', lat: 26.1860, lon: 91.7539, platforms: 7 },
  { code: 'ADI', name: 'Ahmedabad Junction', zone: 'Western Railway (WR)', state: 'Gujarat', lat: 23.0225, lon: 72.5714, platforms: 12 },
  { code: 'NGP', name: 'Nagpur Junction', zone: 'Central Railway (CR)', state: 'Maharashtra', lat: 21.1500, lon: 79.0888, platforms: 8 }
];

// Haversine formula to compute distance between 2 coordinates in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSelectStation }) => {
  const [detectingGps, setDetectingGps] = useState<boolean>(false);
  const [currentGps, setCurrentGps] = useState<{ lat: number; lon: number; acc: number } | null>(null);
  const [sortedStations, setSortedStations] = useState<PanIndiaStation[]>(PAN_INDIA_STATIONS);
  const [nearestStation, setNearestStation] = useState<PanIndiaStation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleDetectGps = () => {
    setDetectingGps(true);
    setErrorMsg('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const acc = Math.round(position.coords.accuracy);

          setCurrentGps({ lat, lon, acc });

          // Compute distances to all stations
          const calculated = PAN_INDIA_STATIONS.map((st) => ({
            ...st,
            distanceKm: calculateHaversineDistance(lat, lon, st.lat, st.lon)
          }));

          calculated.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

          setSortedStations(calculated);
          setNearestStation(calculated[0]);
          setDetectingGps(false);
        },
        (error) => {
          console.warn('GPS location fallback:', error.message);
          // Fallback to New Delhi default coordinate if permission denied
          const fallbackLat = 28.6424;
          const fallbackLon = 77.2195;
          setCurrentGps({ lat: fallbackLat, lon: fallbackLon, acc: 50 });

          const calculated = PAN_INDIA_STATIONS.map((st) => ({
            ...st,
            distanceKm: calculateHaversineDistance(fallbackLat, fallbackLon, st.lat, st.lon)
          }));

          calculated.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
          setSortedStations(calculated);
          setNearestStation(calculated[0]);
          setDetectingGps(false);
          setErrorMsg('Location permission restricted. Displaying distance relative to New Delhi Junction.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setErrorMsg('Geolocation API is not supported by your browser.');
      setDetectingGps(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Navigation className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Pan-India Real-Time GPS Station Finder</h2>
              <p className="text-xs text-blue-200">Detect nearest railway station across all 18 Indian Railways zones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* GPS Pin Activation Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-700" /> GPS Geolocation Radar
                </h3>
                <p className="text-xs text-slate-600">
                  {currentGps
                    ? `Pinned Coordinates: ${currentGps.lat.toFixed(4)}°N, ${currentGps.lon.toFixed(4)}°E (Accuracy: ~${currentGps.acc}m)`
                    : 'Click below to detect your live location anywhere across India.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2"
              >
                {detectingGps ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Detecting GPS...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-cyan-300" /> Pin My Live Location
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" /> {errorMsg}
              </div>
            )}
          </div>

          {/* Nearest Station Highlight */}
          {nearestStation && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold bg-cyan-400/20 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-400/30">
                  NEAREST DETECTED STATION
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {nearestStation.distanceKm} km away
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xl font-black text-white">{nearestStation.name} ({nearestStation.code})</h4>
                  <span className="text-xs text-blue-200">{nearestStation.zone} • {nearestStation.state}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectStation(nearestStation.code);
                    onClose();
                  }}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  Select Station <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Pan-India Station List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              All Major Pan-India Junctions ({sortedStations.length} Stations)
            </h3>

            <div className="space-y-2">
              {sortedStations.map((st) => (
                <div
                  key={st.code}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/50 flex items-center justify-between gap-4 text-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 font-mono font-bold flex items-center justify-center text-xs">
                      {st.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {st.zone} • {st.platforms} Platforms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {st.distanceKm !== undefined && (
                      <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg">
                        {st.distanceKm} km
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectStation(st.code);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition-all"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pan-India GPS Coordinates Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
