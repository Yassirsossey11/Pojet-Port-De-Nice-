# 🚀 Guide de Configuration et Démarrage

## Installation rapide

### 1. Prérequis

- Node.js 18+ et npm/yarn/pnpm
- PostgreSQL 14+ (local ou cloud)

### 2. Installation

```bash
# Cloner le projet
git clone <repo-url>
cd port-nice-gestion-bateaux

# Installer les dépendances
npm install
```

### 3. Configuration de la base de données

Créer un fichier `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/port_nice?schema=public"
```

#### Option A: PostgreSQL local

```bash
# Créer la base de données
createdb port_nice

# Ou avec psql
psql -U postgres
CREATE DATABASE port_nice;
```

#### Option B: PostgreSQL cloud (Neon - Recommandé)

1. Aller sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier l'URL de connexion dans `.env`

```env
DATABASE_URL="postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/port_nice?sslmode=require"
```

### 4. Initialiser la base de données

```bash
# Tout en une commande (génération + migration + seed)
npm run db:setup
```

Ou étape par étape :

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# Peupler avec des données de test
npm run prisma:seed
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🎯 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer en mode développement |
| `npm run build` | Construire pour la production |
| `npm start` | Lancer en mode production |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Créer/appliquer une migration |
| `npm run prisma:studio` | Ouvrir l'interface Prisma Studio |
| `npm run prisma:seed` | Peupler la base avec des données |
| `npm run db:reset` | Réinitialiser la base (⚠️ SUPPRIME TOUT) |
| `npm run db:setup` | Setup complet (generate + migrate + seed) |

## 📊 Données de test

Le seed crée automatiquement :

- **7 bateaux** avec différentes caractéristiques
- **9 mouvements** (arrivées/départs)
- **4 bateaux à quai** actuellement
- **3 bateaux partis** avec historique

## 🔧 Troubleshooting

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
# Mac:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows:
# Démarrer via le gestionnaire de services
```

### Réinitialiser complètement la base

```bash
npm run db:reset
npm run db:setup
```

### Voir les données dans la base

```bash
npm run prisma:studio
# Ouvre une interface web sur http://localhost:5555
```

## 🚀 Déploiement

### Vercel + Neon (Recommandé)

1. **Créer une base Neon**
   - Aller sur [neon.tech](https://neon.tech)
   - Créer un projet
   - Copier l'URL de connexion

2. **Déployer sur Vercel**
   ```bash
   vercel
   ```

3. **Configurer les variables d'environnement dans Vercel**
   - `DATABASE_URL`: URL de connexion Neon

4. **Appliquer les migrations**
   ```bash
   npm run prisma:migrate:deploy
   ```

## 📝 Variables d'environnement

```env
# Base de données (requis)
DATABASE_URL="postgresql://..."

# Logs (optionnel)
LOG_LEVEL="info"  # debug, info, warn, error

# Pour NextAuth (si implémenté)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

## ✅ Vérification de l'installation

Après l'installation, vous devriez pouvoir :

1. ✅ Accéder à l'application sur http://localhost:3000
2. ✅ Voir des statistiques sur le tableau de bord
3. ✅ Voir la liste des bateaux à quai
4. ✅ Enregistrer une nouvelle arrivée
5. ✅ Enregistrer un départ
6. ✅ Rechercher un bateau par son numéro

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs dans le terminal
2. Ouvrir Prisma Studio pour inspecter la base
3. Vérifier que PostgreSQL est bien démarré
4. Consulter les issues GitHub

---

**Prêt à naviguer ! ⛵**

