import { useState, useEffect, memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  Calendar,
  BookOpen,
  Mic,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Knowledge Tree", href: "/knowledge-tree", icon: GitBranch },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Syllabus", href: "/syllabus", icon: BookOpen },
  { name: "Voice Viva", href: "/viva", icon: Mic },
  { name: "AI Chat", href: "/chat", icon: Sparkles },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProfile {
  full_name: string | null;
  avatar_url: string | null;
  level: number;
  current_xp: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// SidebarContent extracted as a top-level component so React doesn't unmount it
// on every re-render of DashboardSidebar. Defining it inside the parent would
// create a new function reference each render → React treats it as a new
// component type → full unmount/remount on every keystroke.
// ──────────────────────────────────────────────────────────────────────────────
interface SidebarContentProps {
  collapsed: boolean;
  isMobile?: boolean;
  profile: SidebarProfile | null;
  displayName: string;
  onCollapse: () => void;
  onLogout: () => void;
  onNavClick: () => void;
}

const SidebarContent = memo(({
  collapsed,
  isMobile = false,
  profile,
  displayName,
  onCollapse,
  onLogout,
  onNavClick,
}: SidebarContentProps) => {
  const location = useLocation();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shrink-0">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display text-lg font-semibold whitespace-nowrap"
              >
                NeuroCanopy
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onCollapse}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <NavLink
                to={item.href}
                onClick={isMobile ? onNavClick : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-accent/50 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={isMobile ? "activeTabMobile" : "activeTab"}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  )}
                />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );

            return (
              <li key={item.name}>
                {collapsed && !isMobile ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-border/50 p-3">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer",
            collapsed && !isMobile && "justify-center"
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Level {profile?.level ?? 1} • {profile?.current_xp ?? 0} XP
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {(!collapsed || isMobile) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onLogout}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
});

SidebarContent.displayName = "SidebarContent";

// ──────────────────────────────────────────────────────────────────────────────
// Main sidebar shell — only manages collapse state and profile data fetching
// ──────────────────────────────────────────────────────────────────────────────
export const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, gamification")
        .eq("id", user.id)
        .single();

      if (data) {
        const gam = data.gamification as any;
        setProfile({
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          level: gam?.level ?? 1,
          current_xp: gam?.current_xp ?? 0,
        });
      } else {
        setProfile({
          full_name: user.user_metadata?.full_name ?? user.email ?? "User",
          avatar_url: null,
          level: 1,
          current_xp: 0,
        });
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? "User";

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-border/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">NeuroCanopy</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex flex-col h-full">
              <SidebarContent
                collapsed={false}
                isMobile
                profile={profile}
                displayName={displayName}
                onCollapse={() => { }}
                onLogout={handleLogout}
                onNavClick={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-50 h-screen glass border-r border-border/50 flex flex-col hidden md:flex"
      >
        <SidebarContent
          collapsed={collapsed}
          profile={profile}
          displayName={displayName}
          onCollapse={() => setCollapsed(c => !c)}
          onLogout={handleLogout}
          onNavClick={() => { }}
        />
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name.split(" ")[0]}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
