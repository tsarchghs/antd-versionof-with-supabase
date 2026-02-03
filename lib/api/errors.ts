export class HttpError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export function ensureEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new HttpError(500, `${name} is required`);
  }
  return value;
}
