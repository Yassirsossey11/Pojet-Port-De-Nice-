# 🚢 Port de Nice - Gestion des Mouvements de Bateaux

Application web professionnelle de gestion des arrivées et départs de bateaux au Port de Nice, construite avec Next.js 14, TypeScript, Prisma et PostgreSQL.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

## ✨ Fonctionnalités

### 🎯 Tableau de Bord
- **Statistiques en temps réel** : Nombre de bateaux à quai, partis, total de mouvements
- **Dernières activités** : Dernières arrivées et départs
- **Vue d'ensemble** : État actuel du port en un coup d'œil

### ⚓ Gestion des Mouvements
- **Enregistrement d'arrivée** avec autocomplete intelligent
  - Scan/collage rapide du numéro de série
  - Pré-remplissage automatique si le bateau existe
  - Alertes si le bateau est déjà à quai
- **Enregistrement de départ** en un clic
  - Confirmation visuelle du bateau
  - Validation que le bateau est bien à quai
- **Attribution de postes d'amarrage** (berth)

### 🔍 Recherche et Filtres
- **Recherche rapide** par numéro de série, nom, pavillon, type
- **Autocomplete** lors de la saisie
- **Filtres multiples** pour le journal des mouvements

### 📊 Journal des Mouvements
- **Historique complet** de tous les mouvements
- **Pagination** pour performances optimales
- **Export CSV** avec dates en UTC et locales
- **Filtres avancés** : date, poste, source, type

### 🕐 Gestion du Fuseau Horaire
- **Stockage UTC** dans PostgreSQL
- **Affichage Europe/Paris** (CET/CEST)
- **Conversions automatiques** pour toutes les dates

### 🎨 Interface Moderne
- **Design responsive** avec Tailwind CSS
- **Composants shadcn/ui** accessibles
- **Raccourcis clavier** : `Alt+A` (Arrivée), `Alt+D` (Départ)
- **Toasts** pour feedback utilisateur
- **Loading states** et animations

### 🔒 Sécurité et Qualité
- **Rate limiting** : 60 requêtes/minute par IP
- **Validation Zod** de toutes les entrées
- **Logs structurés** avec Pino
- **Audit trail** de toutes les actions
- **Gestion d'erreurs** complète (400, 404, 409, 422, 429, 500)

## 🛠 Stack Technique

### Frontend
- **Next.js 14** (App Router) - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI accessibles
- **Lucide React** - Icônes
- **date-fns** & **date-fns-tz** - Gestion des dates

### Backend
- **Next.js API Routes** - API RESTful
- **Prisma ORM** - Gestion de la base de données
- **PostgreSQL** - Base de données relationnelle
- **Zod** - Validation de schémas
- **Pino** - Logs structurés

### Déploiement
- **Vercel** - Hébergement frontend/backend
- **Neon/PlanetScale** - PostgreSQL serverless

## 📋 Installation

Voir le guide détaillé : [SETUP.md](./SETUP.md)

### Installation rapide

```bash
# Cloner et installer
git clone <repo-url>
cd port-nice-gestion-bateaux
npm install

# Configurer la base de données
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/port_nice"' > .env

# Initialiser tout (génération + migration + seed)
npm run db:setup

# Lancer l'application
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
.
├── app/
│   ├── api/                      # API Routes Next.js
│   │   ├── arrivals/             # POST - Enregistrer arrivée
│   │   ├── departures/           # POST - Enregistrer départ
│   │   ├── boats/
│   │   │   ├── current/          # GET - Bateaux à quai
│   │   │   ├── search/           # GET - Recherche/autocomplete
│   │   │   └── [serialNumber]/  # GET - Détails d'un bateau
│   │   ├── movements/            # GET - Journal avec filtres
│   │   │   └── export/           # GET - Export CSV
│   │   └── stats/                # GET - Statistiques
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Page principale
├── components/
│   ├── ui/                       # Composants shadcn/ui
│   ├── arrival-form.tsx          # Formulaire arrivée
│   ├── departure-form.tsx        # Formulaire départ
│   ├── current-boats-list.tsx    # Liste bateaux à quai
│   └── stats-dashboard.tsx       # Dashboard statistiques
├── lib/
│   ├── prisma.ts                 # Client Prisma
│   ├── logger.ts                 # Configuration Pino
│   ├── date-utils.ts             # Utilitaires dates/timezone
│   ├── validations.ts            # Schémas Zod
│   ├── rate-limit.ts             # Rate limiting
│   ├── audit.ts                  # Audit logs
│   └── utils.ts                  # Utilitaires
├── prisma/
│   ├── schema.prisma             # Schéma de la base
│   └── seed.ts                   # Script de seeding
├── package.json
├── README.md
└── SETUP.md
```

## 🗄 Schéma de Base de Données

