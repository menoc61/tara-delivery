import { Response } from "express";
import { ApiResponse, PaginationMeta } from "@tara/types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void => {
  const response: ApiResponse<T> = { success: true, data, message };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = "Created"): void => {
  sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message = "Success"
): void => {
  const response: ApiResponse<{ items: T[]; meta: PaginationMeta }> = {
    success: true,
    data: { items, meta },
    message,
    meta,
  };
  res.status(200).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): void => {
  const response: ApiResponse = { success: false, message, error };
  res.status(statusCode).json(response);
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
