import { PrismaClient, UserRole, RiderStatus, VehicleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin User ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tara-delivery.cm" },
    update: {},
    create: {
      email: "admin@tara-delivery.cm",
      name: "TARA Admin",
      phone: "237650000000",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      admin: { create: { permissions: ["ALL"] } },
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ── Test Customer ──────────────────────────────────────
  const customerPassword = await bcrypt.hash("Customer@123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@test.cm" },
    update: {},
    create: {
      email: "customer@test.cm",
      name: "Jean-Pierre Mbarga",
      phone: "237677123456",
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });
  console.log(`✅ Customer created: ${customer.email}`);

  // ── Test Rider ────────────────────────────────────────
  const riderPassword = await bcrypt.hash("Rider@123", 10);
  const riderUser = await prisma.user.upsert({
    where: { email: "rider@test.cm" },
    update: {},
    create: {
      email: "rider@test.cm",
      name: "Emmanuel Tchoumba",
      phone: "237690987654",
      passwordHash: riderPassword,
      role: UserRole.RIDER,
      isActive: true,
      rider: {
        create: {
          vehicleType: VehicleType.MOTORCYCLE,
          vehiclePlate: "LT 4521 A",
          licenseNumber: "CMR2026001",
          status: RiderStatus.AVAILABLE,
          isVerified: true,
          rating: 4.8,
          totalDeliveries: 124,
          currentLat: 3.848,
          currentLng: 11.502,
        },
      },
    },
  });
  console.log(`✅ Rider created: ${riderUser.email}`);

  // ── Saved Addresses for customer ─────────────────────
  await prisma.savedAddress.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: customer.id,
      label: "Maison",
      street: "Rue des palmiers, Bastos",
      neighborhood: "Bastos",
      city: "Yaoundé",
      lat: 3.8694,
      lng: 11.5163,
      isDefault: true,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Test credentials:");
  console.log("  Admin: admin@tara-delivery.cm / Admin@123456");
  console.log("  Customer: customer@test.cm / Customer@123");
  console.log("  Rider: rider@test.cm / Rider@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
