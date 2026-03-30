"use client";

export default function SettingsSectionHeader({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}
