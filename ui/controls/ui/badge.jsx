import clsx from 'clsx';

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
