# 🛠️ TARA DELIVERY — Guide d'installation complet

> Ce guide couvre tout: du premier `git clone` jusqu'au déploiement en production sur votre VPS Hostinger, **y compris la configuration exacte de MTN MoMo et Orange Money** pour le marché camerounais.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Installation locale (développement)](#2-installation-locale)
3. [Configuration des variables d'environnement](#3-variables-denvironnement)
4. [MTN MoMo — Configuration étape par étape](#4-mtn-momo)
5. [Orange Money — Configuration étape par étape](#5-orange-money)
6. [Firebase — Realtime DB + Notifications](#6-firebase)
7. [Google OAuth](#7-google-oauth)
8. [Base de données Prisma](#8-prisma--base-de-données)
9. [Déploiement Docker en production](#9-déploiement-docker)
10. [Déploiement VPS Hostinger](#10-vps-hostinger)
11. [GitHub Actions CI/CD](#11-github-actions-cicd)
12. [SSL / HTTPS avec Let's Encrypt](#12-ssl--lets-encrypt)
13. [Dépannage](#13-dépannage)

---

## 1. Prérequis

### Logiciels requis (machine locale)

| Outil       | Version min. | Installation                          |
|-------------|-------------|---------------------------------------|
| **Node.js** | 20.x LTS    | https://nodejs.org                    |
| **pnpm**    | 9.x         | `npm install -g pnpm@9`               |
| **Docker**  | 24.x        | https://docs.docker.com/get-docker/   |
| **Docker Compose** | v2.x | inclus avec Docker Desktop           |
| **Git**     | 2.x         | https://git-scm.com                   |

### Comptes et accès requis

- [ ] Compte **MTN MoMo Developer** → https://momodeveloper.mtn.com
- [ ] Compte **Orange Developer** → https://developer.orange.com
- [ ] Projet **Firebase** → https://console.firebase.google.com
- [ ] Projet **Google Cloud** (pour OAuth) → https://console.cloud.google.com
- [ ] VPS **Hostinger** (Ubuntu 22.04 LTS) → https://hostinger.cm
- [ ] Nom de domaine (ex: tara-delivery.cm)

---

## 2. Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery

# 2. Installer toutes les dépendances (workspace)
pnpm install

# 3. Copier et remplir les variables d'environnement
cp .env.example .env
# → Ouvrir .env et remplir les valeurs (voir section 3)

# 4. Lancer avec Docker (PostgreSQL + API + Web + Nginx)
docker compose up -d

# 5. Initialiser la base de données
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npx prisma db seed

# 6. Vérifier que tout fonctionne
curl http://localhost/health
# Réponse attendue: {"status":"ok","database":"connected"}
```

### URLs de développement

| Service       | URL                          |
|---------------|------------------------------|
| Web (Next.js) | http://localhost              |
| API           | http://localhost/api          |
| API direct    | http://localhost:4000         |
| Prisma Studio | http://localhost:5555 (après `npx prisma studio`) |

### Comptes de test (après seed)

| Rôle     | Email                   | Mot de passe   |
|----------|-------------------------|----------------|
| Admin    | admin@tara-delivery.cm  | Admin@123456   |
| Client   | customer@test.cm        | Customer@123   |
| Livreur  | rider@test.cm           | Rider@123      |

---

## 3. Variables d'environnement

Voici **chaque variable** expliquée avec sa valeur exacte à utiliser:

```bash
# ── Base de données ────────────────────────────────────────
DATABASE_URL="postgresql://tara_user:VOTRE_MOT_DE_PASSE@localhost:5432/tara_delivery_db"
# En production avec Docker: remplacer localhost par "postgres"
# Format: postgresql://USER:PASS@HOST:PORT/DB_NAME

# ── Serveur API ────────────────────────────────────────────
NODE_ENV=development          # → "production" en prod
PORT=4000
CORS_ORIGIN=http://localhost:3000   # → https://tara-delivery.cm en prod

# ── JWT ────────────────────────────────────────────────────
# IMPORTANT: Générer avec: openssl rand -hex 32
JWT_SECRET=GENERER_UNE_VALEUR_ALEATOIRE_MINIMUM_32_CHARS
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=GENERER_UNE_AUTRE_VALEUR_ALEATOIRE
REFRESH_TOKEN_EXPIRES_IN=30d

# ── Docker (pour docker-compose) ───────────────────────────
POSTGRES_PASSWORD=votre_mot_de_passe_postgres
```

---

## 4. MTN MoMo

### 4.1 Créer votre compte développeur

1. Aller sur **https://momodeveloper.mtn.com**
2. Cliquer **"Sign Up"** → Créer un compte avec votre email professionnel
3. Confirmer votre email et se connecter

### 4.2 S'abonner au produit "Collections"

> ⚠️ **Critique**: Pour recevoir des paiements, vous devez vous abonner à **"Collections"** (et NON à "Disbursements" qui est pour envoyer de l'argent, ni à "Remittance").

1. Dans le tableau de bord, cliquer sur **"Products"** dans le menu
2. Trouver le produit **"Collections"**
3. Cliquer **"Subscribe"**
4. Sélectionner le plan **"Sandbox"** pour les tests → **"Production"** pour le live
5. Après validation, vous recevrez votre **`Ocp-Apim-Subscription-Key`** (aussi appelé `Primary Key`)

```bash
# Exemple de clé générée:
MOMO_SUBSCRIPTION_KEY=a1b2c3d4e5f6789012345678901234ab
```

### 4.3 Créer un API User (Sandbox)

L'API MoMo sandbox nécessite un "API User" créé manuellement:

```bash
# Étape 1: Créer l'API User (remplacer YOUR_SUBSCRIPTION_KEY)
# X-Reference-Id doit être un UUID v4
curl -X POST "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser" \
  -H "X-Reference-Id: $(uuidgen)" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{"providerCallbackHost": "https://votre-domaine.cm"}'

# → Notez l'UUID utilisé comme X-Reference-Id → c'est votre MOMO_API_USER

# Étape 2: Créer la clé de cet utilisateur
curl -X POST "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/VOTRE_UUID/apikey" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY"

# → La réponse contient "apiKey" → c'est votre MOMO_API_KEY
```

> En **production**, les credentials API User sont fournis par MTN lors de l'onboarding business.

### 4.4 Variables d'environnement MoMo

```bash
# ── MTN MoMo ──────────────────────────────────────────────
MOMO_SUBSCRIPTION_KEY=votre_primary_key_collections    # De l'étape 4.2
MOMO_API_USER=uuid_de_votre_api_user                   # De l'étape 4.3 étape 1
MOMO_API_KEY=api_key_de_votre_api_user                 # De l'étape 4.3 étape 2

# Sandbox (tests)
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_ENVIRONMENT=sandbox

# Production (live)
# MOMO_BASE_URL=https://proxy.momoapi.mtn.com
# MOMO_ENVIRONMENT=production

# URL de votre serveur pour recevoir les webhooks
MOMO_CALLBACK_HOST=https://tara-delivery.cm
# En sandbox, laisser vide si pas de webhook (on utilise le polling)
```

### 4.5 Comment fonctionne le flux MoMo dans TARA

```
Client choisit "MTN MoMo" → Saisit son numéro (67XXXXXXX)
        ↓
API POST /v1_0/requesttopay
  - amount: "2500" (XAF, entier sans décimale)
  - payer.partyId: "237670000000" (format international sans +)
        ↓
MTN envoie notification USSD au téléphone du client
Client confirme avec son code PIN MoMo
        ↓
Soit: MTN appelle notre webhook POST /api/webhooks/momo
Soit: Frontend poll GET /api/payments/order/:id/poll toutes les 5s
        ↓
Commande confirmée automatiquement
```

### 4.6 Numéros de test (sandbox)

| Numéro          | Résultat    |
|-----------------|-------------|
| 46733123450     | SUCCESSFUL  |
| 46733123451     | FAILED      |
| N'importe quel  | PENDING (timeout après 60s) |

---

## 5. Orange Money

### 5.1 Créer votre compte développeur

1. Aller sur **https://developer.orange.com**
2. **"Sign up"** → Créer un compte
3. Confirmer l'email → Se connecter
4. Aller sur **"My apps"** → **"Add an app"**
5. Donner un nom à votre app (ex: "TARA DELIVERY")

### 5.2 S'abonner à l'API Orange Money CM Web Pay

> ⚠️ **Critique**: L'API s'appelle exactement **"Orange Money Cameroon WebPay"** (et non "Orange Money Africa" ni "Orange Money Côte d'Ivoire").

1. Dans votre app, cliquer **"Subscribe to APIs"**
2. Chercher **"Orange Money"** → Sélectionner **"Orange Money Cameroon (CM)"**
3. Cliquer sur **"WebPay"** → **"Subscribe"**
4. Après validation, noter:
   - **Client ID** → `ORANGE_CLIENT_ID`
   - **Client Secret** → `ORANGE_CLIENT_SECRET`

### 5.3 Obtenir la Merchant Key

La `merchant_key` est spécifique à Orange Money et s'obtient lors de l'onboarding commercial:

1. Contacter Orange Money Cameroun Business: **+237 6XX XXX XXX** ou **om-business@orange.cm**
2. Soumettre les documents requis (registre de commerce, CNI dirigeant, RIB)
3. Orange vous fournit votre `merchant_key` de production

> En **sandbox**, utiliser la valeur `test_merchant_key` fournie dans la documentation de votre app.

### 5.4 Variables d'environnement Orange Money

```bash
# ── Orange Money ───────────────────────────────────────────
ORANGE_CLIENT_ID=votre_client_id               # De l'app dans le portail
ORANGE_CLIENT_SECRET=votre_client_secret       # De l'app dans le portail
ORANGE_MERCHANT_KEY=votre_merchant_key         # Fourni par Orange Business
ORANGE_BASE_URL=https://api.orange.com

# URLs de callback (doivent être accessibles depuis Internet)
ORANGE_RETURN_URL=https://tara-delivery.cm/payment/success
ORANGE_CANCEL_URL=https://tara-delivery.cm/payment/cancel
ORANGE_NOTIF_URL=https://tara-delivery.cm/api/webhooks/orange

# Token optionnel pour valider les webhooks Orange
ORANGE_NOTIF_TOKEN=votre_token_secret_optionnel
```

### 5.5 Flux Orange Money dans TARA

```
Client choisit "Orange Money"
        ↓
API appelle Orange Money WebPay → Reçoit payment_url
        ↓
Frontend redirige le client vers payment_url (page Orange Money hébergée)
Client saisit son numéro Orange et confirme
        ↓
Orange redirige vers ORANGE_RETURN_URL avec statut
ET appelle ORANGE_NOTIF_URL (webhook) avec les détails
        ↓
Commande confirmée automatiquement
```

---

## 6. Firebase

### 6.1 Créer le projet Firebase

1. Aller sur **https://console.firebase.google.com**
2. **"Créer un projet"** → Nom: "tara-delivery"
3. Désactiver Google Analytics si non nécessaire → **"Créer le projet"**

### 6.2 Activer Realtime Database

1. Dans le menu gauche → **"Realtime Database"**
2. **"Créer une base de données"**
3. Choisir région: **"Belgium (europe-west1)"** (la plus proche de l'Afrique centrale)
4. Mode de démarrage: **"Mode verrouillé"** (on configurera les règles)
5. Copier l'URL: `https://tara-delivery-XXXXX-default-rtdb.europe-west1.firebasedatabase.app`

### 6.3 Règles de sécurité Realtime Database

Dans l'onglet **"Règles"** de Realtime Database, coller:

```json
{
  "rules": {
    "rider_locations": {
      ".read": "auth != null",
      "$riderId": {
        ".write": "auth != null"
      }
    },
    "order_updates": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 6.4 Créer un compte de service (pour le backend)

1. **Paramètres du projet** (⚙️ en haut à gauche) → **"Comptes de service"**
2. **"Générer une nouvelle clé privée"** → Télécharger le fichier JSON
3. Ouvrir le fichier JSON et extraire les champs:

```bash
# Depuis le fichier JSON téléchargé:
FIREBASE_PROJECT_ID=tara-delivery-XXXXX         # champ "project_id"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-XXXXX@tara-delivery-XXXXX.iam.gserviceaccount.com  # champ "client_email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXX\n-----END PRIVATE KEY-----\n"   # champ "private_key"
FIREBASE_DATABASE_URL=https://tara-delivery-XXXXX-default-rtdb.europe-west1.firebasedatabase.app
```

> ⚠️ **Attention**: La `PRIVATE_KEY` contient des `\n` littéraux. Dans le fichier `.env`, garder les `\n` tels quels (entre guillemets). Dans la config Docker, ils seront interprétés correctement.

### 6.5 Activer Cloud Messaging (pour les push notifications)

1. **Paramètres du projet** → **"Cloud Messaging"**
2. Activer **"Firebase Cloud Messaging API (V1)"**
3. Pour le frontend web, récupérer les clés dans **"Paramètres"** → **"Général"** → scroll jusqu'à "Vos applications" → Ajouter une app Web

```bash
# Clés pour le frontend (NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tara-delivery-XXXXX.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tara-delivery-XXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tara-delivery-XXXXX-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 7. Google OAuth

### 7.1 Créer les credentials OAuth

1. Aller sur **https://console.cloud.google.com**
2. Créer ou sélectionner le projet "tara-delivery"
3. Aller dans **"APIs & Services"** → **"Credentials"**
4. **"+ Créer des identifiants"** → **"ID client OAuth"**
5. Type d'application: **"Application Web"**
6. Nom: "TARA DELIVERY Web"
7. **URIs de redirection autorisés**, ajouter:
   - `http://localhost:4000/api/auth/google/callback` (développement)
   - `https://tara-delivery.cm/api/auth/google/callback` (production)
8. Cliquer **"Créer"** → Copier le Client ID et le Client Secret

### 7.2 Configurer l'écran de consentement OAuth

1. **"APIs & Services"** → **"Écran de consentement OAuth"**
2. Type: **"Externe"** (pour les utilisateurs Google)
3. Remplir: Nom de l'application, email d'assistance, logo, domaine autorisé
4. Scopes: ajouter `email` et `profile`
5. Ajouter des testeurs en phase de développement

```bash
# Variables d'environnement Google OAuth
GOOGLE_CLIENT_ID=XXXXX.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXXXX
GOOGLE_CALLBACK_URL=https://tara-delivery.cm/api/auth/google/callback
```

---

## 8. Prisma — Base de données

### 8.1 Commandes essentielles

```bash
# Se placer dans le dossier API
cd apps/api

# Générer le client Prisma (obligatoire après toute modification schema.prisma)
npx prisma generate

# Créer et appliquer une nouvelle migration (développement)
npx prisma migrate dev --name nom_de_votre_migration

# Appliquer les migrations en production (sans créer de nouvelles)
npx prisma migrate deploy

# Réinitialiser la DB (DANGER: efface toutes les données)
npx prisma migrate reset

# Insérer les données de test
npx prisma db seed

# Interface visuelle (navigateur)
npx prisma studio
```

### 8.2 Workflow de migration en production

```bash
# NE JAMAIS faire "migrate dev" en production
# Toujours utiliser:
npx prisma migrate deploy

# Ce que fait le conteneur API au démarrage (via docker/entrypoint.sh):
# 1. Attend que PostgreSQL soit prêt
# 2. Exécute automatiquement "prisma migrate deploy"
# 3. Lance l'API: "node dist/index.js"
```

### 8.3 Backup de la base de données

```bash
# Depuis le VPS, faire un backup
docker compose exec postgres pg_dump -U tara_user tara_delivery_db > backup_$(date +%Y%m%d).sql

# Restaurer
docker compose exec -i postgres psql -U tara_user tara_delivery_db < backup_20260101.sql
```

---

## 9. Déploiement Docker

### 9.1 Variables requises dans .env pour Docker

```bash
# Ces variables supplémentaires sont utilisées par docker-compose
POSTGRES_PASSWORD=mot_de_passe_tres_securise_production
NEXT_PUBLIC_API_URL=https://tara-delivery.cm/api
```

### 9.2 Lancer en production

```bash
# Build et lancement de tous les services
docker compose up -d --build

# Voir les logs
docker compose logs -f api

# Redémarrer un seul service
docker compose restart api

# Mettre à jour l'API sans interruption
docker compose pull api && docker compose up -d --no-deps api

# Voir l'état des conteneurs
docker compose ps
```

### 9.3 Problèmes Prisma fréquents en Docker

**Problème**: `Error: @prisma/client did not initialize yet`

```bash
# Solution: Regénérer le client dans le conteneur
docker compose exec api npx prisma generate
docker compose restart api
```

**Problème**: `Migration failed`

```bash
# Vérifier les logs
docker compose logs api

# Accéder au conteneur pour déboguer
docker compose exec api sh
cd /app && npx prisma migrate status
```

---

## 10. VPS Hostinger

### 10.1 Configuration initiale du serveur

```bash
# Se connecter en SSH
ssh root@VOTRE_IP_VPS

# Mettre à jour le système
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Installer Docker Compose v2
apt install -y docker-compose-plugin

# Vérifier l'installation
docker --version && docker compose version
```

### 10.2 Déployer TARA DELIVERY

```bash
# Créer le dossier de déploiement
mkdir -p /opt/tara-delivery
cd /opt/tara-delivery

# Cloner le projet
git clone https://github.com/menoc61/tara-delivary.git .

# Configurer l'environnement
cp .env.example .env
nano .env   # → Remplir toutes les valeurs de production

# Générer les certificats SSL (voir section 12)
./docker/generate-dev-certs.sh   # pour les tests, avant d'avoir un vrai SSL

# Lancer
docker compose up -d

# Vérifier
docker compose ps
curl https://tara-delivery.cm/health
```

### 10.3 Configurer le DNS chez Hostinger

Dans le panel Hostinger → **Domaines** → **DNS Zone**:

| Type | Nom | Valeur          | TTL  |
|------|-----|-----------------|------|
| A    | @   | VOTRE_IP_VPS    | 300  |
| A    | www | VOTRE_IP_VPS    | 300  |
| A    | api | VOTRE_IP_VPS    | 300  |

---

## 11. GitHub Actions CI/CD

### 11.1 Secrets GitHub requis

Aller dans votre repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Nom du secret                    | Description                        | Exemple                  |
|----------------------------------|------------------------------------|--------------------------|
| `VPS_HOST`                       | IP de votre VPS                    | `185.XXX.XXX.XXX`        |
| `VPS_USER`                       | Utilisateur SSH                    | `root` ou `ubuntu`       |
| `VPS_SSH_KEY`                    | Clé SSH privée complète            | `-----BEGIN OPENSSH...`  |
| `VPS_PORT`                       | Port SSH (défaut: 22)              | `22`                     |
| `NEXT_PUBLIC_API_URL`            | URL API publique                   | `https://tara-delivery.cm/api` |
| `NEXT_PUBLIC_FIREBASE_API_KEY`   | Clé API Firebase                   | `AIzaSy...`              |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine Auth Firebase            | `tara-delivery.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`| Project ID Firebase                | `tara-delivery-xxxxx`    |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | URL Realtime DB                 | `https://tara-delivery-xxxxx.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID FCM          | `123456789012`           |
| `NEXT_PUBLIC_FIREBASE_APP_ID`    | App ID Firebase                    | `1:xxx:web:xxx`          |

### 11.2 Créer la clé SSH pour le déploiement

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "tara-deploy" -f ~/.ssh/tara_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/tara_deploy.pub root@VOTRE_IP_VPS

# Copier la clé privée dans GitHub Secrets
cat ~/.ssh/tara_deploy
# → Coller dans le secret VPS_SSH_KEY (tout le contenu, de -----BEGIN à -----END)
```

### 11.3 Déclencher un déploiement manuellement

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
# → GitHub Actions se déclenche automatiquement
# → Surveiller dans: GitHub → Actions → votre workflow
```

### 11.4 Environnements GitHub (Gestion des approbations)

1. GitHub → Settings → Environments → **"production"**
2. Activer **"Required reviewers"** → Ajouter votre compte
3. Le déploiement en production nécessitera votre approbation manuelle

---

## 12. SSL / HTTPS avec Let's Encrypt

```bash
# Sur le VPS, installer Certbot
apt install -y certbot

# IMPORTANT: Arrêter Nginx pour libérer le port 80
docker compose stop nginx

# Générer le certificat
certbot certonly --standalone \
  -d tara-delivery.cm \
  -d www.tara-delivery.cm \
  --email votre@email.com \
  --agree-tos \
  --non-interactive

# Copier les certificats dans le dossier Docker
mkdir -p /opt/tara-delivery/docker/certs
cp /etc/letsencrypt/live/tara-delivery.cm/fullchain.pem /opt/tara-delivery/docker/certs/
cp /etc/letsencrypt/live/tara-delivery.cm/privkey.pem   /opt/tara-delivery/docker/certs/

# Redémarrer Nginx
docker compose start nginx

# Renouvellement automatique (Let's Encrypt expire tous les 90 jours)
# Ajouter au crontab (crontab -e):
# 0 3 * * 1 docker compose -f /opt/tara-delivery/docker-compose.yml stop nginx && certbot renew --quiet && cp /etc/letsencrypt/live/tara-delivery.cm/*.pem /opt/tara-delivery/docker/certs/ && docker compose -f /opt/tara-delivery/docker-compose.yml start nginx
```

---

## 13. Dépannage

### L'API ne démarre pas

```bash
# Voir les erreurs
docker compose logs api --tail=50

# Causes fréquentes:
# 1. DATABASE_URL incorrecte
# 2. Prisma non généré → docker compose exec api npx prisma generate
# 3. Port 4000 déjà utilisé → lsof -i :4000
```

### Erreur de migration Prisma

```bash
# Vérifier le statut des migrations
docker compose exec api npx prisma migrate status

# Si "drift detected" (DB différente du schema):
docker compose exec api npx prisma migrate resolve --applied "nom_de_migration"
```

### MoMo "401 Unauthorized"

- Vérifier que `MOMO_SUBSCRIPTION_KEY` correspond au produit **Collections** (pas Disbursements)
- Vérifier que l'API User a bien été créé avec le bon `MOMO_SUBSCRIPTION_KEY`
- En sandbox, les tokens expirent après 1h → Le service les renouvelle automatiquement

### Orange Money "Invalid merchant_key"

- La `merchant_key` sandbox doit être récupérée dans votre app sur developer.orange.com
- Ne pas confondre avec le `Client ID`
- En production, contacter Orange Money Business Cameroun directement

### Nginx 502 Bad Gateway

```bash
# Vérifier que l'API est bien démarrée
docker compose ps
docker compose logs api --tail=20

# Vérifier la connectivité entre conteneurs
docker compose exec nginx wget -qO- http://api:4000/health
```

### Build Docker échoue

```bash
# Nettoyer le cache Docker
docker builder prune -f

# Rebuild sans cache
docker compose build --no-cache api

# Vérifier la mémoire disponible (min 2GB recommandé pour le build)
free -h
```

---

## Support

- 📧 Email: gillemomeni@gmail.com
- 📱 WhatsApp: +7 9011805350  
- 🐛 Issues: https://github.com/menoc61/tara-delivery/issues

---

*Guide rédigé par Gilles Momeni — TARA DELIVERY © 2026*
