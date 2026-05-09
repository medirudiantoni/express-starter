// types/express.d.ts
import { Session, User } from "better-auth";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      permissions?: string[]; // Optional: Array of permission strings (e.g., "User:read", "Session:delete")
      session?: Session;
    }
  }
}