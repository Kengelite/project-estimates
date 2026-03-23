import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
// import { useAuth } from "../../contexts/useAuth";
// import { useLayoutEffect } from 'react';

import { useNavigate } from "react-router";

import { ChevronRight, Ellipsis,
    // ClipboardList 
} from "lucide-react";

import {
  ChartBarIcon,
//   FolderIcon,
//   ClipboardDocumentCheckIcon,
//   CubeIcon,
//   UsersIcon,
//   Squares2X2Icon,
//   TagIcon,
//   BuildingStorefrontIcon,
//   BuildingOffice2Icon,
//   MapPinIcon,
//   WrenchScrewdriverIcon,
  ArrowRightStartOnRectangleIcon,
//   CameraIcon,
} from "@heroicons/react/24/outline";

import { useSidebar } from "../context/useSidebar";
// import SidebarWidget from "./SidebarWidget";

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
    icon: <ChartBarIcon className="w-5 h-5" />,
    name: "dashboard",
    path: "/dashboard",
    roles: ["admin", "superadmin", "superstaff"],
  },
//   {
//     icon: <FolderIcon className="w-5 h-5" />,
//     name: "โครงการใหญ่ทั้งหมด",
//     path: "/superproject",
//     roles: ["admin", "superadmin", "superstaff"],
//   },
//    {
//     icon: <ClipboardList className="w-5 h-5" />,
//     name: "โครงการทั้งหมด",
//     path: "/project",
//     roles: ["admin", "superadmin", "superstaff"],
//   },
//   {
//     icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
//     name: "งานที่ได้รับผิดชอบ",
//     path: "/responsible",
//     roles: ["staff"],
//   },
//   {
//     icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
//     name: "ตรวจรับงาน",
//     path: "/checksuperproject",
//     roles: ["admin", "superadmin"],
//   },
//   {
//     icon: <CubeIcon className="w-5 h-5" />,
//     name: "สินค้า",
//     path: "/product",
//     roles: ["admin", "superadmin", "superstaff"],
//   },
//   {
//     icon: <UsersIcon className="w-5 h-5" />,
//     name: "พนักงาน",
//     path: "/user",
//     roles: ["admin", "superadmin"],
//   },
//   {
//     name: "จัดการข้อมูลสินค้า",
//     icon: <Squares2X2Icon className="w-5 h-5" />,
//     subItems: [
//       {
//         name: "ประเภท",
//         path: "/category",
//         icon: <TagIcon className="w-4 h-4" />,
//       },
//       {
//         name: "แบรนด์",
//         path: "/brand",
//         icon: <BuildingStorefrontIcon className="w-4 h-4" />,
//       },
//       {
//         name: "ถ่ายรูปภาพ",
//         path: "/project-image",
//         icon: <CameraIcon className="w-4 h-4" />,
//       },
//     ],
//     roles: ["admin", "superadmin", "superstaff"],
//   },

//   {
//     name: "จัดการข้อมูลทั่วไป",
//     icon: <WrenchScrewdriverIcon className="w-5 h-5" />,
//     subItems: [
//       {
//         name: "หน่วยงาน",
//         path: "/agency",
//         icon: <BuildingOffice2Icon className="w-4 h-4" />,
//       },
//       {
//         name: "จังหวัด",
//         path: "/province",
//         icon: <MapPinIcon className="w-4 h-4" />,
//       },
//     ],
//     roles: ["admin", "superadmin", "superstaff"],
//   },

  {
    icon: <ArrowRightStartOnRectangleIcon className="w-5 h-5" />,
    name: "ออกจากระบบ",
    // path: "/logout", // หรือ onClick logout ก็ได้
    onClick: () => {},
    roles: ["admin", "staff", "superadmin", "superstaff"],
  },
];

