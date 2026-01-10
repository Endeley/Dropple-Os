'use client';

export default function AssessmentReviewLayout({ header, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        {header}
      </header>
      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {children}
      </div>
    </div>
  );
}
