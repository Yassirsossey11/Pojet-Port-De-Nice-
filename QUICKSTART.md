# ⚡ Démarrage Rapide - Port de Nice

Guide ultra-rapide pour démarrer en 5 minutes.

## 🚀 Installation Express

```bash
# 1. Cloner et installer
git clone <repo-url>
cd port-nice-gestion-bateaux
npm install

# 2. Configurer la base de données
cp .env.example .env
# Éditer .env avec votre URL PostgreSQL

# 3. Initialiser tout
npm run db:setup

# 4. Lancer
npm run dev
```

→ Ouvrir http://localhost:3000

## 📋 Checklist

- [ ] Node.js 18+ installé
- [ ] PostgreSQL installé et démarré
- [ ] Fichier `.env` configuré
- [ ] Base de données créée (`createdb port_nice`)
- [ ] Migrations appliquées (`npm run db:setup`)
- [ ] Application lancée (`npm run dev`)

## 🎯 Premiers Pas

### 1. Voir les statistiques
→ Tableau de bord principal affiche les stats

### 2. Enregistrer une arrivée
- Onglet "Arrivée"
- Numéro de série: `TEST-001`
- Nom: `Mon Premier Bateau`
- Cliquer "Enregistrer l'arrivée"

### 3. Voir le bateau à quai
→ Section "Bateaux à quai" affiche le nouveau bateau

### 4. Enregistrer le départ
- Cliquer "Enregistrer le départ" sur la carte du bateau
- OU onglet "Départ" et saisir `TEST-001`

### 5. Utiliser l'autocomplete
- Dans "Arrivée", taper les 3 premières lettres d'un bateau existant
- Les infos se pré-remplissent automatiquement

## ⌨️ Raccourcis Clavier

- `Alt + A` → Onglet Arrivée
- `Alt + D` → Onglet Départ

## 🗄 Explorer la Base de Données

```bash
npm run prisma:studio
```

→ Ouvre une interface web sur http://localhost:5555

## 🧪 Données de Test

Le seed a créé :
- `FR-YACHT-001` - La Méditerranée (À quai)
- `IT-FERRY-500` - Corsica Express (À quai)
- `MC-LUXURY-777` - Monaco Dream (À quai)
- `UK-SAIL-123` - British Wind (À quai)
- Et 3 autres bateaux partis

Essayez de les rechercher !

## 📡 Tester l'API

```bash
# Obtenir les statistiques
curl http://localhost:3000/api/stats

# Liste des bateaux à quai
curl http://localhost:3000/api/boats/current

# Rechercher un bateau
curl http://localhost:3000/api/boats/search?q=FR-

# Enregistrer une arrivée
curl -X POST http://localhost:3000/api/arrivals \
  -H "Content-Type: application/json" \
  -d '{
    "numeroSerie": "TEST-002",
    "nomBateau": "Test API",
    "source": "API"
  }'
```

## 🐛 Problèmes Courants

### "Cannot connect to database"
```bash
# Vérifier PostgreSQL
pg_isready

# Redémarrer PostgreSQL
# Mac: brew services restart postgresql
# Linux: sudo service postgresql restart
```

### "Table does not exist"
```bash
npm run db:setup
```

### "Port 3000 already in use"
```bash
# Changer le port
PORT=3001 npm run dev
```

### Réinitialiser tout
```bash
npm run db:reset
npm run db:setup
```

## 📚 Documentation Complète

- [README.md](./README.md) - Documentation complète
- [SETUP.md](./SETUP.md) - Guide d'installation détaillé

## 🎉 C'est Parti !

Votre application est prête à gérer les mouvements du Port de Nice ! ⚓

---

**Besoin d'aide ?** Voir [README.md](./README.md) ou ouvrir une issue.

