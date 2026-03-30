"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var prisma = new client_1.PrismaClient();
var YAOUNDE_NEIGHBORHOODS = [
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
var ORDER_TYPES = [
    client_1.OrderType.PARCEL,
    client_1.OrderType.FOOD,
    client_1.OrderType.GROCERY,
    client_1.OrderType.COURIER,
];
function generateOrderNumber() {
    var date = new Date();
    var yy = String(date.getFullYear()).slice(-2);
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var dd = String(date.getDate()).padStart(2, "0");
    var random = Math.floor(Math.random() * 9000) + 1000;
    return "TD".concat(yy).concat(mm).concat(dd).concat(random);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var customerPassword, riderPassword, adminPassword, customerNames, i, riderNames, i, customers, riders, pickupLocations, deliveryLocations, rider1, i, pickup, delivery, customer, type, deliveryFee, createdAt, i, pickup, delivery, customer, type, deliveryFee, deliveredOrders, _i, deliveredOrders_1, order, allUsers, now, notificationTemplates, _a, allUsers_1, user, i, template, createdAt, completedOrders, _b, completedOrders_1, order;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("🌱 Seeding database...");
                    return [4 /*yield*/, bcryptjs_1.default.hash("Customer@123", 10)];
                case 1:
                    customerPassword = _c.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Rider@123", 10)];
                case 2:
                    riderPassword = _c.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Admin@123456", 10)];
                case 3:
                    adminPassword = _c.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "admin@tara-delivery.cm" },
                            update: {},
                            create: {
                                email: "admin@tara-delivery.cm",
                                name: "TARA Admin",
                                phone: "237650000000",
                                passwordHash: adminPassword,
                                role: client_1.UserRole.ADMIN,
                                isActive: true,
                                admin: { create: { permissions: ["ALL"] } },
                            },
                        })];
                case 4:
                    _c.sent();
                    console.log("✅ Admin ready");
                    customerNames = [
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
                    i = 0;
                    _c.label = 5;
                case 5:
                    if (!(i < customerNames.length)) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "customer".concat(i + 1, "@test.cm") },
                            update: {},
                            create: {
                                email: "customer".concat(i + 1, "@test.cm"),
                                name: customerNames[i],
                                phone: "237677".concat(String(i + 1).padStart(6, "0")),
                                passwordHash: customerPassword,
                                role: client_1.UserRole.CUSTOMER,
                                isActive: true,
                                savedAddresses: {
                                    create: {
                                        label: i === 0 ? "Maison" : i === 1 ? "Bureau" : "Maison",
                                        street: "".concat(i + 1, " Rue des ").concat(YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].name),
                                        neighborhood: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].name,
                                        city: "Yaoundé",
                                        lat: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lat,
                                        lng: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lng,
                                        isDefault: i === 0,
                                    },
                                },
                            },
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("\u2705 ".concat(customerNames.length, " customers ready"));
                    riderNames = [
                        { name: "Moussa Diallo", phone: "237690987654", plate: "LT 4521 A" },
                        { name: "Alain Nguimbi", phone: "237691234567", plate: "LT 8923 E" },
                        { name: "Bruno Mfoulou", phone: "237692345678", plate: "LT 1234 B" },
                        { name: "Cyril Nguetchouang", phone: "237693456789", plate: "LT 5678 C" },
                        { name: "Didier Belinga", phone: "237694567890", plate: "LT 9012 D" },
                        { name: "Eric Meka", phone: "237695678901", plate: "LT 3456 F" },
                        { name: "Fabrice Nnang", phone: "237696789012", plate: "LT 7890 G" },
                        { name: "Gilles Oyono", phone: "237697890123", plate: "LT 2345 H" },
                    ];
                    i = 0;
                    _c.label = 9;
                case 9:
                    if (!(i < riderNames.length)) return [3 /*break*/, 12];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "rider".concat(i + 1, "@test.cm") },
                            update: {},
                            create: {
                                email: "rider".concat(i + 1, "@test.cm"),
                                name: riderNames[i].name,
                                phone: riderNames[i].phone,
                                passwordHash: riderPassword,
                                role: client_1.UserRole.RIDER,
                                isActive: true,
                                rider: {
                                    create: {
                                        vehicleType: client_1.VehicleType.MOTORCYCLE,
                                        vehiclePlate: riderNames[i].plate,
                                        licenseNumber: "CMR2026".concat(String(i + 1).padStart(4, "0")),
                                        status: i < 5 ? client_1.RiderStatus.AVAILABLE : client_1.RiderStatus.BUSY,
                                        isVerified: true,
                                        rating: 4.8 + Math.random() * 0.2,
                                        totalDeliveries: Math.floor(Math.random() * 1300) + 50,
                                        currentLat: YAOUNDE_NEIGHBORHOODS[i].lat,
                                        currentLng: YAOUNDE_NEIGHBORHOODS[i].lng,
                                        lastLocationAt: new Date(),
                                    },
                                },
                            },
                        })];
                case 10:
                    _c.sent();
                    _c.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log("\u2705 ".concat(riderNames.length, " riders ready"));
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { role: client_1.UserRole.CUSTOMER },
                        })];
                case 13:
                    customers = _c.sent();
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { role: client_1.UserRole.RIDER },
                            include: { rider: true },
                        })];
                case 14:
                    riders = _c.sent();
                    pickupLocations = [
                        { street: "Le Gourmet Palace", neighborhood: "Bastos" },
                        { street: "Supermarché DOVV", neighborhood: "Omnisports" },
                        { street: "Pharmacie du Soleil", neighborhood: "Mvan" },
                        { street: "Restaurant La Gaieté", neighborhood: "Nlongkak" },
                        { street: "Boutique Orange", neighborhood: "Mfoundi" },
                        { street: "Bar-restaurant Le Cedre", neighborhood: "Biyem-Assi" },
                        { street: "Station Shell", neighborhood: "Ekounou" },
                        { street: "Epicerie Bon Plan", neighborhood: "Melen" },
                    ];
                    deliveryLocations = [
                        { street: "Rue des Lilas", neighborhood: "Nkolbisson" },
                        { street: "Quartier Elobi", neighborhood: "Mbankolo" },
                        { street: "Cite Verte", neighborhood: "Nlongkak" },
                        { street: "Carrefour Odza", neighborhood: "Ekounou" },
                        { street: "Avenue Kennedy", neighborhood: "Mfoundi" },
                        { street: "Rue des Manguiers", neighborhood: "Bastos" },
                        { street: "Bloc D", neighborhood: "Mvog-Ada" },
                        { street: "Carrefour Berger", neighborhood: "Mvan" },
                    ];
                    rider1 = riders[0];
                    if (!(rider1 === null || rider1 === void 0 ? void 0 : rider1.rider)) return [3 /*break*/, 19];
                    i = 0;
                    _c.label = 15;
                case 15:
                    if (!(i < 20)) return [3 /*break*/, 18];
                    pickup = pickupLocations[i % pickupLocations.length];
                    delivery = deliveryLocations[i % deliveryLocations.length];
                    customer = customers[i % customers.length];
                    type = ORDER_TYPES[i % ORDER_TYPES.length];
                    deliveryFee = type === client_1.OrderType.COURIER
                        ? 3500
                        : type === client_1.OrderType.FOOD
                            ? 1500
                            : 2000;
                    createdAt = new Date();
                    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
                    return [4 /*yield*/, prisma.order.create({
                            data: {
                                orderNumber: generateOrderNumber(),
                                userId: customer.id,
                                riderId: rider1.rider.id,
                                type: type,
                                status: client_1.OrderStatus.DELIVERED,
                                pickupStreet: pickup.street,
                                pickupNeighborhood: pickup.neighborhood,
                                pickupCity: "Yaoundé",
                                pickupLat: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lat +
                                    (Math.random() - 0.5) * 0.01,
                                pickupLng: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lng +
                                    (Math.random() - 0.5) * 0.01,
                                deliveryStreet: delivery.street,
                                deliveryNeighborhood: delivery.neighborhood,
                                deliveryCity: "Yaoundé",
                                deliveryLat: YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lat +
                                    (Math.random() - 0.5) * 0.01,
                                deliveryLng: YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lng +
                                    (Math.random() - 0.5) * 0.01,
                                deliveryFee: deliveryFee,
                                totalAmount: deliveryFee,
                                createdAt: createdAt,
                                updatedAt: createdAt,
                                deliveredAt: new Date(createdAt.getTime() + 3600000),
                            },
                        })];
                case 16:
                    _c.sent();
                    _c.label = 17;
                case 17:
                    i++;
                    return [3 /*break*/, 15];
                case 18:
                    console.log("✅ 20 delivered orders created for rider 1");
                    _c.label = 19;
                case 19:
                    i = 0;
                    _c.label = 20;
                case 20:
                    if (!(i < 5)) return [3 /*break*/, 23];
                    pickup = pickupLocations[i % pickupLocations.length];
                    delivery = deliveryLocations[i % deliveryLocations.length];
                    customer = customers[i % customers.length];
                    type = ORDER_TYPES[i % ORDER_TYPES.length];
                    deliveryFee = type === client_1.OrderType.COURIER ? 3500 : type === client_1.OrderType.FOOD ? 1500 : 2000;
                    return [4 /*yield*/, prisma.order.create({
                            data: {
                                orderNumber: generateOrderNumber(),
                                userId: customer.id,
                                type: type,
                                status: client_1.OrderStatus.PENDING,
                                pickupStreet: pickup.street,
                                pickupNeighborhood: pickup.neighborhood,
                                pickupCity: "Yaoundé",
                                pickupLat: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lat,
                                pickupLng: YAOUNDE_NEIGHBORHOODS[i % YAOUNDE_NEIGHBORHOODS.length].lng,
                                deliveryStreet: delivery.street,
                                deliveryNeighborhood: delivery.neighborhood,
                                deliveryCity: "Yaoundé",
                                deliveryLat: YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lat,
                                deliveryLng: YAOUNDE_NEIGHBORHOODS[(i + 3) % YAOUNDE_NEIGHBORHOODS.length].lng,
                                deliveryFee: deliveryFee,
                                totalAmount: deliveryFee,
                            },
                        })];
                case 21:
                    _c.sent();
                    _c.label = 22;
                case 22:
                    i++;
                    return [3 /*break*/, 20];
                case 23:
                    console.log("✅ 5 pending orders created");
                    return [4 /*yield*/, prisma.order.findMany({
                            where: { status: client_1.OrderStatus.DELIVERED },
                            take: 10,
                        })];
                case 24:
                    deliveredOrders = _c.sent();
                    _i = 0, deliveredOrders_1 = deliveredOrders;
                    _c.label = 25;
                case 25:
                    if (!(_i < deliveredOrders_1.length)) return [3 /*break*/, 28];
                    order = deliveredOrders_1[_i];
                    return [4 /*yield*/, prisma.payment.create({
                            data: {
                                orderId: order.id,
                                amount: order.totalAmount,
                                method: client_1.PaymentMethod.CASH_ON_DELIVERY,
                                status: client_1.PaymentStatus.SUCCESS,
                                transactionId: "TXN".concat(Date.now()).concat(Math.random().toString(36).substr(2, 5)),
                                paidAt: order.deliveredAt,
                            },
                        })];
                case 26:
                    _c.sent();
                    _c.label = 27;
                case 27:
                    _i++;
                    return [3 /*break*/, 25];
                case 28:
                    console.log("✅ Payments created");
                    return [4 /*yield*/, prisma.user.findMany({ take: 10 })];
                case 29:
                    allUsers = _c.sent();
                    now = new Date();
                    notificationTemplates = [
                        // Welcome notification
                        {
                            type: client_1.NotificationType.WELCOME,
                            title: "Bienvenue sur TARA DELIVERY!",
                            body: "Bonjour! Bienvenue sur la plateforme de livraison la plus fiable de Yaoundé. Créez votre première livraison et profitez de nos services.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "system",
                            actionUrl: "/customer/new-order",
                        },
                        // Order notifications
                        {
                            type: client_1.NotificationType.ORDER_CONFIRMED,
                            title: "Commande confirmée",
                            body: "Votre commande TD2603300001 est confirmée et en cours d'attribution.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "orders",
                            actionUrl: "/customer/orders/1",
                            data: { orderId: "1" },
                        },
                        {
                            type: client_1.NotificationType.ORDER_ASSIGNED,
                            title: "Livreur assigné",
                            body: "Moussa Diallo a été assigné à votre commande TD2603300001.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "orders",
                            actionUrl: "/customer/orders/1",
                        },
                        {
                            type: client_1.NotificationType.ORDER_PICKED_UP,
                            title: "Colis récupéré",
                            body: "Votre colis pour la commande TD2603300001 a été récupéré par le livreur.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "orders",
                            actionUrl: "/customer/orders/1",
                        },
                        {
                            type: client_1.NotificationType.DELIVERY_IN_PROGRESS,
                            title: "Colis en cours de livraison",
                            body: "Moussa Diallo est en route vers votre adresse. Arrivée estimée: 15 minutes.",
                            isDeletable: true,
                            priority: "HIGH",
                            category: "orders",
                            actionUrl: "/customer/orders/track",
                            data: { orderId: "1", riderName: "Moussa Diallo", eta: "15 min" },
                        },
                        {
                            type: client_1.NotificationType.ORDER_DELIVERED,
                            title: "Livraison effectuée!",
                            body: "Votre commande TD2603300001 a été livrée avec succès. Merci!",
                            isDeletable: true,
                            priority: "HIGH",
                            category: "orders",
                            actionUrl: "/customer/orders",
                        },
                        {
                            type: client_1.NotificationType.RATING_REMINDER,
                            title: "Évaluez votre livraison",
                            body: "Comment s'est passée votre livraison TD2603300001? Votre avis nous aide à améliorer le service.",
                            isDeletable: true,
                            priority: "LOW",
                            category: "orders",
                            actionUrl: "/customer/orders/1?tab=rating",
                        },
                        // Payment notifications
                        {
                            type: client_1.NotificationType.PAYMENT_SUCCESS,
                            title: "Paiement confirmé",
                            body: "Paiement de 2 500 XAF reçu pour la commande TD2603300001.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "payments",
                            actionUrl: "/customer/orders/1",
                        },
                        {
                            type: client_1.NotificationType.PAYMENT_FAILED,
                            title: "Échec du paiement",
                            body: "Le paiement pour la commande TD2603300001 a échoué. Veuillez réessayer.",
                            isDeletable: true,
                            priority: "HIGH",
                            category: "payments",
                            actionUrl: "/customer/orders/1",
                        },
                        // Promotion
                        {
                            type: client_1.NotificationType.PROMOTION,
                            title: "Promo Week-end -20% sur toutes les livraisons!",
                            body: "Profitez de 20% de réduction sur toutes les livraisons ce week-end. Utilisez le code WEEKEND20.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "promotions",
                            actionUrl: "/customer/pricing",
                            data: { code: "WEEKEND20", discount: 20 },
                        },
                        // Chat message
                        {
                            type: client_1.NotificationType.CHAT_MESSAGE,
                            title: "Nouveau message de Moussa Diallo",
                            body: "Bonjour, je suis à 5 minutes de votre adresse. Pouvez-vous sortir?",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "chat",
                            actionUrl: "/customer/messages/1",
                            data: { conversationId: "1", senderName: "Moussa Diallo" },
                        },
                        // Admin announcement
                        {
                            type: client_1.NotificationType.ADMIN_ANNOUNCEMENT,
                            title: "Nouvelle fonctionnalité: Suivi en temps réel",
                            body: "Désormais, vous pouvez suivre votre livreur en temps réel sur la carte! Cette fonctionnalité est disponible pour toutes les livraisons.",
                            isDeletable: true,
                            priority: "HIGH",
                            category: "admin",
                            actionUrl: "/customer/orders/track",
                        },
                        // Maintenance
                        {
                            type: client_1.NotificationType.MAINTENANCE,
                            title: "Maintenance planifiée",
                            body: "Une maintenance est prévue le dimanche 31 mars de 02h00 à 05h00. Le service sera temporairement indisponible.",
                            isDeletable: false,
                            priority: "HIGH",
                            category: "system",
                        },
                        // System notification
                        {
                            type: client_1.NotificationType.SYSTEM,
                            title: "Mise à jour de l'application",
                            body: "TARA DELIVERY a été mis à jour avec de nouvelles fonctionnalités et améliorations de performance.",
                            isDeletable: true,
                            priority: "NORMAL",
                            category: "system",
                        },
                    ];
                    _a = 0, allUsers_1 = allUsers;
                    _c.label = 30;
                case 30:
                    if (!(_a < allUsers_1.length)) return [3 /*break*/, 35];
                    user = allUsers_1[_a];
                    i = 0;
                    _c.label = 31;
                case 31:
                    if (!(i < notificationTemplates.length)) return [3 /*break*/, 34];
                    template = notificationTemplates[i];
                    createdAt = new Date(now.getTime() - (i + 1) * 3600000);
                    return [4 /*yield*/, prisma.notification.create({
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
                                createdAt: createdAt,
                            },
                        })];
                case 32:
                    _c.sent();
                    _c.label = 33;
                case 33:
                    i++;
                    return [3 /*break*/, 31];
                case 34:
                    _a++;
                    return [3 /*break*/, 30];
                case 35:
                    console.log("\u2705 ".concat(notificationTemplates.length * allUsers.length, " notifications created (").concat(notificationTemplates.length, " types x ").concat(allUsers.length, " users)"));
                    return [4 /*yield*/, prisma.order.findMany({
                            where: { status: client_1.OrderStatus.DELIVERED },
                            take: 10,
                            include: { rider: true },
                        })];
                case 36:
                    completedOrders = _c.sent();
                    _b = 0, completedOrders_1 = completedOrders;
                    _c.label = 37;
                case 37:
                    if (!(_b < completedOrders_1.length)) return [3 /*break*/, 40];
                    order = completedOrders_1[_b];
                    if (!order.riderId) return [3 /*break*/, 39];
                    return [4 /*yield*/, prisma.rating.create({
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
                        })];
                case 38:
                    _c.sent();
                    _c.label = 39;
                case 39:
                    _b++;
                    return [3 /*break*/, 37];
                case 40:
                    console.log("✅ Ratings created");
                    console.log("\n🎉 Database seeded successfully!");
                    console.log("\n📋 Test credentials:");
                    console.log("  Admin: admin@tara-delivery.cm / Admin@123456");
                    console.log("  Customer: customer1@test.cm / Customer@123");
                    console.log("  Rider: rider1@test.cm / Rider@123 (Name: Moussa Diallo)");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
