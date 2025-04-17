export type CommonResponse<T> =
  | {
      status: "success"
      data: T
    }
  | {
      status: "error"
      data: T
      error: string
    }

export const ApiResponse = {
  success: <T>(data: T): CommonResponse<T> => ({ status: "success", data }),
  error: <T>(error: string, data: T = undefined as T): CommonResponse<T> => ({
    status: "error",
    data,
    error,
  }),
}
