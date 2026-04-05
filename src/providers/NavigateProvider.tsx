/*
 * @Author: 桂佳囿
 * @Date: 2025-12-25 17:24:59
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-25 17:46:13
 * @Description: 给 react-router-dom 的 navigate 方法设置桥接
 */
import { setNavigator } from "@/bridges/navigateBridge";
import { useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";

export const NavigateProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return <>{children}</>;
};
