import {
  PrismaClient,
  UserRole,
  RiderStatus,
  VehicleType,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const YAOUNDE_NEIGHBORHOODS = [
  { name: "Bastos", lat: 3.8694, lng: 11.5163 },
  { name: "Nlongkak", lat: 3.8544, lng: 11.5018 },
  { name: "Omnisports", lat: 3.862, lng: 11.508 },
  { name: "Mvog-Ada", lat: 3.8415, lng: 11.5235 },
  { name: "Mfoundi", lat: 3.8571, lng: 11.5198 },
  { name: "Biyem-Assi", lat: 3.8298, lng: 11.5137 },
  { name: "Mbankolo", lat: 3.88, lng: 11.5 },
  { name: "Nkolbisson", lat: 3.845, lng: 11.535 },
  { name: "Ekounou", lat: 3.865, lng: 11.53 },
  { name: "Melen", lat: 3.84, lng: 11.545 },
];

async function main() {
  console.log("🌱 Seeding database...");

  const customerPassword = await bcrypt.hash("Customer@123", 10);
  const riderPassword = await bcrypt.hash("Rider@123", 10);

  // Create admin
  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  await prisma.user.upsert({
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
  console.log("✅ Admin ready");

  // Create customers
  const customerNames = [
    "Jean-Pierre Mbarga",
    "Marie Claire Nguimgou",
    "Paul Etoundi",
    "Suzanne Mboma",
    "Christian Balla",
    "Florence Kiki",
    "Daniel Ndongo",
    "Claudine Mvong",
    "Michel Oyono",
    "Annie Belinga",
    "Joseph Kamga",
    "Thérèse Medjo",
    "Pierre Ngah",
    "Jeannette Ada",
    "Alain Mba",
  ];
  for (let i = 0; i < customerNames.length; i++) {
    await prisma.user.upsert({
      where: { email: `customer${i + 1}@test.cm` },
      update: {},
      create: {
        email: `customer${i + 1}@test.cm`,
        name: customerNames[i],
        phone: `237677${String(i + 1).padStart(6, "0")}`,
        passwordHash: customerPassword,
        role: UserRole.CUSTOMER,
        isActive: true,
        savedAddresses: {
          create: {
            label: i === 0 ? "Maison" : i === 1 ? "Bureau" : "Maison",
            street: `${i + 1} Rue des ${YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].name}`,
            neighborhood:
              YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].name,
            city: "Yaoundé",
            lat: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lat,
            lng: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lng,
            isDefault: i === 0,
          },
        },
      },
    });
  }
  console.log(`✅ ${customerNames.length} customers ready`);

  // Create riders
  const riderNames = [
    { name: "Emmanuel Tchoumba", phone: "237690987654", plate: "LT 4521 A" },
    { name: "Alain Nguimbi", phone: "237691234567", plate: "LT 8923 E" },
    { name: "Bruno Mfoulou", phone: "237692345678", plate: "LT 1234 B" },
    { name: "Cyril Nguetchouang", phone: "237693456789", plate: "LT 5678 C" },
    { name: "Didier Belinga", phone: "237694567890", plate: "LT 9012 D" },
    { name: "Eric Meka", phone: "237695678901", plate: "LT 3456 F" },
    { name: "Fabrice Nnang", phone: "237696789012", plate: "LT 7890 G" },
    { name: "Gilles Oyono", phone: "237697890123", plate: "LT 2345 H" },
  ];
  for (let i = 0; i < riderNames.length; i++) {
    await prisma.user.upsert({
      where: { email: `rider${i + 1}@test.cm` },
      update: {},
      create: {
        email: `rider${i + 1}@test.cm`,
        name: riderNames[i].name,
        phone: riderNames[i].phone,
        passwordHash: riderPassword,
        role: UserRole.RIDER,
        isActive: true,
        rider: {
          create: {
            vehicleType: VehicleType.MOTORCYCLE,
            vehiclePlate: riderNames[i].plate,
            licenseNumber: `CMR2026${String(i + 1).padStart(4, "0")}`,
            status: i < 5 ? RiderStatus.AVAILABLE : RiderStatus.BUSY,
            isVerified: true,
            rating: 4 + Math.random(),
            totalDeliveries: Math.floor(Math.random() * 150) + 20,
            currentLat: YAOUNDE_NEIGHBORHOODS[i].lat,
            currentLng: YAOUNDE_NEIGHBORHOODS[i].lng,
            lastLocationAt: new Date(),
          },
        },
      },
    });
  }
  console.log(`✅ ${riderNames.length} riders ready`);

  // Get customers and riders
  const customers = await prisma.user.findMany({
    where: { role: UserRole.CUSTOMER },
  });

  console.log(`✅ ${customers.length} customers ready`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test credentials:");
  console.log("  Admin: admin@tara-delivery.cm / Admin@123456");
  console.log("  Customer: customer1@test.cm / Customer@123");
  console.log("  Rider: rider1@test.cm / Rider@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
