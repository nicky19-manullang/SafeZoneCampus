import { cn } from '../../utils/helpers';

const Card = ({
  children,
  className,
  padding = 'md',
  hover = false,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-slate-200',
        paddings[padding],
        hover && 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-slate-900', className)}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className }) => (
  <p className={cn('text-sm text-slate-500 mt-1', className)}>{children}</p>
);

export const CardContent = ({ children, className }) => (
  <div className={cn(className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={cn('mt-4 pt-4 border-t border-slate-100', className)}>
    {children}
  </div>
);

export default Card;
