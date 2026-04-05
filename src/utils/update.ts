/*
 * @Author: 桂佳囿
 * @Date: 2025-12-12 22:52:09
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-02-09 15:53:24
 * @Description: 定时轮询检查更新
 */

/**
 * @description: 获取构建信息
 * @return {Promise<{buildId: string; timestamp: number;}>}
 */
const fetchBuildInfo = async (): Promise<{
  buildId: string;
  buildMsg: string;
  timestamp: number;
}> => {
  const response = await fetch(
    import.meta.env.VITE_PUBLIC_BASE.replace(/\/$/, "") + "/manifest.json",
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// 上一次的构建ID
let lastBuildId: string | null = null;

/**
 * @description: 定时获取更新
 * @param {number} delay
 * @param {(confirmResult: boolean) => void} cb
 * @return {() => void}
 */
const fetchUpdate = (
  delay: number,
  cb: (confirmResult: boolean) => void,
): (() => void) => {
  const timer = setInterval(async () => {
    try {
      const { buildId, buildMsg } = await fetchBuildInfo();
      if (!lastBuildId) lastBuildId = buildId;
      if (buildId !== lastBuildId) {
        const confirmResult = confirm(
          `new version ${buildId} is "${buildMsg}" , do you want to reload?`,
        );
        if (confirmResult) lastBuildId = buildId;
        cb(confirmResult);
      }
    } catch (error) {
      console.error("Error fetching build info:", error);
    }
  }, delay);
  return () => clearInterval(timer);
};

/**
 * @description: 启动更新检查
 * @param {number} delay 轮询间隔，默认1分钟
 * @param {number} restartDelay 用户取消后的重试间隔，默认10分钟
 * @return {*}
 */
export const start = (
  delay: number = 60 * 1000,
  restartDelay: number = 10 * 60 * 1000,
): void => {
  let stop: (() => void) | null = null;
  const polling = () => {
    stop = fetchUpdate(delay, (confirmResult) => {
      if (confirmResult) {
        window.location.reload();
      } else {
        if (stop) stop();
        setTimeout(polling, restartDelay);
      }
    });
  };
  polling();
};
