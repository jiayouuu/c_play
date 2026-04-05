/*
 * @Author: 桂佳囿
 * @Date: 2025-11-14 23:42:58
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-05 11:32:31
 * @Description: 响应数据类型定义
 */

// 响应数据结构
export interface ResponseData<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页数据结构
export interface PaginatedData<T = any> {
  endRow: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  list: T[];
  navigateFirstPage: number;
  navigateLastPage: number;
  navigatepageNums: number[];
  navigatePages: number;
  nextPage: number;
  pageNum: number;
  pages: number;
  pageSize: number;
  prePage: number;
  size: number;
  startRow: number;
  total: number;
}
