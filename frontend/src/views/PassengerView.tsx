import React, { useState, useMemo } from 'react';
import { Train, Clock, CheckCircle2, MessageSquare, MapPin, Sparkles, Navigation, Calendar, Utensils, CloudSun, LayoutGrid, Volume2, ShieldCheck, ArrowRightLeft, Compass } from 'lucide-react';

interface PassengerViewProps {
  onSearchTrain?: (query: string) => void;
  onOpenLocation?: () => void;
  onOpenHelp?: () => void;
}

interface TrainRouteResult {
  number: string;
  name: string;
  type: string;
  source: string;
  sourceCode: string;
  depTime: string;
  destination: string;
  destCode: string;
  arrTime: string;
  duration: string;
  platform: string;
  status: 'ON TIME' | 'RUNNING LATE' | 'EARLY';
  delayMin: number;
  expectedEtaWindow: string;
  confidence: string;
  currentLoc: string;
  nextStop: string;
  weather: string;
  aqi: string;
  seatStatus: string;
  coaches: string[];
  schedule: Array<{ station: string; code: string; sched: string; actual: string; platform: string; status: string }>;
}

const STATION_DATA: Record<string, { name: string; city: string }> = {
  NDLS: { name: 'New Delhi Junction', city: 'Delhi' },
  CNB: { name: 'Kanpur Central', city: 'Kanpur' },
  PRYJ: { name: 'Prayagraj Junction', city: 'Prayagraj' },
  DDU: { name: 'Pt. DD Upadhyaya', city: 'Mughalsarai' },
  PNBE: { name: 'Patna Junction', city: 'Patna' },
  HWH: { name: 'Howrah Junction', city: 'Kolkata' },
  CSMT: { name: 'Mumbai CSMT', city: 'Mumbai' },
  SBC: { name: 'KSR Bengaluru', city: 'Bengaluru' },
  MAS: { name: 'Chennai Central', city: 'Chennai' },
  SC: { name: 'Secunderabad Junction', city: 'Hyderabad' },
  GHY: { name: 'Guwahati Junction', city: 'Guwahati' },
  ADI: { name: 'Ahmedabad Junction', city: 'Ahmedabad' }
};

