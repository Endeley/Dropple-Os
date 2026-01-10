import clsx from 'clsx';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={clsx(
        'w-full resize-none rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:bg-white',
        className
      )}
      {...props}
    />
  );
}
