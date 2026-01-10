import clsx from 'clsx';

const variants = {
  default:
    'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:text-slate-900',
  destructive:
    'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  primary:
    'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
};

export function Button({ className, variant = 'default', children, ...props }) {
  return (
    <button
      className={clsx(
        'rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
