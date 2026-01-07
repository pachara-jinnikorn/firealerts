import { Clock, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';

const summaries = [
  {
    icon: Clock,
    title: 'In Progress',
    count: 24,
    description: 'Active tasks',
    color: 'bg-orange-100 text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    icon: CheckCircle2,
    title: 'Completed',
    count: 156,
    description: 'Tasks finished',
    color: 'bg-green-100 text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: AlertCircle,
    title: 'Pending Review',
    count: 12,
    description: 'Awaiting approval',
    color: 'bg-yellow-100 text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    icon: BarChart3,
    title: 'Total Projects',
    count: 45,
    description: 'All time',
    color: 'bg-blue-100 text-blue-600',
    bgColor: 'bg-blue-50'
  },
];

export function SummaryCards() {
  return (
    <div className="mb-8">
      <h2 className="text-gray-900 mb-4">Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map((summary, index) => {
          const Icon = summary.icon;
          return (
            <div key={index} className={`${summary.bgColor} rounded-xl p-6 border border-gray-200`}>
              <div className={`w-12 h-12 ${summary.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-gray-900 mb-1">{summary.count}</p>
              <p className="text-gray-900 text-sm mb-1">{summary.title}</p>
              <p className="text-gray-600 text-sm">{summary.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
