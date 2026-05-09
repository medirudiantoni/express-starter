import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import prisma from '../utils/prisma';

async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Flatten jadi array ["User:manage", "Role:read", ...]
  const permissions = userRoles.flatMap((ur) =>
    ur.role.rolePermissions.map(
      (rp) => `${rp.permission.model}:${rp.permission.action}`
    )
  );

  // Deduplicate kalau user punya multiple roles
  return [...new Set(permissions)];
}

export default async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if(!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = await getUserPermissions(session.user.id);

    req.user = session.user; // Attach user info to the request object
    req.session = session.session;
    req.permissions = userPermissions; // Attach permissions to the request object

    next();
}

export function requirePermission(model: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.permissions ?? [];

    const allowed =
      permissions.includes(`${model}:manage`) ||
      permissions.includes(`${model}:${action}`);

    if (!allowed) {
      res.status(403).json({
        message: `Forbidden: requires ${model}:${action} or ${model}:manage`,
      });
      return;
    }

    next();
  };
}
