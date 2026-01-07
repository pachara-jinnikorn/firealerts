interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all shadow-sm">
      <span className="text-gray-900">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-16 h-9 rounded-full transition-all shadow-inner ${
          checked ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-transform ${
            checked ? 'translate-x-8' : 'translate-x-1'
          }`}
        >
          {checked && <div className="absolute inset-2 bg-blue-500 rounded-full"></div>}
        </div>
      </div>
    </label>
  );
}