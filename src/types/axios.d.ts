/*
 * @Author: 桂佳囿
 * @Date: 2025-12-19 17:10:10
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-24 10:44:40
 * @Description: Axios 类型扩展
 */

import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** 是否为公共 API，无需鉴权 */
    public?: boolean;
    /** 手动指定取消请求的 key */
    cancelKey?: string;
    /** 实际生成的 request key */
    __requestKey?: string;
  }
}
