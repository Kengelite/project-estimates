import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useNavigate } from "react-router";

import { ChevronDown, ChevronUp, Ellipsis } from "lucide-react";
import {
  Squares2X2Icon,
  AcademicCapIcon,
  BookOpenIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ClipboardDocumentCheckIcon,
  InboxStackIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ArrowDownOnSquareIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { useSidebar } from "../context/useSidebar";

type SubItem = {
  icon: React.ReactNode;
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
  roles?: string[];
  onClick?: () => void;
};

type MenuType = "main" | "others";

type OpenSubmenu = {
  type: MenuType;
  index: number;
} | null;

const navItems: NavItem[] = [
  {
    icon: <Squares2X2Icon className="w-5 h-5" />,
    name: "แดชบอร์ด",
    path: "/dashboard",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <AcademicCapIcon className="w-5 h-5" />,
    name: "จัดการข้อมูลทั้งหมด",
    roles: ["admin", "superadmin", "superstaff"],
    subItems: [
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการปีการศึกษา",
        path: "/manage/years",
      },
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการระดับปริญญา",
        path: "/manage/degreelevels",
      },
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการโครงการระดับปริญญา",
        path: "/manage/sections",
      },
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการภาคการศึกษา",
        path: "/manage/semesters",
      },
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการชั้นปี",
        path: "/manage/studentyears",
      },
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการหมวดวิชา",
        path: "/manage/subjectcategories",
      },
      {
        icon: <AcademicCapIcon className="w-4 h-4" />,
        name: "จัดการรายวิชานอกคณะที่ถูกหัก",
        path: "/manage/subjectoutsides",
      },
    ],
  },
  {
    icon: <AcademicCapIcon className="w-5 h-5" />,
    name: "จัดการหลักสูตร",
    path: "/courses",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <BookOpenIcon className="w-5 h-5" />,
    name: "จัดการรายวิชานอกคณะ",
    path: "/subjects",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <BanknotesIcon className="w-5 h-5" />,
    name: "จัดการสาธารณูปโภค",
    path: "/funds",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <BuildingLibraryIcon className="w-5 h-5" />,
    name: "จัดการบริหารส่วนกลางวิทยาลัย",
    path: "/central",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
    name: "จัดการบริหารงานวิทยาลัย",
    path: "/university-work",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <InboxStackIcon className="w-5 h-5" />,
    name: "จัดการบริหารหลักสูตร",
    path: "/curriculum",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <DocumentCheckIcon className="w-5 h-5" />,
    name: "สรุปงบประมาณประจำปี",
    path: "/annual-budget-summary",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <DocumentTextIcon className="w-5 h-5" />,
    name: "สรุปข้อมูลงบประมาณ",
    path: "/annual-budget-management",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <ArrowDownOnSquareIcon className="w-5 h-5" />,
    name: "นำข้อมูลเข้าระบบ",
    path: "/import-data",
    roles: ["admin", "superadmin", "superstaff"],
  },
  {
    icon: <ArrowRightStartOnRectangleIcon className="w-5 h-5" />,
    name: "ออกจากระบบ",
    onClick: () => {},
    roles: ["admin", "staff", "superadmin", "superstaff"],
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [manualOpenSubmenu, setManualOpenSubmenu] = useState<
    OpenSubmenu | "closed"
  >();
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const shouldShowContent = useMemo(
    () => isExpanded || isHovered || isMobileOpen,
    [isExpanded, isHovered, isMobileOpen],
  );

  const shouldCenterCollapsed = useMemo(
    () => !isExpanded && !isHovered,
    [isExpanded, isHovered],
  );

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return location.pathname === path;

      return (
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`)
      );
    },
    [location.pathname],
  );

  const isNavActive = useCallback(
    (nav: NavItem) => {
      if (nav.path && !nav.subItems) {
        if (nav.path === "/") return location.pathname === nav.path;

        return (
          location.pathname === nav.path ||
          location.pathname.startsWith(`${nav.path}/`)
        );
      }

      if (nav.subItems) {
        return nav.subItems.some(
          (sub) =>
            location.pathname === sub.path ||
            location.pathname.startsWith(`${sub.path}/`),
        );
      }

      return false;
    },
    [location.pathname],
  );

  function getActiveSubmenuFromUrl(): OpenSubmenu {
    const menus = [
      { items: navItems, type: "main" as MenuType },
      { items: othersItems, type: "others" as MenuType },
    ];

    for (const menu of menus) {
      const matchIndex = menu.items.findIndex((nav) =>
        nav.subItems?.some(
          (subItem) =>
            location.pathname === subItem.path ||
            location.pathname.startsWith(`${subItem.path}/`),
        ),
      );

      if (matchIndex !== -1) {
        return { type: menu.type, index: matchIndex };
      }
    }

    return null;
  }

  const activeSubmenuFromUrl = getActiveSubmenuFromUrl();

  const openSubmenu =
    manualOpenSubmenu === "closed"
      ? null
      : (manualOpenSubmenu ?? activeSubmenuFromUrl);

  useEffect(() => {
    if (!openSubmenu) return;

    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const ref = subMenuRefs.current[key];

    if (ref) {
      const height = ref.scrollHeight;

      setSubMenuHeight((prev) =>
        prev[key] === height ? prev : { ...prev, [key]: height },
      );
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = useCallback(
    (index: number, menuType: MenuType) => {
      const isOpenNow =
        openSubmenu?.type === menuType && openSubmenu?.index === index;

      setManualOpenSubmenu(isOpenNow ? "closed" : { type: menuType, index });
    },
    [openSubmenu],
  );

  const isSubmenuOpen = useCallback(
    (menuType: MenuType, index: number) =>
      openSubmenu?.type === menuType && openSubmenu?.index === index,
    [openSubmenu],
  );

  const renderBadges = useCallback(
    (subItem: SubItem, isItemActive: boolean) => {
      if (!subItem.new && !subItem.pro) return null;

      const badgeClass = isItemActive
        ? "menu-dropdown-badge-active"
        : "menu-dropdown-badge-inactive";

      return (
        <span className="ml-auto flex items-center gap-1">
          {subItem.new && (
            <span className={`${badgeClass} menu-dropdown-badge`}>new</span>
          )}
          {subItem.pro && (
            <span className={`${badgeClass} menu-dropdown-badge`}>pro</span>
          )}
        </span>
      );
    },
    [],
  );

  const renderSubmenu = useCallback(
    (nav: NavItem, index: number, menuType: MenuType) => {
      if (!nav.subItems || !shouldShowContent) return null;

      const key = `${menuType}-${index}`;
      const isOpen = isSubmenuOpen(menuType, index);
      const height = isOpen ? subMenuHeight[key] || 0 : 0;

      return (
        <div
          ref={(el) => {
            subMenuRefs.current[key] = el;
          }}
          className="overflow-hidden transition-all duration-300"
          style={{ height: `${height}px` }}
        >
          <ul className="mt-2 mb-2 ml-9 space-y-1">
            {nav.subItems.map((subItem) => {
              const isItemActive = isActive(subItem.path);

              return (
                <li key={subItem.name}>
                  <Link
                    to={subItem.path}
                    className={`relative flex h-9 items-center gap-x-3 rounded-lg px-3 ${
                      isItemActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {isItemActive && (
                      <span className="absolute right-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-l-lg bg-blue-500" />
                    )}

                    <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                      {subItem.icon}
                    </span>

                    <span className="flex-1 text-xs font-small whitespace-nowrap">
                      {subItem.name}
                    </span>

                    {renderBadges(subItem, isItemActive)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      );
    },
    [shouldShowContent, isSubmenuOpen, subMenuHeight, isActive, renderBadges],
  );

  const handleLogout = useCallback(async () => {
    navigate("/login");
  }, [navigate]);

  const renderMenuItems = useCallback(
    (items: NavItem[], menuType: MenuType) => {
      const renderMenuItem = (nav: NavItem, index: number) => {
        const hasSubItems = Boolean(nav.subItems);

        // เมนูใหญ่ที่มี subItems จะไม่แสดง active bar/พื้นหลัง
        const isItemActive = !hasSubItems && isNavActive(nav);
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;

        const iconClass = `menu-item-icon-size flex-shrink-0 ml-2 ${
          isItemActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
        }`;

        const normalMenuClass =
          "hover:bg-gray-50 text-gray-600 rounded-l-lg";
        const activeMenuClass =
          "bg-blue-50 text-blue-700 border-r-4 border-blue-500 rounded-l-lg";

        const menuClass = `menu-item group w-full py-2 ${
          isItemActive ? activeMenuClass : normalMenuClass
        }`;

        if (hasSubItems && nav.subItems) {
          return (
            <>
              <button
                type="button"
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group w-full py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg flex items-center ${
                  shouldCenterCollapsed ? "lg:justify-center" : ""
                }`}
              >
                <span className="menu-item-icon-size flex-shrink-0 ml-2 text-gray-500">
                  {nav.icon}
                </span>

                {shouldShowContent && (
                  <>
                    <span className="menu-item-text ml-3 flex-1 whitespace-nowrap text-left text-xs">
                      {nav.name}
                    </span>

                    <span className="mr-3 flex-shrink-0 text-gray-400">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </>
                )}
              </button>

              {renderSubmenu(nav, index, menuType)}
            </>
          );
        }

        if (nav.onClick) {
          return (
            <button
              onClick={handleLogout}
              className={`${menuClass} flex items-center gap-3 ${
                shouldCenterCollapsed ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span className={`${iconClass} text-red-400`}>{nav.icon}</span>
              {shouldShowContent && (
                <span className="menu-item-text text-red-400 text-xs">
                  {nav.name}
                </span>
              )}
            </button>
          );
        }

        if (nav.path) {
          return (
            <Link
              to={nav.path}
              className={`${menuClass} flex items-center gap-3 ${
                shouldCenterCollapsed ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span className={iconClass}>{nav.icon}</span>
              {shouldShowContent && (
                <span className="menu-item-text text-xs">{nav.name}</span>
              )}
            </Link>
          );
        }

        return null;
      };

      return (
        <ul className="flex flex-col gap-1">
          {items
            .filter(
              (nav) => !nav.roles || nav.roles.includes("admin" as string),
            )
            .map((nav, index) => (
              <li key={nav.name}>{renderMenuItem(nav, index)}</li>
            ))}
        </ul>
      );
    },
    [
      openSubmenu,
      shouldShowContent,
      shouldCenterCollapsed,
      isNavActive,
      renderSubmenu,
      handleSubmenuToggle,
      handleLogout,
    ],
  );

  const renderSectionHeader = useCallback(
    (title: string) => (
      <h2
        className={`mb-4 ml-2 flex text-xs font-medium uppercase leading-[20px] text-gray-400 dark:text-gray-500 ${
          shouldCenterCollapsed ? "lg:justify-center" : "justify-start"
        }`}
      >
        {shouldShowContent ? title : <Ellipsis className="size-5" />}
      </h2>
    ),
    [shouldShowContent, shouldCenterCollapsed],
  );

  const sidebarWidth = useMemo(() => {
    if (isExpanded || isMobileOpen || isHovered) return "w-[290px]";
    return "w-[90px]";
  }, [isExpanded, isMobileOpen, isHovered]);

  const handleMouseEnter = useCallback(() => {
    if (!isExpanded) setIsHovered(true);
  }, [isExpanded, setIsHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, [setIsHovered]);

  return (
    <aside
      className={`fixed mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 top-0 left-0 z-50 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 lg:mt-0
        ${sidebarWidth}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`flex py-8 ${
          shouldCenterCollapsed ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/dashboard" className="flex items-center gap-3">
          {shouldShowContent ? (
            <div className="flex items-center gap-3">
              <img
                className="dark:hidden"
                src="CPFF.png"
                alt="Logo"
                width={50}
                height={50}
              />
              <img
                className="hidden dark:block"
                src="CPFF.png"
                alt="Logo"
                width={50}
                height={40}
              />
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Financial Forecast
              </span>
            </div>
          ) : (
            <img src="CPFF.png" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6 flex-1">
          <div className="flex flex-col gap-6">
            <div>
              {renderSectionHeader("Menu")}
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;