declare namespace Express {
  export interface Request {
    circuitBreaker: Map<string, boolean>;
  }
}
