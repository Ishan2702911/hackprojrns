interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(e.currentTarget.value);
    }
  };

  return (
    <header className="fixed top-0 w-full md:w-[calc(100%-16rem)] md:ml-64 z-40 bg-surface-container-low flex justify-between items-center h-16 px-6 border-b border-outline-variant/10">
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 material-symbols-outlined text-lg">search</span>
          <input
            className="bg-background border-none focus:ring-1 focus:ring-primary-container rounded-md pl-10 pr-4 py-1.5 text-sm w-64 text-on-surface placeholder:text-on-surface-variant/20"
            placeholder="Enter repo (e.g. facebook/react)"
            type="text"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant/60 hover:bg-surface-container-highest/40 rounded-full transition-all duration-300">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-on-surface-variant/60 hover:bg-surface-container-highest/40 rounded-full transition-all duration-300">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-outline-variant/20">
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src="https://picsum.photos/seed/dev/100/100"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
