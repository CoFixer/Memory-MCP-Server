import { Check } from 'lucide-react';

interface CheckboxGroupProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: 2 | 3 | 4;
  sections?: Record<string, string[]>;
}

export default function CheckboxGroup({ options, selected, onChange, columns = 3, sections }: CheckboxGroupProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  const renderOptions = (opts: string[]) => (
    <div className={`grid ${gridCols[columns]} gap-2`}>
      {opts.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left ${
              isSelected
                ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div
              className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-slate-600 bg-slate-900'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="truncate">{option}</span>
          </button>
        );
      })}
    </div>
  );

  if (sections && Object.keys(sections).length > 0) {
    return (
      <div className="space-y-5">
        {Object.entries(sections).map(([title, opts]) => (
          <div key={title} className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
            {renderOptions(opts)}
          </div>
        ))}
      </div>
    );
  }

  return renderOptions(options);
}