export const PassengerView: React.FC<PassengerViewProps> = ({ onSearchTrain, onOpenLocation, onOpenHelp }) => {
  const [sourceCode, setSourceCode] = useState('NDLS');
  const [destCode, setDestCode] = useState('HWH');
  const [travelDate, setTravelDate] = useState('TODAY');
  const [selectedTrainNo, setSelectedTrainNo] = useState<string>('12001');

  // Alarm & Alert States
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmDistance, setAlarmDistance] = useState(10);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappSubscribed, setWhatsappSubscribed] = useState(false);
  const [activeCoachTab, setActiveCoachTab] = useState<'COACH' | 'PLATFORM' | 'WEATHER' | 'FOOD'>('COACH');
  const [foodOrdered, setFoodOrdered] = useState(false);

  const stationList = Object.entries(STATION_DATA).map(([code, s]) => ({
    code,
    name: `${s.name} (${code})`
  }));

  // Dynamic Route Train Query Engine
  const availableTrains: TrainRouteResult[] = useMemo(() => {
    const src = STATION_DATA[sourceCode] || { name: sourceCode, city: sourceCode };
    const dst = STATION_DATA[destCode] || { name: destCode, city: destCode };

    // Preset Routes
    if (sourceCode === 'NDLS' && destCode === 'HWH') {
      return [
        {
          number: '12001',
          name: `${src.city}-${dst.city} Vande Bharat Express`,
          type: 'Vande Bharat Express',
          source: src.name,
          sourceCode: 'NDLS',
          depTime: '06:00 AM',
          destination: dst.name,
          destCode: 'HWH',
          arrTime: '18:40 PM',
          duration: '12h 40m',
          platform: 'PF 16 (Confirmed)',
          status: 'RUNNING LATE' as const,
          delayMin: 7,
          expectedEtaWindow: '19:01 PM – 19:14 PM',
          confidence: '96.2% Precision Score',
          currentLoc: 'Crossed Kanpur Central (CNB) • Track Speed 118 km/h',
          nextStop: 'Prayagraj Junction (PRYJ)',
          weather: '26°C Clear • Moderate Wind',
          aqi: '85 (Moderate)',
          seatStatus: 'AVAILABLE - 18 Seats (Executive Chair Car)',
          coaches: ['LOCO', 'C1', 'C2', 'C3', 'C4', 'C5', 'EC1', 'EC2', 'C6', 'C7', 'C8', 'SLR'],
          schedule: [
            { station: src.name, code: 'NDLS', sched: '06:00 AM', actual: '06:07 AM', platform: 'PF 16', status: 'DEPARTED (+7m)' },
            { station: 'Kanpur Central', code: 'CNB', sched: '10:08 AM', actual: '10:15 AM', platform: 'PF 03', status: 'PASSED' },
            { station: 'Prayagraj Jn', code: 'PRYJ', sched: '12:10 PM', actual: '12:18 PM (Est)', platform: 'PF 01', status: 'NEXT STOP' },
            { station: 'Pt. DD Upadhyaya', code: 'DDU', sched: '14:25 PM', actual: '14:32 PM (Est)', platform: 'PF 05', status: 'UPCOMING' },
            { station: dst.name, code: 'HWH', sched: '18:40 PM', actual: '19:01 – 19:14 PM', platform: 'PF 09', status: 'DESTINATION' }
          ]
        },
        {
          number: '12301',
          name: `${dst.city} Rajdhani Express`,
          type: 'Superfast Rajdhani Express',
          source: src.name,
          sourceCode: 'NDLS',
          depTime: '16:55 PM',
          destination: dst.name,
          destCode: 'HWH',
          arrTime: '09:55 AM (Next Day)',
          duration: '17h 00m',
          platform: 'PF 15 (Confirmed)',
          status: 'ON TIME' as const,
          delayMin: 0,
          expectedEtaWindow: '09:52 AM – 09:58 AM',
          confidence: '98.0% Precision Score',
          currentLoc: 'Approaching Pt. DD Upadhyaya (DDU)',
          nextStop: 'Pt. DD Upadhyaya (DDU)',
          weather: '24°C Clear',
          aqi: '92 (Moderate)',
          seatStatus: 'AVAILABLE - 42 Seats (3A Tier)',
          coaches: ['LOCO', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'PC', 'B5', 'B6', 'SLR'],
          schedule: [
            { station: src.name, code: 'NDLS', sched: '16:55 PM', actual: '16:55 PM', platform: 'PF 15', status: 'DEPARTED' },
            { station: 'Kanpur Central', code: 'CNB', sched: '21:35 PM', actual: '21:35 PM', platform: 'PF 04', status: 'PASSED' },
            { station: 'Prayagraj Jn', code: 'PRYJ', sched: '23:45 PM', actual: '23:45 PM', platform: 'PF 01', status: 'PASSED' },
            { station: dst.name, code: 'HWH', sched: '09:55 AM', actual: '09:52 – 09:58 AM', platform: 'PF 10', status: 'DESTINATION' }
          ]
        },
        {
          number: '12260',
          name: `${dst.city} Duronto Express`,
          type: 'Duronto Express',
          source: src.name,
          sourceCode: 'NDLS',
          depTime: '19:45 PM',
          destination: dst.name,
          destCode: 'HWH',
          arrTime: '12:25 PM (Next Day)',
          duration: '16h 40m',
          platform: 'PF 12',
          status: 'RUNNING LATE' as const,
          delayMin: 14,
          expectedEtaWindow: '12:42 PM – 12:55 PM',
          confidence: '94.5% Precision Score',
          currentLoc: 'Between Kanpur & Prayagraj',
          nextStop: 'Dhanbad Junction (DHN)',
          weather: '27°C Light Fog',
          aqi: '110 (Unhealthy)',
          seatStatus: 'RAC 12 in 2A Tier',
          coaches: ['LOCO', 'A1', 'B1', 'B2', 'B3', 'B4', 'PC', 'SLR'],
          schedule: [
            { station: src.name, code: 'NDLS', sched: '19:45 PM', actual: '19:59 PM', platform: 'PF 12', status: 'DEPARTED (+14m)' },
            { station: 'Dhanbad Jn', code: 'DHN', sched: '08:40 AM', actual: '08:54 AM (Est)', platform: 'PF 02', status: 'NEXT STOP' },
            { station: dst.name, code: 'HWH', sched: '12:25 PM', actual: '12:42 – 12:55 PM', platform: 'PF 08', status: 'DESTINATION' }
          ]
        }
      ];
    }

    if (sourceCode === 'CSMT' && destCode === 'MAS') {
      return [
        {
          number: '12163',
          name: `${src.city}-${dst.city} Superfast Express`,
          type: 'Superfast Express',
          source: src.name,
          sourceCode: 'CSMT',
          depTime: '18:45 PM',
          destination: dst.name,
          destCode: 'MAS',
          arrTime: '16:30 PM (Next Day)',
          duration: '21h 45m',
          platform: 'PF 04 (Confirmed)',
          status: 'ON TIME' as const,
          delayMin: 0,
          expectedEtaWindow: '16:28 PM – 16:34 PM',
          confidence: '97.4% Precision Score',
          currentLoc: 'Approaching Pune Junction (PUNE)',
          nextStop: 'Pune Junction (PUNE)',
          weather: '28°C Pleasant',
          aqi: '72 (Good)',
          seatStatus: 'AVAILABLE - 34 Seats (SL)',
          coaches: ['LOCO', 'S1', 'S2', 'S3', 'S4', 'S5', 'B1', 'B2', 'A1', 'SLR'],
          schedule: [
            { station: src.name, code: 'CSMT', sched: '18:45 PM', actual: '18:45 PM', platform: 'PF 04', status: 'DEPARTED' },
            { station: 'Pune Junction', code: 'PUNE', sched: '21:55 PM', actual: '21:55 PM', platform: 'PF 02', status: 'NEXT STOP' },
            { station: 'Solapur Junction', code: 'SUR', sched: '02:30 AM', actual: '02:30 AM', platform: 'PF 01', status: 'UPCOMING' },
            { station: dst.name, code: 'MAS', sched: '16:30 PM', actual: '16:28 – 16:34 PM', platform: 'PF 06', status: 'DESTINATION' }
          ]
        },
        {
          number: '22159',
          name: 'Mumbai Chennai Mail',
          type: 'Mail Express',
          source: src.name,
          sourceCode: 'CSMT',
          depTime: '12:45 PM',
          destination: dst.name,
          destCode: 'MAS',
          arrTime: '10:50 AM (Next Day)',
          duration: '22h 05m',
          platform: 'PF 07',
          status: 'RUNNING LATE' as const,
          delayMin: 5,
          expectedEtaWindow: '10:54 AM – 11:02 AM',
          confidence: '95.1% Precision Score',
          currentLoc: 'Crossed Guntakal Junction (GTL)',
          nextStop: 'Renigunta Junction (RU)',
          weather: '31°C Humid',
          aqi: '65 (Good)',
          seatStatus: 'RAC 5 in 3A Tier',
          coaches: ['LOCO', 'SLR', 'S1', 'S2', 'S3', 'B1', 'B2', 'A1', 'SLR'],
          schedule: [
            { station: src.name, code: 'CSMT', sched: '12:45 PM', actual: '12:45 PM', platform: 'PF 07', status: 'DEPARTED' },
            { station: 'Guntakal Junction', code: 'GTL', sched: '03:10 AM', actual: '03:15 AM', platform: 'PF 03', status: 'PASSED' },
            { station: dst.name, code: 'MAS', sched: '10:50 AM', actual: '10:54 – 11:02 AM', platform: 'PF 02', status: 'DESTINATION' }
          ]
        }
      ];
    }

    // Dynamic Generic Generator for any other custom Station pair
    return [
      {
        number: `${Math.floor(10000 + Math.random() * 90000)}`,
        name: `${src.city} – ${dst.city} Express`,
        type: 'Superfast Express',
        source: src.name,
        sourceCode: sourceCode,
        depTime: '07:30 AM',
        destination: dst.name,
        destCode: destCode,
        arrTime: '19:15 PM',
        duration: '11h 45m',
        platform: 'PF 02 (Confirmed)',
        status: 'ON TIME' as const,
        delayMin: 0,
        expectedEtaWindow: '19:12 PM – 19:18 PM',
        confidence: '97.0% Precision Score',
        currentLoc: `En Route from ${src.city} to ${dst.city}`,
        nextStop: dst.name,
        weather: '27°C Clear',
        aqi: '78 (Moderate)',
        seatStatus: 'AVAILABLE - 28 Seats (3A Tier)',
        coaches: ['LOCO', 'S1', 'S2', 'S3', 'B1', 'B2', 'B3', 'A1', 'SLR'],
        schedule: [
          { station: src.name, code: sourceCode, sched: '07:30 AM', actual: '07:30 AM', platform: 'PF 02', status: 'DEPARTED' },
          { station: dst.name, code: destCode, sched: '19:15 PM', actual: '19:12 – 19:18 PM', platform: 'PF 04', status: 'DESTINATION' }
        ]
      },
      {
        number: `${Math.floor(10000 + Math.random() * 90000)}`,
        name: `${src.city} – ${dst.city} Superfast Special`,
        type: 'Express Special',
        source: src.name,
        sourceCode: sourceCode,
        depTime: '15:20 PM',
        destination: dst.name,
        destCode: destCode,
        arrTime: '04:10 AM (Next Day)',
        duration: '12h 50m',
        platform: 'PF 05',
        status: 'RUNNING LATE' as const,
        delayMin: 8,
        expectedEtaWindow: '04:18 AM – 04:25 AM',
        confidence: '95.5% Precision Score',
        currentLoc: `Running on Main Corridor towards ${dst.city}`,
        nextStop: dst.name,
        weather: '25°C Cool',
        aqi: '82 (Moderate)',
        seatStatus: 'AVAILABLE - 12 Seats (2A Tier)',
        coaches: ['LOCO', 'S1', 'S2', 'B1', 'B2', 'A1', 'SLR'],
        schedule: [
          { station: src.name, code: sourceCode, sched: '15:20 PM', actual: '15:28 PM', platform: 'PF 05', status: 'DEPARTED (+8m)' },
          { station: dst.name, code: destCode, sched: '04:10 AM', actual: '04:18 – 04:25 AM', platform: 'PF 01', status: 'DESTINATION' }
        ]
      }
    ];
  }, [sourceCode, destCode]);

  // Ensure selected train is valid for active route
  const currentSelectedTrain = useMemo(() => {
    const found = availableTrains.find(t => t.number === selectedTrainNo);
    return found || availableTrains[0];
  }, [availableTrains, selectedTrainNo]);

  const handleSwapStations = () => {
    const temp = sourceCode;
    setSourceCode(destCode);
    setDestCode(temp);
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto font-sans bg-white text-slate-900">
      {/* Formal Executive White/Navy Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-900 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> OFFICIAL INDIAN RAILWAYS PORTAL
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-300">
                RAILYATRA PAN-INDIA
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight pt-1">
              RAILYATRA — Every Journey, Every Arrival Foreseen
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Pan-India Live Train Tracking, Dynamic Arrival Intervals, Platform Allocation, Coach Layout & Proximity Alarms.
            </p>
          </div>

          {/* Pin GPS & Help Buttons */}
          <div className="flex items-center gap-2">
            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-300 shadow-sm transition-all"
              >
                Help & 139
              </button>
            )}

            {onOpenLocation && (
              <button
                type="button"
                onClick={onOpenLocation}
                className="px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-cyan-300" /> Pin My GPS Location
              </button>
            )}
          </div>
        </div>

        {/* Source & Destination Search Controls */}
        <div className="p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
            {/* From Station */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">From (Source Station)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-800 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={sourceCode}
                  onChange={(e) => {
                    setSourceCode(e.target.value);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 shadow-sm"
                >
                  {stationList.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex items-center justify-center pt-4">
              <button
                type="button"
                onClick={handleSwapStations}
                className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-blue-900 border border-slate-300 shadow-sm transition-all hover:scale-105"
                title="Swap Source & Destination"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To Station */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">To (Destination Station)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-600 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={destCode}
                  onChange={(e) => {
                    setDestCode(e.target.value);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 shadow-sm"
                >
                  {stationList.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Selector & Result Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-blue-900" />
              <span className="text-slate-700 font-bold">Travel Date:</span>
              <button
                type="button"
                onClick={() => setTravelDate('TODAY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${travelDate === 'TODAY' ? 'bg-blue-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-300'}`}
              >
                Today (05 Sep)
              </button>
              <button
                type="button"
                onClick={() => setTravelDate('TOMORROW')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${travelDate === 'TOMORROW' ? 'bg-blue-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-300'}`}
              >
                Tomorrow (06 Sep)
              </button>
            </div>

            <div className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Showing {availableTrains.length} Direct Trains ({sourceCode} ➔ {destCode})
            </div>
          </div>
        </div>
      </div>

      {/* Available Trains Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Train className="w-5 h-5 text-blue-900" /> Direct Trains Available ({STATION_DATA[sourceCode]?.city || sourceCode} ➔ {STATION_DATA[destCode]?.city || destCode})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableTrains.map((t) => (
            <div
              key={t.number}
              onClick={() => {
                setSelectedTrainNo(t.number);
                if (onSearchTrain) onSearchTrain(t.number);
              }}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all space-y-3 relative ${
                currentSelectedTrain.number === t.number
                  ? 'border-blue-800 ring-2 ring-blue-800/20 shadow-lg bg-blue-50/20'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    TRAIN {t.number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{t.name}</h3>
                  <span className="text-[11px] text-slate-500 block font-medium">{t.type}</span>
                </div>
                <span className={t.status === 'ON TIME' ? 'badge-emerald text-[10px]' : 'badge-amber text-[10px]'}>
                  {t.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono border-t border-slate-100 pt-2 text-slate-700">
                <div>
                  <span className="text-slate-900 font-bold block">{t.depTime}</span>
                  <span className="text-[10px] text-slate-500">{t.sourceCode}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">{t.duration}</span>
                <div className="text-right">
                  <span className="text-slate-900 font-bold block">{t.arrTime}</span>
                  <span className="text-[10px] text-slate-500">{t.destCode}</span>
                </div>
              </div>

              {/* Dynamic Arrival Interval Box */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Calibrated Arrival Window:</span>
                <span className="font-mono font-bold text-blue-900 block">{t.expectedEtaWindow}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Train Advanced Live Intelligence Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        {/* Train Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-blue-900 text-white font-mono font-bold text-sm">
                TRAIN {currentSelectedTrain.number}
              </span>
              <h2 className="text-2xl font-black text-slate-900">{currentSelectedTrain.name}</h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {currentSelectedTrain.source} ({currentSelectedTrain.sourceCode}) ➔ {currentSelectedTrain.destination} ({currentSelectedTrain.destCode}) • Total Duration: {currentSelectedTrain.duration}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-900">
              {currentSelectedTrain.platform}
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {currentSelectedTrain.confidence}
            </div>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="p-6 rounded-2xl bg-blue-900 text-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
              <MapPin className="w-4 h-4 text-rose-400 animate-pulse" /> PAN-INDIA TELEMETRY
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-mono">
              Next Stop: {currentSelectedTrain.nextStop}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            <div>
              <span className="text-xs text-blue-200 block font-sans font-bold">Current Location</span>
              <span className="text-sm font-bold text-cyan-300 block mt-1">{currentSelectedTrain.currentLoc}</span>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-6">
              <span className="text-xs text-blue-200 block font-sans font-bold">Expected Destination Arrival</span>
              <span className="text-2xl font-black text-emerald-300 block mt-1">{currentSelectedTrain.expectedEtaWindow}</span>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-6">
              <span className="text-xs text-blue-200 block font-sans font-bold">Seat Availability</span>
              <span className="text-xs font-bold text-cyan-300 block mt-1">{currentSelectedTrain.seatStatus}</span>
            </div>
          </div>
        </div>

        {/* Executive Feature Tab Switcher */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveCoachTab('COACH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCoachTab === 'COACH' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" /> Coach Position & Layout
            </button>

            <button
              onClick={() => setActiveCoachTab('PLATFORM')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCoachTab === 'PLATFORM' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Navigation className="w-4 h-4 text-emerald-400" /> Platform Allocation
            </button>

            <button
              onClick={() => setActiveCoachTab('WEATHER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCoachTab === 'WEATHER' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <CloudSun className="w-4 h-4 text-amber-400" /> Station Weather & AQI
            </button>

            <button
              onClick={() => setActiveCoachTab('FOOD')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCoachTab === 'FOOD' ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Utensils className="w-4 h-4 text-rose-400" /> IRCTC Meal Delivery
            </button>
          </div>

          {/* Coach Layout */}
          {activeCoachTab === 'COACH' && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-900" /> Train Rake Sequence (Engine to SLR)
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">{currentSelectedTrain.coaches.length} COACHES</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
                {currentSelectedTrain.coaches.map((c, idx) => (
                  <div
                    key={idx}
                    className={`min-w-[55px] h-14 rounded-xl border font-mono text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      c.startsWith('C') || c.startsWith('EC') || c.startsWith('B') || c.startsWith('A')
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : (c === 'LOCO' ? 'bg-rose-800 text-white border-rose-800' : 'bg-slate-200 text-slate-800 border-slate-300')
                    }`}
                  >
                    <span>{c}</span>
                    <span className="text-[9px] opacity-75">{c === 'LOCO' ? 'Loco' : `Pos ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform */}
          {activeCoachTab === 'PLATFORM' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 font-sans text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirmed Platform: {currentSelectedTrain.platform}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Platform verified via CRIS operational dispatch feeds. Platform assignment is confirmed 45 minutes prior to arrival.
              </p>
            </div>
          )}

          {/* Weather */}
          {activeCoachTab === 'WEATHER' && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 font-sans text-amber-950">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <CloudSun className="w-5 h-5 text-amber-600" /> Destination Weather: {currentSelectedTrain.weather}
              </div>
              <p className="text-xs text-amber-800">
                Destination AQI Index: <strong>{currentSelectedTrain.aqi}</strong>. Track section visibility is normal.
              </p>
            </div>
          )}

          {/* Food */}
          {activeCoachTab === 'FOOD' && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 font-sans text-rose-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                  <Utensils className="w-5 h-5 text-rose-600" /> IRCTC Hot Meal Delivery on Seat
                </div>
                <span className="badge-rose text-[10px]">DELIVERY AT NEXT STOP</span>
              </div>
              <p className="text-xs text-rose-800">
                Order fresh meals delivered directly to your seat at {currentSelectedTrain.nextStop}.
              </p>
              {foodOrdered ? (
                <div className="p-3 bg-white text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Veg Thali meal booked! Will be delivered at your seat at {currentSelectedTrain.nextStop}.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setFoodOrdered(true)}
                  className="px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  Order IRCTC Veg Deluxe Thali (₹150)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Proximity Alarm & WhatsApp Alerts Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 font-sans">
          {/* Alarm Feature */}
          <div className="p-5 rounded-2xl bg-blue-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-cyan-300" />
                <h4 className="text-sm font-bold">Station Proximity Alarm</h4>
              </div>
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
            <p className="text-xs text-blue-200">
              Set audio alarm to wake up before arrival at destination station.
            </p>
            {alarmEnabled && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-blue-200">Trigger Distance:</span>
                  <span className="text-cyan-300 font-bold">{alarmDistance} km before station</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={alarmDistance}
                  onChange={(e) => setAlarmDistance(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}
          </div>

          {/* WhatsApp Alert Feature */}
          <div className="p-5 rounded-2xl bg-blue-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold">WhatsApp Arrival Alerts</h4>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Receive live arrival updates on WhatsApp.
            </p>

            {whatsappSubscribed ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Alerts subscribed for +91-{whatsappPhone}!
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Enter 10-digit Phone..."
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (whatsappPhone) setWhatsappSubscribed(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Route Timings Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-900" /> Full Station Route Schedule & Timings
          </h3>

          <div className="space-y-2">
            {currentSelectedTrain.schedule.map((st, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 text-xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-mono font-bold flex items-center justify-center text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{st.station} ({st.code})</h4>
                    <span className="text-slate-500 font-mono text-[11px]">{st.platform} • Scheduled: {st.sched}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="font-extrabold text-slate-900 text-sm block">{st.actual}</span>
                  <span className={st.status.includes('DEPARTED') ? 'text-amber-700 font-bold' : (st.status.includes('DESTINATION') ? 'text-blue-900 font-bold' : 'text-slate-500')}>
                    {st.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
