import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/hooks/useAuth";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: "insights", label: "Pulse", path: "/pulse" },
  { icon: "account_tree", label: "Repositories", path: "/repositories" },
  { icon: "alt_route", label: "PR Mapping", path: "/pr-mapping" },
  { icon: "warning", label: "Conflict Engine", path: "/conflicts" },
  { icon: "history", label: "History", path: "/history" },
];

const footerItems = [
  { icon: "menu_book", label: "Documentation", path: "#" },
  { icon: "contact_support", label: "Support", path: "#" },
];

export default function Sidebar() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-surface-container-low flex flex-col py-8 px-4 hidden md:flex border-r border-outline-variant/10">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-black text-primary-container font-headline uppercase tracking-widest">ARTENIS</h1>
        <p className="text-[10px] text-on-surface-variant/40 tracking-[0.2em] mt-1 font-headline uppercase">Synthetic Architect v1.0</p>
      </div>
      
      {isAuthenticated ? (
        <button 
          onClick={logout}
          className="w-full mb-8 py-3 px-4 rounded-lg border border-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest transition-all hover:bg-surface-container-highest active:scale-[0.98]"
        >
          Disconnect GitHub
        </button>
      ) : (
        <button 
          onClick={login}
          className="w-full mb-8 py-3 px-4 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-background font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Connect GitHub
        </button>
      )}

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 py-3 px-4 font-headline text-sm uppercase tracking-widest transition-all",
              isActive 
                ? "text-primary bg-gradient-to-r from-primary-container/10 to-transparent border-r-2 border-primary-container" 
                : "text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container transition-all"
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn("material-symbols-outlined", isActive && "fill-1")}>
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-outline-variant/10">
        {footerItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="flex items-center gap-3 py-2 px-4 text-on-surface-variant/40 hover:text-on-surface font-headline text-xs uppercase tracking-widest transition-colors"
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
