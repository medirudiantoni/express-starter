import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

export default async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    console.log(' ========================= Session: =========================', session); // Debugging line to check session value

    if(!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = session.user; // Attach user info to the request object
    req.session = session.session;

    next();
}