/*
 * @Author: 桂佳囿
 * @Date: 2026-01-25 22:22:38
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-01-25 23:12:41
 * @Description: 加载动画
 */
import { Spin } from "antd";
import style from "./index.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

export const FullSpin = () => {
  return (
    <div className={cx("fullSpin")}>
      <Spin size="large" />
    </div>
  );
};
