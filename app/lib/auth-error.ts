export class AuthRequiredError extends Error {
  constructor() {
    super("Please log in first.");
    this.name = "AuthRequiredError";
  }
}

export function responseStatus(error: unknown, fallbackStatus: number) {
  return error instanceof AuthRequiredError ? 401 : fallbackStatus;
}

