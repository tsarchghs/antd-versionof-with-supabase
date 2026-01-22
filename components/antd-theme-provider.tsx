"use client";

import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "next-themes";
import { useMemo } from "react";

export function AntdThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  const themeConfig = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    const algorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

    const lightTokens = {
      colorPrimary: "#7a1f2d",
      colorInfo: "#7a1f2d",
      colorSuccess: "#1f7a5d",
      colorWarning: "#c07a2a",
      colorError: "#b42330",
      colorText: "#1c1413",
      colorTextSecondary: "#5b4a46",
      colorBgBase: "#f6f1ea",
      colorBgLayout: "#f6f1ea",
      colorBgContainer: "#fffdfb",
      colorBorder: "#e6d7cc",
      colorBorderSecondary: "#efe2d8",
      borderRadius: 14,
      fontFamily: "var(--font-manrope), sans-serif",
    };

    const darkTokens = {
      colorPrimary: "#c63a45",
      colorInfo: "#c63a45",
      colorSuccess: "#2f9a73",
      colorWarning: "#d39a4a",
      colorError: "#ef4b5d",
      colorText: "#f5ece7",
      colorTextSecondary: "#c7b1ab",
      colorBgBase: "#0f0b0c",
      colorBgLayout: "#0f0b0c",
      colorBgContainer: "#1a1316",
      colorBorder: "#3a2a2f",
      colorBorderSecondary: "#2a1f22",
      borderRadius: 14,
      fontFamily: "var(--font-manrope), sans-serif",
    };

    return {
      algorithm,
      token: isDark ? darkTokens : lightTokens,
      components: {
        Layout: {
          bodyBg: "transparent",
          headerBg: "transparent",
          siderBg: "transparent",
        },
      },
    };
  }, [resolvedTheme]);

  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}
