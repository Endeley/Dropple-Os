import clsx from 'clsx';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx('rounded-lg border border-slate-200 bg-white', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('border-b border-slate-100 p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx('p-4', className)} {...props}>
      {children}
    </div>
  );
}
