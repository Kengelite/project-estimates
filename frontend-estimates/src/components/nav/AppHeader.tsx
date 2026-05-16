import React, { useEffect, useMemo, useState } from "react";

interface AppHeaderProps {
  onMenuClick?: () => void;
  userName?: string;
}

type AnyUser = {
  id?: string;
  ID?: string;
  userId?: string;
  user_id?: string;
  fname?: string;
  Fname?: string;
  lname?: string;
  Lname?: string;
  name?: string;
  Name?: string;
  username?: string;
  Username?: string;
  email?: string;
  Email?: string;
  role?: any;
  Role?: any;
  user?: any;
  data?: any;
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3001";

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

function safeJsonParse(value: string | null): any {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split(";").map((item) => item.trim());
  const target = cookies.find((item) => item.startsWith(`${name}=`));

  if (!target) return "";

  return decodeURIComponent(target.split("=").slice(1).join("="));
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => {
          return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function pickUserFromObject(value: any): AnyUser | null {
  if (!value || typeof value !== "object") return null;

  if (value.user && typeof value.user === "object") return value.user;
  if (value.data?.user && typeof value.data.user === "object") {
    return value.data.user;
  }
  if (value.data && typeof value.data === "object") return value.data;

  return value;
}

function getUserID(user: AnyUser | null) {
  if (!user) return "";

  return String(
    user.id ?? user.ID ?? user.userId ?? user.user_id ?? "",
  ).trim();
}

function getUserEmail(user: AnyUser | null) {
  if (!user) return "";

  return String(user.email ?? user.Email ?? "").trim().toLowerCase();
}

function buildDisplayName(user: AnyUser | null) {
  if (!user) return "";

  const target = pickUserFromObject(user) || user;

  const fname = String(target.fname ?? target.Fname ?? "").trim();
  const lname = String(target.lname ?? target.Lname ?? "").trim();
  const fullName = `${fname} ${lname}`.trim();

  if (fullName) return fullName;

  const directName = String(
    target.name ?? target.Name ?? target.username ?? target.Username ?? "",
  ).trim();

  if (directName) return directName;

  const email = String(target.email ?? target.Email ?? "").trim();
  if (email) return email.split("@")[0];

  return "";
}

function pickArrayFromResponse(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  return [];
}

function getStoredToken() {
  if (typeof window === "undefined") return "";

  const tokenKeys = [
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "jwtToken",
    "access_token",
  ];

  for (const key of tokenKeys) {
    const token =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key) ||
      getCookieValue(key);

    if (token) return token;
  }

  return "";
}

function getUserFromStorage() {
  if (typeof window === "undefined") return null;

  const userStorageKeys = [
    "user",
    "authUser",
    "currentUser",
    "userData",
    "profile",
    "loginUser",
    "admin",
    "account",
  ];

  for (const key of userStorageKeys) {
    const localValue = safeJsonParse(localStorage.getItem(key));
    const localUser = pickUserFromObject(localValue);

    if (localUser && (buildDisplayName(localUser) || getUserID(localUser) || getUserEmail(localUser))) {
      return localUser;
    }

    const sessionValue = safeJsonParse(sessionStorage.getItem(key));
    const sessionUser = pickUserFromObject(sessionValue);

    if (sessionUser && (buildDisplayName(sessionUser) || getUserID(sessionUser) || getUserEmail(sessionUser))) {
      return sessionUser;
    }
  }

  return null;
}

function getUserFromToken() {
  const token = getStoredToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const payloadUser = pickUserFromObject(payload);

  if (payloadUser) return payloadUser;

  return payload;
}

function getLoginIdentity() {
  const storageUser = getUserFromStorage();
  const tokenUser = getUserFromToken();

  const user = storageUser || tokenUser;

  const id = String(
    user?.id ??
      user?.ID ??
      user?.userId ??
      user?.user_id ??
      user?.sub ??
      "",
  ).trim();

  const email = String(user?.email ?? user?.Email ?? "").trim().toLowerCase();

  const name = buildDisplayName(user);

  return {
    id,
    email,
    name,
    rawUser: user,
  };
}

async function fetchCurrentUserNameFromUsers() {
  const identity = getLoginIdentity();

  if (identity.name && !identity.name.toLowerCase().includes("admin")) {
    return identity.name;
  }

  try {
    const response = await fetch(`${API_BASE}/api/users`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const json = await response.json();
    const users = pickArrayFromResponse(json);

    const matchedUser = users.find((item) => {
      const userId = String(item.id ?? item.ID ?? "").trim();
      const userEmail = String(item.email ?? item.Email ?? "")
        .trim()
        .toLowerCase();

      if (identity.id && userId && identity.id === userId) return true;
      if (identity.email && userEmail && identity.email === userEmail) return true;

      return false;
    });

    const matchedName = buildDisplayName(matchedUser);

    if (matchedName) {
      localStorage.setItem("user", JSON.stringify(matchedUser));
      return matchedName;
    }
  } catch (error) {
    console.error("Error loading current user for header:", error);
  }

  return identity.name || "";
}

export default function AppHeader({
  onMenuClick,
  userName,
}: AppHeaderProps) {
  const [loggedInUserName, setLoggedInUserName] = useState("Admin");

  useEffect(() => {
    let mounted = true;

    const loadUserName = async () => {
      const name = await fetchCurrentUserNameFromUsers();

      if (!mounted) return;

      setLoggedInUserName(name || "Admin");
    };

    loadUserName();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    return userName?.trim() || loggedInUserName || "Admin";
  }, [userName, loggedInUserName]);

  return (
    <header className="h-[92px] border-b border-gray-200 bg-white px-5 md:px-8">
      <div className="flex h-full items-center justify-between">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="16" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="flex items-center gap-4 rounded-full bg-white pr-2 text-gray-800"
          >
            <img
              src={DEFAULT_AVATAR}
              alt="Profile"
              className="h-[50px] w-[50px] rounded-full border border-gray-200 object-cover"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_AVATAR;
              }}
            />

            <span className="text-[18px] font-medium text-gray-700">
              {displayName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}