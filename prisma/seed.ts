// prisma/seed.ts
import "dotenv/config";
import { randomUUID } from "crypto";
import { hashPassword } from "@better-auth/utils/password";
import prisma from "../src/utils/prisma";

const MODELS = [
  "User", "Role", "Permission", "RolePermission",
  "UserRole", "Session", "Account", "Verification",
];
const ACTIONS = ["manage", "create", "read", "update", "delete"];

const USER_ROLE_PERMISSIONS: { model: string; action: string }[] = [
  { model: "User",    action: "read"   },
  { model: "User",    action: "update" },
  { model: "Session", action: "read"   },
  { model: "Session", action: "delete" },
  { model: "Account", action: "read"   },
  { model: "Account", action: "update" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. Buat semua permissions ───────────────────────────────────────────
  console.log("\n📋 Creating permissions...");
  const permissions: { id: string; model: string; action: string }[] = [];

  for (const model of MODELS) {
    for (const action of ACTIONS) {
      // Pakai upsert by unique [model, action] — bukan by id lagi
      const permission = await prisma.permission.upsert({
        where: { modelAction: { model, action } },
        update: {},
        create: {
          model,
          action,
          description:
            action === "manage"
              ? `Full access to ${model} (create, read, update, delete)`
              : `Can ${action} ${model}`,
        },
      });
      permissions.push(permission);
      console.log(`  ✅ ${model}:${action}`);
    }
  }

  // ─── 2. Buat roles ───────────────────────────────────────────────────────
  console.log("\n👑 Creating roles...");

  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: {},
    create: { id: randomUUID(), name: "superadmin" },
  });
  console.log("  ✅ superadmin");

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { id: randomUUID(), name: "user" },
  });
  console.log("  ✅ user");

  // ─── 3. Assign SEMUA permissions ke superadmin ───────────────────────────
  console.log("\n🔗 Assigning all permissions to superadmin...");
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        rolePermission: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superadminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`  ✅ ${permissions.length} permissions assigned to superadmin`);

  // ─── 4. Assign permissions terbatas ke role user ─────────────────────────
  console.log("\n🔗 Assigning limited permissions to user role...");
  for (const { model, action } of USER_ROLE_PERMISSIONS) {
    const permission = permissions.find(
      (p) => p.model === model && p.action === action
    );
    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        rolePermission: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
    console.log(`  ✅ ${model}:${action}`);
  }

  // ─── 5. Buat superadmin user ─────────────────────────────────────────────
  console.log("\n👤 Creating superadmin user...");
  const superadminUser = await prisma.user.upsert({
    where: { email: "superadmin@system.com" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Super Admin",
      email: "superadmin@system.com",
      emailVerified: true,
    },
  });

  await prisma.account.upsert({
    where: { id: `${superadminUser.id}-credential` },
    update: {},
    create: {
      id: `${superadminUser.id}-credential`,
      accountId: superadminUser.id,
      providerId: "credential",
      userId: superadminUser.id,
      password: await hashPassword("qwerty123"),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userRole: {
        userId: superadminUser.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: {
      userId: superadminUser.id,
      roleId: superadminRole.id,
    },
  });
  console.log("  ✅ superadmin@system.com → role: superadmin");

  // ─── 6. Buat regular user ────────────────────────────────────────────────
  console.log("\n👤 Creating regular user...");
  const regularUser = await prisma.user.upsert({
    where: { email: "user@system.com" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Regular User",
      email: "user@system.com",
      emailVerified: true,
    },
  });

  await prisma.account.upsert({
    where: { id: `${regularUser.id}-credential` },
    update: {},
    create: {
      id: `${regularUser.id}-credential`,
      accountId: regularUser.id,
      providerId: "credential",
      userId: regularUser.id,
      password: await hashPassword("qwerty123"),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userRole: {
        userId: regularUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: userRole.id,
    },
  });
  console.log("  ✅ user@system.com → role: user");

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log("\n✨ Seeding completed!");
  console.log("─────────────────────────────────────────────────────");
  console.log("👑 SUPERADMIN");
  console.log("   📧 Email    : superadmin@system.com");
  console.log("   🔑 Password : qwerty123");
  console.log(`   📋 Perms    : ${permissions.length} (semua, termasuk manage)`);
  console.log("");
  console.log("👤 USER");
  console.log("   📧 Email    : user@system.com");
  console.log("   🔑 Password : qwerty123");
  console.log(`   📋 Perms    : ${USER_ROLE_PERMISSIONS.length} (read & update profil sendiri)`);
  console.log("─────────────────────────────────────────────────────");
  console.log("");
  console.log("💡 Logika 'manage':");
  console.log("   Cek permission 'manage' ATAU action spesifik di middleware:");
  console.log("   hasPermission('User', 'create') → cek User:manage || User:create");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());