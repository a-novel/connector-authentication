export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export const isForbiddenError = (err: any) => err instanceof ForbiddenError;

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const isUnauthorizedError = (err: any) => err instanceof UnauthorizedError;

export class InternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalError";
  }
}

export const isInternalError = (err: any) => err instanceof InternalError;

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export const isUserNotFoundError = (err: any) => err instanceof UserNotFoundError;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const isValidationError = (err: any) => err instanceof ValidationError;

export class EmailTakenError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = "EmailTakenError";
  }
}

export const isEmailTakenError = (err: any) => err instanceof EmailTakenError;

export const newErrorResponseMessage = async (message: string, response: Response): Promise<string> => {
  if (response.body == null) {
    return `${message}: unexpected status code ${response.status}`;
  }

  const responseBody = await response.text().catch((e) => `read response: ${e}`);
  return `${message}: [${response.status}] ${responseBody}`;
};
