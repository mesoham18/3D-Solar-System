import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { PlanetData } from '../utils/planetData';

interface ControlPanelProps {
  planets: PlanetData[];
  speeds: Record<string, number>;
  onSpeedChange: (planetName: string, speed: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetSpeeds: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  planets,
  speeds,
  onSpeedChange,
  isPlaying,
  onTogglePlay,
  onResetSpeeds
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 text-white rounded-2xl p-6 w-96 shadow-2xl max-h-[85vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Mission Control
          </span>
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Enhanced Main Controls */}
          <div className="flex gap-3 mb-6 flex-shrink-0">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 flex-1 font-medium shadow-lg hover:scale-105 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause Simulation' : 'Start Simulation'}
            </button>
            <button
              onClick={onResetSpeeds}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-300 font-medium shadow-lg hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>

          {/* Enhanced Planet Speed Controls with Scrollable Container */}
          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 flex-shrink-0">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              Orbital Velocities
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {planets.map((planet) => (
                <div key={planet.name} className="space-y-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg flex-shrink-0"
                        style={{ 
                          background: `#${planet.color.toString(16).padStart(6, '0')}`,
                          boxShadow: `0 0 15px #${planet.color.toString(16).padStart(6, '0')}60`
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-lg">{planet.name}</span>
                        <div className="text-xs text-gray-400 truncate">{planet.description}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {(speeds[planet.name] || planet.speed).toFixed(2)}×
                      </span>
                      <div className="text-xs text-gray-400">{planet.moons} moons</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={speeds[planet.name] || planet.speed}
                      onChange={(e) => onSpeedChange(planet.name, parseFloat(e.target.value))}
                      className="flex-1 h-3 bg-gray-700/50 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, 
                          #${planet.color.toString(16).padStart(6, '0')} 0%, 
                          #${planet.color.toString(16).padStart(6, '0')} ${((speeds[planet.name] || planet.speed) / 3) * 100}%, 
                          rgba(55, 65, 81, 0.5) ${((speeds[planet.name] || planet.speed) / 3) * 100}%, 
                          rgba(55, 65, 81, 0.5) 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="3"
                      step="0.1"
                      value={(speeds[planet.name] || planet.speed).toFixed(1)}
                      onChange={(e) => onSpeedChange(planet.name, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200 flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ControlPanel;