const othersItems: NavItem[] = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart" },
  //     { name: "Bar Chart", path: "/bar-chart" },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts" },
  //     { name: "Avatar", path: "/avatars" },
  //     { name: "Badge", path: "/badge" },
  //     { name: "Buttons", path: "/buttons" },
  //     { name: "Images", path: "/images" },
  //     { name: "Videos", path: "/videos" },
  //   ],
  // },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin" },
  //     { name: "Sign Up", path: "/signup" },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

//   const { user, logout } = useAuth();

  const [manualOpenSubmenu, setManualOpenSubmenu] = useState<
    OpenSubmenu | "closed"
  >();
  // const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      // ใช้ exact match หรือ startsWith ตามความเหมาะสม
      return location.pathname === path;
    },
    [location.pathname],
  );

  const shouldShowContent = useMemo(
    () => isExpanded || isHovered || isMobileOpen,
    [isExpanded, isHovered, isMobileOpen],
  );

  const shouldCenterCollapsed = useMemo(
    () => !isExpanded && !isHovered,
    [isExpanded, isHovered],
  );

  const isNavActive = useCallback(
    (nav: NavItem) => {
      // 1. ถ้าเป็นเมนูที่มี path ตรงๆ (ไม่มี subItems)
      if (nav.path && !nav.subItems) {
        return location.pathname === nav.path;
      }

      // 2. ถ้าเป็นเมนูที่มีลูก (Submenu)
      if (nav.subItems) {
        // เช็คว่ามีลูกตัวไหนตรงกับ URL ปัจจุบันแบบเป๊ะๆ ไหม
        return nav.subItems.some((sub) => location.pathname === sub.path);
      }

      return false;
    },
    [location.pathname],
  );

  // Auto-open submenu containing active route
  // useEffect(() => {
  //   const menus = [
  //     { items: navItems, type: "main" as MenuType },
  //     { items: othersItems, type: "others" as MenuType },
  //   ];

  //   for (const menu of menus) {
  //     const matchIndex = menu.items.findIndex((nav) =>
  //       nav.subItems?.some((subItem) => isActive(subItem.path))
  //     );

  //     if (matchIndex !== -1) {
  //       setOpenSubmenu({ type: menu.type, index: matchIndex });
  //       return;
  //     }
  //   }

  //   setOpenSubmenu(null);
  // }, [location.pathname, isActive]);

  //  เมื่อใช้ React Compiler ไม่จำเป็นต้องใช้ useMemo แล้ว
  // ระบบจะจัดการแคชค่า (Memoize) ให้โดยอัตโนมัติ
  // const activeSubmenuFromUrl = useMemo<OpenSubmenu>(() => {
  //   const menus = [
  //     { items: navItems, type: "main" as MenuType },
  //     { items: othersItems, type: "others" as MenuType },
  //   ];

  //   for (const menu of menus) {
  //     const matchIndex = menu.items.findIndex((nav) =>
  //       nav.subItems?.some((subItem) => isActive(subItem.path)),
  //     );
  //     if (matchIndex !== -1) {
  //       return { type: menu.type, index: matchIndex };
  //     }
  //   }
  //   return null;
  // }, [isActive]);

  function getActiveSubmenuFromUrl(): OpenSubmenu {
    const menus = [
      { items: navItems, type: "main" as MenuType },
      { items: othersItems, type: "others" as MenuType },
    ];

    for (const menu of menus) {
      const matchIndex = menu.items.findIndex((nav) =>
        nav.subItems?.some((subItem) => location.pathname === subItem.path),
      );

      if (matchIndex !== -1) {
        return { type: menu.type, index: matchIndex };
      }
    }

    return null;
  }

  const activeSubmenuFromUrl = getActiveSubmenuFromUrl();

  // รวมสถานะ: ถ้าคลิกปิดให้ปิด ถ้าไม่ได้คลิกให้เปิดตาม URL
  const openSubmenu =
    manualOpenSubmenu === "closed"
      ? null
      : (manualOpenSubmenu ?? activeSubmenuFromUrl);

  // Calculate submenu heights
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

  // const handleSubmenuToggle = useCallback(
  //   (index: number, menuType: MenuType) => {
  //     setOpenSubmenu((prev) => {
  //       if (prev?.type === menuType && prev?.index === index) {
  //         return null;
  //       }
  //       return { type: menuType, index };
  //     });
  //   },
  //   [],
  // );

  //  แก้ไขจุดที่ 214: นำ (prev) => ออก
  const handleSubmenuToggle = useCallback(
    (index: number, menuType: MenuType) => {
      // เช็คสถานะปัจจุบันจาก openSubmenu ได้เลย
      const isOpenNow =
        openSubmenu?.type === menuType && openSubmenu?.index === index;

      // สั่ง Set ค่าลงไปตรงๆ ไม่ต้องใช้ callback (prev)
      setManualOpenSubmenu(isOpenNow ? "closed" : { type: menuType, index });
    },
    [openSubmenu], // ฟังก์ชันจะสร้างใหม่เมื่อ openSubmenu เปลี่ยนค่า
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
        <span className="flex items-center gap-1 ml-auto">
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
          <ul className="mt-2 space-y-1 ml-9 mb-2">
            {nav.subItems.map((subItem) => {
              const isItemActive = isActive(subItem.path); //  เช็คตัวลูก

              return (
                <li key={subItem.name}>
                  <Link
                    to={subItem.path}
                    className={`flex items-center gap-x-3 rounded-l-lg ${
                      isItemActive
                        ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="flex items-center justify-center w-5 h-5 ml-2">
                      {subItem.icon}
                    </span>

                    <span className="flex-1 py-2 text-sm">{subItem.name}</span>

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
    // await logout();
    navigate("/login");
  }, [ navigate]);

  // เรียกเมนูออกมาแสดง
  // const renderMenuItem = (nav: NavItem, index: number, menuType: MenuType) => {
  //   const hasSubItems = Boolean(nav.subItems);

  //   const isItemActive = isNavActive(nav);
  //   const isOpen = isSubmenuOpen(menuType, index);

  //   const isActiveNow = isItemActive;

  //   const iconClass = `menu-item-icon-size flex-shrink-0 ml-2 ${
  //     isItemActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
  //   }`;

  //   const menuClass = `menu-item group w-full py-2 ${
  //     isActiveNow
  //       ? "bg-blue-50 text-blue-700 border-r-4 rounded-l-lg border-blue-500"
  //       : "hover:bg-gray-50 text-gray-600 rounded-l-lg"
  //   }`;

  //   // ----- มี Submenu -----
  //   if (hasSubItems) {
  //     return (
  //       <>
  //         <button
  //           onClick={() => handleSubmenuToggle(index, menuType)}
  //           className={`${menuClass} flex items-center justify-between w-full cursor-pointer ${
  //             shouldCenterCollapsed ? "lg:justify-center" : ""
  //           }`}
  //         >
  //           <div className="flex items-center gap-3">
  //             <span className={iconClass}>{nav.icon}</span>
  //             {shouldShowContent && (
  //               <span className="menu-item-text whitespace-nowrap">
  //                 {nav.name}
  //               </span>
  //             )}
  //           </div>

  //           {shouldShowContent && (
  //             <ChevronDownIcon
  //               className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
  //                 isOpen ? "rotate-180 text-brand-500" : "text-gray-400"
  //               }`}
  //             />
  //           )}
  //         </button>

  //         {renderSubmenu(nav, index, menuType)}
  //       </>
  //     );
  //   }

  //   // ----- Action menu (logout) -----
  //   if (nav.onClick) {
  //     return (
  //       <button
  //         onClick={handleLogout}
  //         className={`${menuClass} flex items-center gap-3 ${
  //           shouldCenterCollapsed ? "lg:justify-center" : "lg:justify-start"
  //         }`}
  //       >
  //         <span className={`${iconClass} text-red-400`}>{nav.icon}</span>
  //         {shouldShowContent && (
  //           <span className="menu-item-text text-red-400">{nav.name}</span>
  //         )}
  //       </button>
  //     );
  //   }

  //   // ----- ปกติเป็น Link -----
  //   if (nav.path) {
  //     return (
  //       <Link
  //         to={nav.path}
  //         className={`${menuClass} flex items-center gap-3 ${
  //           shouldCenterCollapsed ? "lg:justify-center" : "lg:justify-start"
  //         }`}
  //       >
  //         <span className={iconClass}>{nav.icon}</span>
  //         {shouldShowContent && (
  //           <span className="menu-item-text">{nav.name}</span>
  //         )}
  //       </Link>
  //     );
  //   }

  //   return null;
  // };

  // const renderMenuItems = useCallback(
  //   (items: NavItem[], menuType: MenuType) => (
  //     <ul className="flex flex-col gap-1">
  //       {items
  //         .filter(
  //           (nav) => !nav.roles || nav.roles.includes(user?.role as string),
  //         )
  //         .map((nav, index) => (
  //           <li key={nav.name}>{renderMenuItem(nav, index, menuType)}</li>
  //         ))}
  //     </ul>
  //   ),
  //   [user?.role, openSubmenu, shouldShowContent]
  // );

  const renderMenuItems = useCallback(
    (items: NavItem[], menuType: MenuType) => {
      const renderMenuItem = (nav: NavItem, index: number) => {
        const hasSubItems = Boolean(nav.subItems);

        const isItemActive = isNavActive(nav);
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;

        const iconClass = `menu-item-icon-size flex-shrink-0 ml-2 ${
          isItemActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
        }`;

        const menuClass = `menu-item group w-full py-2 ${
          isItemActive
            ? "bg-blue-50 text-blue-700 border-r-4 rounded-l-lg border-blue-500"
            : "hover:bg-gray-50 text-gray-600 rounded-l-lg"
        }`;

        // ----- มี Submenu -----
        if (hasSubItems && nav.subItems) {
          return (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`${menuClass} flex items-center justify-between w-full cursor-pointer ${
                  shouldCenterCollapsed ? "lg:justify-center" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={iconClass}>{nav.icon}</span>
                  {shouldShowContent && (
                    <span className="menu-item-text whitespace-nowrap">
                      {nav.name}
                    </span>
                  )}
                </div>

                {shouldShowContent && (
                  <ChevronRight
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-500" : "text-gray-400"
                    }`}
                  />
                )}
              </button>

              {renderSubmenu(nav, index, menuType)}
            </>
          );
        }

        // ----- Logout -----
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
                <span className="menu-item-text text-red-400">{nav.name}</span>
              )}
            </button>
          );
        }

        // ----- ปกติ -----
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
                <span className="menu-item-text">{nav.name}</span>
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
                // user?.role as string
              (nav) => !nav.roles || nav.roles.includes("admin" as string),
            )
            .map((nav, index) => (
              <li key={nav.name}>{renderMenuItem(nav, index)}</li>
            ))}
        </ul>
      );
    },
    [
    //   user?.role,
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
        className={`mb-4 ml-2 text-xs font-medium uppercase flex leading-[20px] text-gray-400 dark:text-gray-500 ${
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${sidebarWidth}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`py-8 flex ${
          shouldCenterCollapsed ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/dashboard" className="flex items-center gap-3">
          {shouldShowContent ? (
            <div className="flex items-center gap-3">
              <img
                className="dark:hidden"
                src="/iconweb.jpeg"
                alt="Logo"
                width={50}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={50}
                height={40}
              />
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Project Estimates
              </span>
            </div>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6 flex-1">
          <div className="flex flex-col gap-6">
            <div>
              {renderSectionHeader("Menu")}
              {renderMenuItems(navItems, "main")}
            </div>
            {/* <div>
              {renderSectionHeader("Others")}
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
