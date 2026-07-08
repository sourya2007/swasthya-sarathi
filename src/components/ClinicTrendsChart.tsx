import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ResourceData } from '../hooks/useResourceMonitoring';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';

interface ClinicTrendsChartProps {
  phc: ResourceData;
}

// Simple deterministic random based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export function ClinicTrendsChart({ phc }: ClinicTrendsChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    let currentBeds = phc.beds;
    let seed = phc.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    // Generate 24 hours of mock data backwards
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      seed++;
      
      // Random walk for mock data, tending towards current value at the end
      if (i !== 0) {
        currentBeds = Math.max(0, Math.min(phc.totalBeds, currentBeds + (seededRandom(seed) > 0.5 ? 1 : -1) * Math.floor(seededRandom(seed + 1) * 3)));
      } else {
        currentBeds = phc.beds;
      }

      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        beds: currentBeds,
        medicines: phc.inventory.reduce((acc, med) => acc + (med.stock / med.maxStock) * 100, 0) / phc.inventory.length + (seededRandom(seed + 2) * 10 - 5), // Mock medicine availability index
      });
    }
    return data;
  }, [phc]);

  const predictions = useMemo(() => {
    let seed = phc.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + 100;
    const items = [];
    
    for (const med of phc.inventory) {
      seed++;
      // Determine a mock hourly consumption rate for each medicine
      const hourlyConsumption = med.maxStock * (0.01 + seededRandom(seed) * 0.04); 
      const hoursUntilDepletion = med.stock / hourlyConsumption;
      
      if (hoursUntilDepletion <= 48) {
        items.push({
          name: med.name,
          currentStock: med.stock,
          hoursUntilDepletion: Math.floor(hoursUntilDepletion),
          consumptionRate: Math.ceil(hourlyConsumption * 24), // per day
        });
      }
    }
    
    // Sort by most imminent depletion
    return items.sort((a, b) => a.hoursUntilDepletion - b.hoursUntilDepletion);
  }, [phc]);

  return (
    <div className="flex flex-col gap-6 h-full p-4 overflow-y-auto bg-slate-50">
      
      {/* 48-Hour Forecasting Module */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">48-Hour Shortage Forecast</h4>
        </div>
        
        {predictions.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm font-semibold">Stable Inventory Projection</p>
            <p className="text-xs mt-1 text-center">No critical shortages predicted in the next 48 hours based on current consumption rates.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {predictions.map((pred, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div>
                  <p className="text-sm font-bold text-slate-800">{pred.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Est. {pred.consumptionRate} units consumed per day</p>
                </div>
                <div className={`flex flex-col items-end ${pred.hoursUntilDepletion < 12 ? 'text-red-600' : 'text-amber-600'}`}>
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{pred.hoursUntilDepletion}h remaining</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                    {pred.currentStock} units left
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">24-Hour Bed Availability Trend</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBeds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="beds" name="Available Beds" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBeds)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Overall Medicine Stock Index (%)</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Stock Index']}
              />
              <Line type="monotone" dataKey="medicines" name="Stock Index" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
