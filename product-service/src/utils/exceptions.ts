class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResourceNotFound extends DomainError {
  constructor (message) {
    super(message);
  }
}

export class InternalServerError extends DomainError {
  constructor (message) {
    super(message);
  }
}