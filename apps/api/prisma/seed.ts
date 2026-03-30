import {
  PrismaClient,
  UserRole,
  RiderStatus,
  VehicleType,
  NotificationType,
  NotificationPriority,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
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

const ORDER_TYPES = [
  OrderType.PARCEL,
  OrderType.FOOD,
  OrderType.GROCERY,
  OrderType.COURIER,
];

function generateOrderNumber(): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `TD${yy}${mm}${dd}${random}`;
}

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
    { name: "Moussa Diallo", phone: "237690987654", plate: "LT 4521 A" },
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
            rating: 4.8 + Math.random() * 0.2,
            totalDeliveries: Math.floor(Math.random() * 1300) + 50,
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
  const riders = await prisma.user.findMany({
    where: { role: UserRole.RIDER },
    include: { rider: true },
  });

  // Create sample orders
  const pickupLocations = [
    { street: "Le Gourmet Palace", neighborhood: "Bastos" },
    { street: "Supermarché DOVV", neighborhood: "Omnisports" },
    { street: "Pharmacie du Soleil", neighborhood: "Mvan" },
    { street: "Restaurant La Gaieté", neighborhood: "Nlongkak" },
    { street: "Boutique Orange", neighborhood: "Mfoundi" },
    { street: "Bar-restaurant Le Cedre", neighborhood: "Biyem-Assi" },
    { street: "Station Shell", neighborhood: "Ekounou" },
    { street: "Epicerie Bon Plan", neighborhood: "Melen" },
  ];

  const deliveryLocations = [
    { street: "Rue des Lilas", neighborhood: "Nkolbisson" },
    { street: "Quartier Elobi", neighborhood: "Mbankolo" },
    { street: "Cite Verte", neighborhood: "Nlongkak" },
    { street: "Carrefour Odza", neighborhood: "Ekounou" },
    { street: "Avenue Kennedy", neighborhood: "Mfoundi" },
    { street: "Rue des Manguiers", neighborhood: "Bastos" },
    { street: "Bloc D", neighborhood: "Mvog-Ada" },
    { street: "Carrefour Berger", neighborhood: "Mvan" },
  ];

  // Create delivered orders for the first rider
  const rider1 = riders[0];
  if (rider1?.rider) {
    for (let i = 0; i < 20; i++) {
      const pickup = pickupLocations[i % pickupLocations.length];
      const delivery = deliveryLocations[i % deliveryLocations.length];
      const customer = customers[i % customers.length];
      const type = ORDER_TYPES[i % ORDER_TYPES.length];
      const deliveryFee =
        type === OrderType.COURIER
          ? 3500
          : type === OrderType.FOOD
            ? 1500
            : 2000;

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: customer.id,
          riderId: rider1.rider.id,
          type,
          status: OrderStatus.DELIVERED,
          pickupStreet: pickup.street,
          pickupNeighborhood: pickup.neighborhood,
          pickupCity: "Yaoundé",
          pickupLat:
            YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lat +
            (Math.random() - 0.5) * 0.01,
          pickupLng:
            YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lng +
            (Math.random() - 0.5) * 0.01,
          deliveryStreet: delivery.street,
          deliveryNeighborhood: delivery.neighborhood,
          deliveryCity: "Yaoundé",
          deliveryLat:
            YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lat +
            (Math.random() - 0.5) * 0.01,
          deliveryLng:
            YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lng +
            (Math.random() - 0.5) * 0.01,
          deliveryFee,
          totalAmount: deliveryFee,
          createdAt,
          updatedAt: createdAt,
          deliveredAt: new Date(createdAt.getTime() + 3600000),
        },
      });
    }
    console.log("✅ 20 delivered orders created for rider 1");
  }

  // Create some pending/active orders
  for (let i = 0; i < 5; i++) {
    const pickup = pickupLocations[i % pickupLocations.length];
    const delivery = deliveryLocations[i % deliveryLocations.length];
    const customer = customers[i % customers.length];
    const type = ORDER_TYPES[i % ORDER_TYPES.length];
    const deliveryFee =
      type === OrderType.COURIER ? 3500 : type === OrderType.FOOD ? 1500 : 2000;

    await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: customer.id,
        type,
        status: OrderStatus.PENDING,
        pickupStreet: pickup.street,
        pickupNeighborhood: pickup.neighborhood,
        pickupCity: "Yaoundé",
        pickupLat: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lat,
        pickupLng: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lng,
        deliveryStreet: delivery.street,
        deliveryNeighborhood: delivery.neighborhood,
        deliveryCity: "Yaoundé",
        deliveryLat:
          YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lat,
        deliveryLng:
          YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lng,
        deliveryFee,
        totalAmount: deliveryFee,
      },
    });
  }
  console.log("✅ 5 pending orders created");

  // Create payments for orders (skip if already exists)
  const deliveredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      payment: null,
    },
    take: 10,
  });
  for (const order of deliveredOrders) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: PaymentMethod.CASH_ON_DELIVERY,
        status: PaymentStatus.SUCCESS,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
        paidAt: order.deliveredAt,
      },
    });
  }
  console.log(`✅ ${deliveredOrders.length} payments created`);

  // Create comprehensive notifications for all types
  const allUsers = await prisma.user.findMany({ take: 10 });
  const now = new Date();

  const notificationTemplates: Array<{
    type: NotificationType;
    title: string;
    body: string;
    isDeletable: boolean;
    priority: NotificationPriority;
    category: string;
    actionUrl?: string;
    data?: object;
  }> = [
    // Welcome notification
    {
      type: NotificationType.WELCOME,
      title: "Bienvenue sur TARA DELIVERY!",
      body: "Bonjour! Bienvenue sur la plateforme de livraison la plus fiable de Yaoundé. Créez votre première livraison et profitez de nos services.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "system",
      actionUrl: "/customer/new-order",
    },
    // Order notifications
    {
      type: NotificationType.ORDER_CONFIRMED,
      title: "Commande confirmée",
      body: "Votre commande TD2603300001 est confirmée et en cours d'attribution.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "orders",
      actionUrl: "/customer/orders/1",
      data: { orderId: "1" },
    },
    {
      type: NotificationType.ORDER_ASSIGNED,
      title: "Livreur assigné",
      body: "Moussa Diallo a été assigné à votre commande TD2603300001.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "orders",
      actionUrl: "/customer/orders/1",
    },
    {
      type: NotificationType.ORDER_PICKED_UP,
      title: "Colis récupéré",
      body: "Votre colis pour la commande TD2603300001 a été récupéré par le livreur.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "orders",
      actionUrl: "/customer/orders/1",
    },
    {
      type: NotificationType.DELIVERY_IN_PROGRESS,
      title: "Colis en cours de livraison",
      body: "Moussa Diallo est en route vers votre adresse. Arrivée estimée: 15 minutes.",
      isDeletable: true,
      priority: NotificationPriority.HIGH,
      category: "orders",
      actionUrl: "/customer/orders/track",
      data: { orderId: "1", riderName: "Moussa Diallo", eta: "15 min" },
    },
    {
      type: NotificationType.ORDER_DELIVERED,
      title: "Livraison effectuée!",
      body: "Votre commande TD2603300001 a été livrée avec succès. Merci!",
      isDeletable: true,
      priority: NotificationPriority.HIGH,
      category: "orders",
      actionUrl: "/customer/orders",
    },
    {
      type: NotificationType.RATING_REMINDER,
      title: "Évaluez votre livraison",
      body: "Comment s'est passée votre livraison TD2603300001? Votre avis nous aide à améliorer le service.",
      isDeletable: true,
      priority: NotificationPriority.LOW,
      category: "orders",
      actionUrl: "/customer/orders/1?tab=rating",
    },
    // Payment notifications
    {
      type: NotificationType.PAYMENT_SUCCESS,
      title: "Paiement confirmé",
      body: "Paiement de 2 500 XAF reçu pour la commande TD2603300001.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "payments",
      actionUrl: "/customer/orders/1",
    },
    {
      type: NotificationType.PAYMENT_FAILED,
      title: "Échec du paiement",
      body: "Le paiement pour la commande TD2603300001 a échoué. Veuillez réessayer.",
      isDeletable: true,
      priority: NotificationPriority.HIGH,
      category: "payments",
      actionUrl: "/customer/orders/1",
    },
    // Promotion
    {
      type: NotificationType.PROMOTION,
      title: "Promo Week-end -20% sur toutes les livraisons!",
      body: "Profitez de 20% de réduction sur toutes les livraisons ce week-end. Utilisez le code WEEKEND20.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "promotions",
      actionUrl: "/customer/pricing",
      data: { code: "WEEKEND20", discount: 20 },
    },
    // Chat message
    {
      type: NotificationType.CHAT_MESSAGE,
      title: "Nouveau message de Moussa Diallo",
      body: "Bonjour, je suis à 5 minutes de votre adresse. Pouvez-vous sortir?",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "chat",
      actionUrl: "/customer/messages/1",
      data: { conversationId: "1", senderName: "Moussa Diallo" },
    },
    // Admin announcement
    {
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      title: "Nouvelle fonctionnalité: Suivi en temps réel",
      body: "Désormais, vous pouvez suivre votre livreur en temps réel sur la carte! Cette fonctionnalité est disponible pour toutes les livraisons.",
      isDeletable: true,
      priority: NotificationPriority.HIGH,
      category: "admin",
      actionUrl: "/customer/orders/track",
    },
    // Maintenance
    {
      type: NotificationType.MAINTENANCE,
      title: "Maintenance planifiée",
      body: "Une maintenance est prévue le dimanche 31 mars de 02h00 à 05h00. Le service sera temporairement indisponible.",
      isDeletable: false,
      priority: NotificationPriority.HIGH,
      category: "system",
    },
    // System notification
    {
      type: NotificationType.SYSTEM,
      title: "Mise à jour de l'application",
      body: "TARA DELIVERY a été mis à jour avec de nouvelles fonctionnalités et améliorations de performance.",
      isDeletable: true,
      priority: NotificationPriority.NORMAL,
      category: "system",
    },
  ];

  for (const user of allUsers) {
    for (let i = 0; i < notificationTemplates.length; i++) {
      const template = notificationTemplates[i];
      const createdAt = new Date(now.getTime() - (i + 1) * 3600000); // Stagger by hours

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: template.type,
          title: template.title,
          body: template.body,
          isRead: Math.random() > 0.6,
          isDeletable: template.isDeletable,
          priority: template.priority,
          category: template.category,
          actionUrl: template.actionUrl,
          data: template.data || undefined,
          createdAt,
        },
      });
    }
  }
  console.log(
    `✅ ${notificationTemplates.length * allUsers.length} notifications created (${notificationTemplates.length} types x ${allUsers.length} users)`,
  );

  // Create ratings
  const completedOrders = await prisma.order.findMany({
    where: { status: OrderStatus.DELIVERED },
    take: 10,
    include: { rider: true },
  });
  for (const order of completedOrders) {
    if (order.riderId) {
      await prisma.rating.create({
        data: {
          orderId: order.id,
          riderId: order.riderId,
          userId: order.userId,
          score: Math.floor(Math.random() * 2) + 4,
          comment: [
            "Excellent service",
            "Rapide et efficace",
            "Très professionnel",
            "Recommandé",
          ][Math.floor(Math.random() * 4)],
        },
      });
    }
  }
  console.log("✅ Ratings created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test credentials:");
  console.log("  Admin: admin@tara-delivery.cm / Admin@123456");
  console.log("  Customer: customer1@test.cm / Customer@123");
  console.log("  Rider: rider1@test.cm / Rider@123 (Name: Moussa Diallo)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
