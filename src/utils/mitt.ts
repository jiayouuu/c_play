/*
 * @Author: 桂佳囿
 * @Date: 2025-08-05 19:49:51
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-22 09:43:18
 * @Description: 事件总线封装
 */
import mitt from "mitt";
import type { Events } from "@/types/events";

export const emitter = mitt<Events>();
