"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Mail,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  Store,
  ChevronRight,
} from "lucide-react";

const MAIN_MENU = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const BOTTOM_MENU = [
  { name: "Help", href: "/admin/help", icon: HelpCircle },
  { name: "Admin Profile", href: "/admin/profile", icon: User },
];

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminUser, setAdminUser] = useState({
    name: "Store Administrator",
    email: "admin@ak-kiosk.de",
    role: "superadmin",
  });

  // Fetch verified admin user session on mount
  useEffect(() => {
    async function loadAdminMe() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setAdminUser(data.user);
          }
        }
      } catch {
        // Fallback default info
      }
    }
    loadAdminMe();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const currentNav =
    MAIN_MENU.find((item) => item.href === pathname) ||
    BOTTOM_MENU.find((item) => item.href === pathname) || {
      name: "Dashboard",
    };

  return (
    <div className="h-screen overflow-hidden bg-[#F0F4F6] text-ak-charcoal flex font-sans">

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-over) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen shrink-0
    bg-ak-charcoal text-ak-ivory flex flex-col justify-between
    overflow-y-auto transition-transform duration-300 ease-in-out
    border-r border-ak-charcoal
    lg:relative lg:inset-auto lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ak-gold to-[#c49b55] text-ak-charcoal font-bold flex items-center justify-center text-xs shadow-sm">
                AK
              </div>
              <div>
                <span className="font-serif text-sm font-bold tracking-widest text-white block uppercase">
                  AK KIOSK
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase font-semibold text-ak-gold block">
                  ADMIN PANEL
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-ak-pale-grey/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-6">
            <span className="px-3 text-[10px] uppercase tracking-[0.2em] font-bold text-ak-gold/80 block mb-2">
              Main Menu
            </span>
            <nav className="space-y-1">
              {MAIN_MENU.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${isActive
                      ? "bg-ak-burgundy text-white shadow-sm font-semibold"
                      : "text-ak-pale-grey/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <span className="px-3 text-[10px] uppercase tracking-[0.2em] font-bold text-ak-pale-grey/40 block mb-2">
            System & Support
          </span>

          {BOTTOM_MENU.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${isActive
                  ? "bg-ak-burgundy text-white shadow-sm font-semibold"
                  : "text-ak-pale-grey/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{loggingOut ? "Logging out..." : "Sign Out"}</span>
          </button>

          {/* Admin User Badge */}
          <div className="pt-3 mt-3 border-t border-white/10 px-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {adminUser.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-white block truncate">
                {adminUser.name || "Administrator"}
              </span>
              <span className="text-[10px] text-ak-pale-grey/60 block truncate">
                {adminUser.email}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-ak-charcoal/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ak-charcoal hover:bg-ak-charcoal/5"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-ak-charcoal-light">
              <span className="hidden sm:inline">Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="font-semibold text-ak-charcoal">
                {currentNav.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Link back to public store */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ak-charcoal hover:text-ak-burgundy bg-ak-charcoal/5 hover:bg-ak-charcoal/10 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Store</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <div className="h-4 w-px bg-ak-charcoal/15 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-ak-charcoal-light hidden sm:inline">
                Live Status
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}

