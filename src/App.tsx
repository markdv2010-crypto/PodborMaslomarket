import { useState } from 'react';
import { Search, Car, Thermometer, Gauge, Activity, ShieldCheck, AlertTriangle, ChevronRight, Droplet, Settings } from 'lucide-react';
import { decodeVin, VehicleInfo } from './services/vin';
import { getAiRecommendation, UserPreferences, RecommendationResult } from './services/ai';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'vin' | 'preferences' | 'loading' | 'results';

export default function App() {
  const [step, setStep] = useState<Step>('vin');
  const [vin, setVin] = useState(''); 
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    mileage: 85000,
    climate: 'Умеренный (от -20 до +30)',
    drivingStyle: 'Городской (пробки, частые остановки)'
  });
  const [results, setResults] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('loading');
    try {
      const vInfo = await decodeVin(vin);
      setVehicle(vInfo);
      setStep('preferences');
    } catch (err: any) {
      setError(err.message || 'Ошибка расшифровки VIN');
      setStep('vin');
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    
    setError(null);
    setStep('loading');
    try {
      // AI Analysis searching via Google Search Tool
      const recommendation = await getAiRecommendation(vehicle, preferences);
      setResults(recommendation);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Ошибка при подборе масла');
      setStep('preferences');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Droplet className="w-6 h-6 fill-current" />
            <span className="font-bold text-xl tracking-tight text-slate-900">MasloMARKET <span className="text-blue-600">Podbor AI</span></span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Как это работает</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Каталог масел</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Для СТО</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: VIN INPUT */}
          {step === 'vin' && (
            <motion.div 
              key="vin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Умный подбор масел и жидкостей
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                  Введите VIN-код вашего автомобиля. Наш ИИ определит ваш автомобиль и подберет идеальные масла для двигателя, коробки передач и мостов под ваши условия.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleVinSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-slate-700 mb-2">
                      VIN-код автомобиля (17 символов)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="vin"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Введите 17 символов VIN..."
                        maxLength={17}
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Расшифровать VIN
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </form>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Поиск осуществляется по базе MasloMARKET</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 'preferences' && vehicle && (
            <motion.div 
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-3xl mx-auto"
            >
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Двигатель: {vehicle.engine}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Условия эксплуатации</h3>
                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      Текущий пробег (км)
                    </label>
                    <input
                      type="number"
                      value={preferences.mileage}
                      onChange={(e) => setPreferences({...preferences, mileage: parseInt(e.target.value) || 0})}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Thermometer className="w-4 h-4 text-slate-400" />
                      Климатическая зона
                    </label>
                    <select
                      value={preferences.climate}
                      onChange={(e) => setPreferences({...preferences, climate: e.target.value})}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Холодный (часто ниже -25)</option>
                      <option>Умеренный (от -20 до +30)</option>
                      <option>Жаркий (часто выше +30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      Стиль вождения
                    </label>
                    <select
                      value={preferences.drivingStyle}
                      onChange={(e) => setPreferences({...preferences, drivingStyle: e.target.value})}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Спокойный (трасса/город без пробок)</option>
                      <option>Городской (пробки, частые остановки)</option>
                      <option>Агрессивный (высокие обороты, трек)</option>
                      <option>Тяжелые условия (бездорожье, прицеп)</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep('vin')}
                      className="px-6 py-4 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Назад
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Подобрать масла
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Droplet className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900">Анализ данных...</h3>
                <p className="text-slate-500 mt-2">Анализируем спецификации и подбираем масла...</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 'results' && results && vehicle && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Рекомендации MasloMARKET</h2>
                <button 
                  onClick={() => setStep('vin')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Новый поиск
                </button>
              </div>

              <div className="space-y-10">
                {results.nodes.map((node, nodeIndex) => (
                  <div key={nodeIndex} className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200 pb-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold">{node.nodeName}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {node.recommendedOils.map((rec, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                          {index === 0 && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                              Лучший выбор
                            </div>
                          )}
                          
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-slate-900">{rec.brand} {rec.name}</h4>
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                                  {rec.viscosity}
                                </span>
                              </div>
                              
                              <p className="text-slate-600 text-sm leading-relaxed">
                                {rec.reasoning}
                              </p>
                            </div>

                            <div className="md:w-32 flex flex-col items-center justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 pl-0 md:pl-6">
                              <div className="text-3xl font-bold text-emerald-600">{rec.matchScore}%</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Совпадение</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold text-lg">Совет эксперта</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {results.generalAdvice}
                </p>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
