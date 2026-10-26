export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="8" fill="#0b1b33" />
        <path
          d="M8 19V9h4.2a4.8 4.8 0 1 1 0 9.6H10"
          stroke="#2dd4bf"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 9v10" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="text-lg font-semibold text-slate-900 dark:text-white">BharatBank</span>
    </span>
  );
}
