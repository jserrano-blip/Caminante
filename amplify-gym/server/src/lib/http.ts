import { NextFunction, Request, RequestHandler, Response } from 'express';

/** Error de aplicación con status HTTP. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message);
}

export function notFound(message = 'Recurso no encontrado'): HttpError {
  return new HttpError(404, message);
}

/** Envuelve handlers async para propagar errores al middleware de Express. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/** Lee un query param obligatorio como string. */
export function requireQuery(req: Request, name: string): string {
  const value = req.query[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw badRequest(`Falta el parámetro de consulta "${name}"`);
  }
  return value;
}
