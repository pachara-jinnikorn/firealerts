import { Check } from 'lucide-react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-2 rounded-xl transition-colors">
      <div
        onClick={() => onChange(!checked)}
        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${
          checked
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 shadow-blue-200'
            : 'bg-white border-gray-300 hover:border-blue-300'
        }`}
      >
        {checked && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
      </div>
      <span className="text-gray-900">{label}</span>
    </label>
  );
}