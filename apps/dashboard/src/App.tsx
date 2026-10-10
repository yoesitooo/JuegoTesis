import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  TrendingUp, 
  Settings, 
  Bell, 
  Search,
  Activity,
  Award,
  Clock,
  LogOut
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800/80 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">EduRunner</h1>
            <p className="text-xs text-indigo-400 font-medium">Panel Docente</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Vista General' },
            { id: 'students', icon: Users, label: 'Mis Estudiantes' },
            { id: 'analytics', icon: TrendingUp, label: 'Rendimiento' },
            { id: 'settings', icon: Settings, label: 'Configuración' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold' 
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-slate-400">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-800/80 bg-slate-900/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar estudiante o grupo..." 
              className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-full text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-64 lg:w-96 placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-full hover:bg-slate-800/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30" />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white">Prof. Martínez</p>
                <p className="text-xs text-slate-500">Escuela N° 45</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Greeting */}
            <div>
              <h2 className="text-3xl font-bold text-white">Hola de nuevo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Carlos</span> 👋</h2>
              <p className="text-slate-400 mt-2">Aquí tienes el resumen del rendimiento de tus alumnos hoy.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Partidas Jugadas Hoy', value: '342', icon: Gamepad2, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                { label: 'Precisión Promedio', value: '78%', icon: Award, color: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                { label: 'Tiempo de Práctica', value: '45 hrs', icon: Clock, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              ].map((stat, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 backdrop-blur-sm group hover:border-slate-600/50 transition-colors`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`}></div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                      <h3 className="text-4xl font-bold text-white mt-2">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                      <stat.icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} style={{ color: 'inherit' }} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">+12%</span>
                    <span className="text-slate-500">vs la semana pasada</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Charts Area (Mockup) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Evolución de Aciertos</h3>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Ver Reporte Detallado</button>
                </div>
                <div className="h-64 w-full flex items-end gap-2 justify-between px-2">
                  {/* Mock Bar Chart */}
                  {[40, 60, 45, 80, 65, 90, 75].map((height, i) => (
                    <div key={i} className="w-full relative group flex justify-center">
                      <div 
                        className="w-full max-w-[3rem] bg-gradient-to-t from-indigo-600/40 to-indigo-400/80 rounded-t-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-300"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="absolute -bottom-6 text-xs text-slate-500 font-medium">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-6">Actividad Reciente</h3>
                <div className="space-y-6">
                  {[
                    { name: 'Ana Gómez', action: 'Completó Nivel 3 (Sumas)', time: 'Hace 5 min', color: 'bg-emerald-500' },
                    { name: 'Luis Pérez', action: 'Falló en Multiplicación', time: 'Hace 12 min', color: 'bg-rose-500' },
                    { name: 'Sofía Ríos', action: 'Desbloqueó Avatar "Caballo"', time: 'Hace 1 hora', color: 'bg-purple-500' },
                    { name: 'Carlos M.', action: 'Completó Nivel 1 (Restas)', time: 'Hace 2 horas', color: 'bg-emerald-500' },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${event.color} ring-4 ring-slate-900`}></div>
                        {i !== 3 && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-slate-700/50"></div>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{event.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{event.action}</p>
                        <p className="text-xs text-slate-500 mt-1">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
