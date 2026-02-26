import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Pilih...',
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-slate-100 disabled:cursor-not-allowed',
          error
            ? 'border-danger focus:ring-danger/50 bg-red-50'
            : 'border-slate-300 hover:border-slate-400 focus:border-primary-500',
          className
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={cn(
          'mt-1.5 text-sm',
          error ? 'text-danger' : 'text-slate-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