### Modèle Bateau (Master Data)
```prisma
model Bateau {
  id            String     @id @default(cuid())
  numeroSerie   String     @unique  // FR-YACHT-001
  nomBateau     String                // La Méditerranée
  pavillon      String?               // France
  typeBateau    String?               // Yacht
  capacite      Int?                  // 50
  longueur      Float?                // 45.5 m
  remarques     String?
  mouvements    Movement[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

### Modèle Movement (Tracking des mouvements)
```prisma
model Movement {
  id            String          @id @default(cuid())
  bateauId      String
  bateau        Bateau          @relation(...)
  type          TypeMouvement   // ARRIVEE | DEPART
  arrivalAt     DateTime?
  departureAt   DateTime?
  berth         String?         // A12, B5, etc.
  source        SourceMouvement // MANUAL | API | SCAN | IMPORT
  notes         String?
  isActive      Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

### Modèle AuditLog
```prisma
model AuditLog {
  id            String    @id @default(cuid())
  action        String    // CREATE, UPDATE, DELETE, ARRIVAL, DEPARTURE
  entity        String    // Bateau, Movement
  entityId      String
  changes       Json?
  userId        String?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())
}
```

## 🔌 API Endpoints

### Mouvements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/arrivals` | Enregistrer une arrivée |
| `POST` | `/api/departures` | Enregistrer un départ |

**Exemple - Enregistrer une arrivée :**

```bash
curl -X POST http://localhost:3000/api/arrivals \
  -H "Content-Type: application/json" \
  -d '{
    "numeroSerie": "FR-12345-A",
    "nomBateau": "La Méditerranée",
    "pavillon": "France",
    "typeBateau": "Yacht",
    "capacite": 50,
    "longueur": 45.5,
    "berth": "A12",
    "notes": "VIP à bord",
    "source": "MANUAL"
  }'
```

**Exemple - Enregistrer un départ :**

```bash
curl -X POST http://localhost:3000/api/departures \
  -H "Content-Type: application/json" \
  -d '{
    "numeroSerie": "FR-12345-A",
    "notes": "Départ prévu"
  }'
```

### Bateaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/boats/current` | Bateaux actuellement à quai |
| `GET` | `/api/boats/search?q=...` | Rechercher (autocomplete) |
| `GET` | `/api/boats/[serialNumber]` | Détails d'un bateau |

### Journal & Export

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/movements?page=1&limit=20` | Journal paginé |
| `GET` | `/api/movements?dateFrom=...&dateTo=...` | Filtrer par date |
| `GET` | `/api/movements/export` | Export CSV |

### Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/stats` | Statistiques globales |

## 🧪 Validation et Gestion d'Erreurs

### Codes d'erreur HTTP

| Code | Signification |
|------|---------------|
| `400` | Données invalides (validation Zod échouée) |
| `404` | Ressource non trouvée (bateau non trouvé, pas de mouvement actif) |
| `409` | Conflit (bateau déjà à quai) |
| `422` | Validation métier échouée (departureAt < arrivalAt) |
| `429` | Rate limit dépassé (60 req/min) |
| `500` | Erreur serveur interne |

### Validation Zod

```typescript
// Numéro de série: [A-Z0-9-]+, unique
numeroSerie: z.string().regex(/^[A-Z0-9-]+$/)

// Dates: departureAt >= arrivalAt
// Capacité: nombre entier positif < 10000
// etc.
```

## 🚀 Scripts npm

```bash
# Développement
npm run dev              # Lancer dev server
npm run lint             # Linter le code

# Production
npm run build            # Build production
npm start                # Lancer production

# Base de données
npm run prisma:generate  # Générer client Prisma
npm run prisma:migrate   # Créer/appliquer migration
npm run prisma:studio    # Ouvrir Prisma Studio
npm run prisma:seed      # Peupler avec données test
npm run db:reset         # ⚠️ Réinitialiser complètement
npm run db:setup         # Setup complet (generate + migrate + seed)
```

## 🌍 Gestion du Fuseau Horaire

L'application gère le fuseau horaire **Europe/Paris (CET/CEST)** :

```typescript
// Stockage en UTC dans PostgreSQL
arrivalAt: DateTime

// Conversion automatique à l'affichage
formatParisDate(date, 'dd/MM/yyyy HH:mm')

// Utilitaires disponibles
nowInParis()              // Date actuelle à Paris
formatShortDate(date)     // Format court
formatTime(date)          // Heure seule
calculateDuration(start, end)  // Durée de séjour
```

## 🔒 Sécurité

### Rate Limiting
- **60 requêtes/minute par IP**
- Headers de réponse: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Pour production: utiliser Upstash Ratelimit

### Validation
- **Validation Zod** sur toutes les entrées
- **Sanitization** automatique
- **Protection SQL injection** via Prisma

### Audit Trail
- Toutes les actions sont loggées dans `AuditLog`
- IP, User-Agent, userId (si auth) enregistrés
- Logs structurés avec Pino

## 📊 Données de Test (Seed)

Le seed crée :
- **7 bateaux** de différents types (yacht, ferry, cargo, voilier)
- **9 mouvements** avec dates variées
- **4 bateaux à quai** actuellement
- **3 bateaux partis** avec historique complet

## 🚀 Déploiement

### Vercel + Neon (Recommandé)

1. **Créer une base Neon** : [neon.tech](https://neon.tech)
2. **Déployer sur Vercel** :
   ```bash
   vercel
   ```
3. **Configurer les variables d'environnement** dans Vercel
4. **Appliquer les migrations** :
   ```bash
   npm run prisma:migrate:deploy
   ```

Voir [SETUP.md](./SETUP.md) pour plus de détails.

## 📚 Documentation

- [Guide d'installation](./SETUP.md) - Installation et configuration détaillée
- [API Documentation](./API.md) - Documentation complète de l'API (à créer)
- [Prisma Studio](http://localhost:5555) - Interface de la base de données

## 🤝 Contribution

Les contributions sont bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

- [ ] NextAuth pour authentification admin
- [ ] Gestion des utilisateurs et rôles
- [ ] Notifications temps réel (WebSocket)
- [ ] Export PDF des rapports
- [ ] Graphiques et analytics avancés
- [ ] API publique avec clés d'API
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

Voir [SETUP.md](./SETUP.md#-troubleshooting)

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Support

Pour toute question :
- Ouvrir une [issue GitHub](https://github.com/...)
- Consulter la [documentation](./SETUP.md)

---

**Développé avec ❤️ pour le Port de Nice** ⚓⛵🚢
#   P o j e t - P o r t - D e - N i c e -  
 