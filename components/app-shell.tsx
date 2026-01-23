"use client";

import { Button, Drawer, Dropdown, Grid, Layout, Menu, Space, Tag, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardPen,
  FolderKanban,
  Gauge,
  ListChecks,
  LogOut,
  Menu as MenuIcon,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Role } from "@/api/types";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "./session-provider";

const { Header, Sider, Content } = Layout;

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { key: "/dashboard", label: "Dashboard", icon: <Gauge size={18} /> },
  { key: "/projects", label: "Projects", icon: <FolderKanban size={18} /> },
  { key: "/tasks", label: "Tasks", icon: <ListChecks size={18} /> },
  { key: "/field-log", label: "Field Log", icon: <ClipboardPen size={18} /> },
  {
    key: "/approvals",
    label: "Approvals",
    icon: <ClipboardCheck size={18} />,
    roles: ["admin", "manager"],
  },
  { key: "/reports", label: "Reports", icon: <BarChart3 size={18} /> },
  {
    key: "/team",
    label: "Team",
    icon: <Users size={18} />,
    roles: ["admin", "manager"],
  },
  { key: "/settings", label: "Settings", icon: <Settings size={18} /> },
];

const MEMBER_NAV_KEYS = new Set(["/projects", "/tasks", "/field-log"]);
const MEMBER_ALLOWED_PREFIXES = ["/projects", "/tasks", "/field-log", "/settings"];

function getActiveKey(pathname: string) {
  if (pathname.startsWith("/projects")) return "/projects";
  if (pathname.startsWith("/tasks")) return "/tasks";
  if (pathname.startsWith("/field-log")) return "/field-log";
  if (pathname.startsWith("/approvals")) return "/approvals";
  if (pathname.startsWith("/reports")) return "/reports";
  if (pathname.startsWith("/team")) return "/team";
  if (pathname.startsWith("/settings")) return "/settings";
  return "/dashboard";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, company, user } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMember = profile?.role === "member";

  const menuItems = useMemo<MenuProps["items"]>(() => {
    return NAV_ITEMS.filter((item) => {
      if (profile?.role === "member") {
        return MEMBER_NAV_KEYS.has(item.key);
      }
      if (!item.roles || !profile?.role) {
        return true;
      }
      return item.roles.includes(profile.role);
    }).map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    }));
  }, [profile?.role]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "settings",
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
    {
      key: "logout",
      label: "Sign out",
      icon: <LogOut size={16} />,
      onClick: handleLogout,
    },
  ];

  const selectedKey = getActiveKey(pathname);
  const isMobile = isMember || !screens.lg;
  const displayName =
    profile?.full_name ??
    user?.email ??
    profile?.id ??
    user?.id ??
    "Account";

  useEffect(() => {
    if (!isMember) return;
    const allowed = MEMBER_ALLOWED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    if (!allowed) {
      router.replace("/field-log");
    }
  }, [isMember, pathname, router]);

  return (
    <Layout className={`app-frame${isMember ? " app-frame-member" : ""}`}>
      {!isMobile ? (
        <Sider width={248} className="app-sider">
          <div className="app-logo">
            <Link href="/dashboard">ForgeTrack</Link>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={(info) => router.push(info.key)}
            className="app-menu"
          />
          <div className="app-sider-footer">
            <Typography.Text className="app-sider-label" type="secondary">
              Workspace
            </Typography.Text>
            <Typography.Text strong>
              {company?.name ?? "No company yet"}
            </Typography.Text>
            {profile?.role ? (
              <Tag className="app-role-tag">{profile.role}</Tag>
            ) : null}
          </div>
        </Sider>
      ) : null}

      <Layout>
        <Header className="app-topbar">
          <Space size="middle" align="center">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuIcon size={18} />}
                onClick={() => setDrawerOpen(true)}
              />
            ) : null}
            <div>
              <Typography.Text className="app-topbar-title">
                {company?.name ?? "Construction Ops"}
              </Typography.Text>
              <Typography.Text className="app-topbar-subtitle" type="secondary">
                {displayName}
              </Typography.Text>
            </div>
          </Space>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" className="app-user-button">
              <Space size="small">
                <span className="app-user-avatar">
                  {(displayName || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <span className="app-user-label">
                  {displayName}
                </span>
              </Space>
            </Button>
          </Dropdown>
        </Header>

        <Content className="app-content-wrap">{children}</Content>
      </Layout>

      <Drawer
        placement="left"
        width={260}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="app-drawer"
      >
        <div className="app-logo drawer-logo">
          <Link href="/dashboard" onClick={() => setDrawerOpen(false)}>
            ForgeTrack
          </Link>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={(info) => {
            router.push(info.key);
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </Layout>
  );
}
