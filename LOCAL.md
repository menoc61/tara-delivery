# Guide de lancement local - TARA DELIVERY

Ce guide explique comment lancer le projet TARA DELIVERY en local pour le développement.

---

## Prérequis

| Outil   | Version  | Installation            |
| ------- | -------- | ----------------------- |
| Node.js | 20.x LTS | https://nodejs.org      |
| pnpm    | 9.x      | `npm install -g pnpm@9` |
| Git     | 2.x      | https://git-scm.com     |

---

## Étape 1: Cloner le projet

```bash
git clone https://github.com/menoc61/tara-delivary.git
cd tara-delivery
```

---

## Étape 2: Installer les dépendances

```bash
pnpm install
```

---

## Étape 3: Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Modifier le fichier `.env` à la racine avec vos valeurs. Le fichier contient déjà les valeurs par défaut pour le développement local avec Supabase.

---

## Étape 4: Lancer la base de données (Option A: Docker - Recommandé)

```bash
# Démarrer PostgreSQL et Redis avec Docker
docker compose up -d postgres redis
```

---

## Étape 4: Lancer la base de données (Option B: Supabase local)

```bash
# Installer Supabase CLI
npm install -g supabase

# Démarrer Supabase local
supabase start
```

---

## Étape 5: Initialiser Prisma

```bash
# Générer le client Prisma
cd apps/api
pnpm db:generate

# Créer les tables (développement)
pnpm db:migrate

# (Optionnel) Insérer les données de test
pnpm db:seed
```

---

## Étape 6: Lancer les applications

### Lancer tous les services (API + Web)

```bash
pnpm dev
```

### Lancer uniquement l'API

```bash
pnpm dev --filter=@tara/api
```

### Lancer uniquement le frontend Web

```bash
pnpm dev --filter=@tara/web
```

---

## URLs locales

| Service            | URL                          |
| ------------------ | ---------------------------- |
| Frontend (Next.js) | http://localhost:3000        |
| API (Express)      | http://localhost:4000        |
| Health Check API   | http://localhost:4000/health |
| Prisma Studio      | http://localhost:5555        |

---

## Comptes de test (après seed)

| Rôle    | Email                  | Mot de passe |
| ------- | ---------------------- | ------------ |
| Admin   | admin@tara-delivery.cm | Admin@123456 |
| Client  | customer@test.cm       | Customer@123 |
| Livreur | rider@test.cm          | Rider@123    |

---

## Commandes utiles

```bash
# Vérifier le type TypeScript
pnpm type-check

# Lancer les linters
pnpm lint

# Formater le code
pnpm format

# Lancer les tests
pnpm test

# Arrêter tous les services
docker compose down
```

---

## Dépannage

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est bien démarré:

```bash
docker compose ps
```

### Erreur de migration Prisma

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
```

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :4000  # pour l'API
lsof -i :3000  # pour le frontend
```

---

## Prochaines étapes

Une fois le projet lancé en local:

1. Ouvrir http://localhost:3000
2. Se connecter avec un compte de test
3. Créer une commande pour tester le flux complet
