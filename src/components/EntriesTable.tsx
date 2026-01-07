import { MoreVertical, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

const entries = [
  {
    id: 1,
    project: 'Website Redesign',
    client: 'Acme Corp',
    status: 'In Progress',
    priority: 'High',
    assignee: 'Sarah Chen',
    dueDate: '2026-01-15',
    progress: 65,
  },
  {
    id: 2,
    project: 'Mobile App Development',
    client: 'Tech Startup',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Smith',
    dueDate: '2026-01-20',
    progress: 40,
  },
  {
    id: 3,
    project: 'Brand Identity',
    client: 'Fashion Brand',
    status: 'Review',
    priority: 'Medium',
    assignee: 'Emma Wilson',
    dueDate: '2026-01-10',
    progress: 90,
  },
  {
    id: 4,
    project: 'E-commerce Platform',
    client: 'Retail Co',
    status: 'Completed',
    priority: 'High',
    assignee: 'Michael Brown',
    dueDate: '2026-01-05',
    progress: 100,
  },
  {
    id: 5,
    project: 'Marketing Campaign',
    client: 'StartupXYZ',
    status: 'Planning',
    priority: 'Low',
    assignee: 'Lisa Anderson',
    dueDate: '2026-01-25',
    progress: 15,
  },
  {
    id: 6,
    project: 'Database Migration',
    client: 'Enterprise Inc',
    status: 'In Progress',
    priority: 'High',
    assignee: 'David Lee',
    dueDate: '2026-01-18',
    progress: 55,
  },
  {
    id: 7,
    project: 'UI Component Library',
    client: 'Internal',
    status: 'Review',
    priority: 'Medium',
    assignee: 'Sarah Chen',
    dueDate: '2026-01-12',
    progress: 80,
  },
  {
    id: 8,
    project: 'API Integration',
    client: 'SaaS Company',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'John Smith',
    dueDate: '2026-01-22',
    progress: 45,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Review':
      return 'bg-yellow-100 text-yellow-700';
    case 'Planning':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'text-red-600';
    case 'Medium':
      return 'text-orange-600';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export function EntriesTable() {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900">Recent Projects</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">
                  <button onClick={() => handleSort('project')} className="flex items-center gap-1 hover:text-gray-900">
                    Project
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">Client</th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">Status</th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">Priority</th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">Assignee</th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">Due Date</th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm">Progress</th>
                <th className="text-left px-6 py-3 text-gray-700 text-sm"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{entry.project}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.client}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${getPriorityColor(entry.priority)}`}>
                      {entry.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{entry.assignee}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.dueDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${entry.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{entry.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
