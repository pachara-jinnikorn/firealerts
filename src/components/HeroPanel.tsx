import { TrendingUp, Users, Target, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', value: 4000, users: 2400 },
  { name: 'Feb', value: 3000, users: 1398 },
  { name: 'Mar', value: 5000, users: 9800 },
  { name: 'Apr', value: 2780, users: 3908 },
  { name: 'May', value: 6890, users: 4800 },
  { name: 'Jun', value: 7390, users: 3800 },
];

const achievements = [
  { icon: TrendingUp, label: 'Revenue', value: '$45,231', change: '+20.1%', positive: true },
  { icon: Users, label: 'Active Users', value: '8,282', change: '+12.5%', positive: true },
  { icon: Target, label: 'Completion Rate', value: '89.3%', change: '+4.2%', positive: true },
  { icon: Award, label: 'Projects', value: '142', change: '-2.3%', positive: false },
];

export function HeroPanel() {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Welcome back, Alex!</h1>
        <p className="text-gray-600">Here's what's happening with your projects today.</p>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`text-sm ${achievement.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {achievement.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{achievement.label}</p>
              <p className="text-gray-900">{achievement.value}</p>
            </div>
          );
        })}
      </div>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-4">
            <h3 className="text-gray-900 mb-1">Revenue Overview</h3>
            <p className="text-gray-600 text-sm">Monthly revenue trends</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-4">
            <h3 className="text-gray-900 mb-1">User Growth</h3>
            <p className="text-gray-600 text-sm">Active users per month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="users" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
