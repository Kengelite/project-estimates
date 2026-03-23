import { createContext } from "react";

export type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (value: boolean) => void;
  setActiveItem: (value: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);
