import { Search, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-gray-900">Dashboard</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-900 hover:text-blue-600 transition-colors">
              Overview
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Projects
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Analytics
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Reports
            </a>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search Field */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 w-full text-sm"
            />
          </div>

          {/* New Project Button */}
          <button className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"></div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Settings
                </a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Team
                </a>
                <hr className="my-2 border-gray-200" />
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
