// src/utils/response.util.ts
export class ResponseUtil {
  static success(message: string, code: string, data?: any) {
    return {
      message,
      code,
      data,
    };
  }

  static error(message: string, statusCode: number) {
    const errorCode = `FXQL-${statusCode}`;
    return {
      message,
      code: errorCode,
    };
  }
}
