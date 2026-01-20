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

  const algorithm = useMemo(() => {
    if (resolvedTheme === "dark") {
      return antdTheme.darkAlgorithm;
    }
    return antdTheme.defaultAlgorithm;
  }, [resolvedTheme]);

  return <ConfigProvider theme={{ algorithm }}>{children}</ConfigProvider>;
}
