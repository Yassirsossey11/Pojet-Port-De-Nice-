# 🚀 COMMENT DÉMARRER LE SITE

## ✅ Étape 1 : Créer le fichier .env

1. Dans VS Code, appuyez sur **Ctrl + N** (nouveau fichier)
2. Copiez-collez cette ligne :

```
DATABASE_URL="file:./dev.db"
```

3. Appuyez sur **Ctrl + S** pour sauvegarder
4. Nommez le fichier : `.env` (avec le point au début !)
5. Sauvegardez

---

## ✅ Étape 2 : Ouvrir le Terminal

- Menu : `Terminal` → `New Terminal`
- Ou raccourci : `Ctrl + ù`

---

## ✅ Étape 3 : Taper ces 2 commandes

### Commande 1 : Initialiser la base de données
```bash
npm run db:setup
```

Attendez que ça termine (30 secondes)...

### Commande 2 : Démarrer le site
```bash
npm run dev
```

---

## ✅ Étape 4 : Ouvrir dans le navigateur

Allez sur : **http://localhost:3000**

---

## 🎉 VOILÀ C'EST TOUT !

Vous devriez voir :
- ✅ 4 bateaux à quai
- ✅ Statistiques
- ✅ Formulaires fonctionnels

---

## 🆘 Si ça ne marche pas

Copiez-moi TOUT ce qui s'affiche dans le terminal et envoyez-le moi !

