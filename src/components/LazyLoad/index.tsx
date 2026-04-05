/*
 * @Author: 桂佳囿
 * @Date: 2025-07-12 14:48:33
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-01-25 22:24:05
 * @Description: 懒加载组件
 */
import { lazy, Suspense, type JSX } from "react";
import { FullSpin } from "@/components/fullSpin";

export const lazyLoad = (
  loader: () => Promise<{ default: React.ComponentType }>,
): JSX.Element => {
  const Component = lazy(loader);
  return (
    <Suspense fallback={<FullSpin />}>
      <Component />
    </Suspense>
  );
};
