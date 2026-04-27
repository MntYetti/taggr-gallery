import {
  Bell,
  Grid3X3,
  Layers3,
  PenSquare,
  Settings,
  UserRound,
} from "lucide-react";

export type AppView =
  | "gallery"
  | "realms"
  | "create"
  | "notifications"
  | "profile"
  | "settings";

export const navItems = [
  { id: "gallery", label: "Gallery", icon: Grid3X3 },
  { id: "realms", label: "Realms", icon: Layers3 },
  { id: "create", label: "Create", icon: PenSquare },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Settings", icon: Settings },
] satisfies Array<{
  id: AppView;
  label: string;
  icon: typeof Grid3X3;
}>;
