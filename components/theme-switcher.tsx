"use client";

import { Button, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "light",
        label: (
          <Space>
            <Sun size={16} />
            Light
          </Space>
        ),
      },
      {
        key: "dark",
        label: (
          <Space>
            <Moon size={16} />
            Dark
          </Space>
        ),
      },
      {
        key: "system",
        label: (
          <Space>
            <Laptop size={16} />
            System
          </Space>
        ),
      },
    ],
    [],
  );

  if (!mounted) {
    return null;
  }

  const icon =
    theme === "light" ? (
      <Sun size={16} />
    ) : theme === "dark" ? (
      <Moon size={16} />
    ) : (
      <Laptop size={16} />
    );

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: [theme ?? "system"],
        onClick: ({ key }) => setTheme(key),
      }}
      placement="bottomLeft"
    >
      <Button size="small" icon={icon} aria-label="Toggle theme" />
    </Dropdown>
  );
};

export { ThemeSwitcher };
