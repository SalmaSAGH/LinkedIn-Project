# 🔗 LinkedIn Clone – Application de Réseautage Professionnel

Bienvenue dans le projet **LinkedIn-Project**, un clone simplifié de LinkedIn réalisé dans le cadre d’un stage d’été.  
L’application permet aux utilisateurs de créer leur profil, publier du contenu, interagir avec d'autres professionnels et gérer leur réseau.

> **Lien du dépôt GitHub :** [https://github.com/SalmaSAGH/LinkedIn-Project](https://github.com/SalmaSAGH/LinkedIn-Project)

---

## 🚀 Stack Technique

- **Framework Web** : [Next.js](https://nextjs.org/) – pour le frontend **et** les API backend  
- **Base de données** : [PostgreSQL](https://www.postgresql.org/)  
- **ORM** : [Prisma](https://www.prisma.io/)  
- **Déploiement** : [Vercel](https://vercel.com/)  
- **Langage** : TypeScript  
- **Authentification** : Email + mot de passe (custom logic ou future intégration NextAuth)

---

## ✅ Fonctionnalités

- ✅ Authentification utilisateur (signup / login / logout)  
- ✅ Création et modification de **profil utilisateur**    
- ✅ **Dashboard** personnalisé après connexion  
- ✅ **Création/Modification/Suppression** de publications avec possibilité de publier des photos
- ✅ **Likes** (1 seul par utilisateur par post)  
- ✅ **Commentaires** sur les publications avec possibilité de modifier et supprimer 
- ✅ Suggestions de connexions(**avec notifications**), abonnement et désabonnement entre utilisateurs
- ✅ Notifications en temps réel (like, comment)  
- 🔜 Messagerie
- 🔜 Export du profil en **PDF**

---
## ⚙️ Installation locale

### 1. Cloner le projet
```sh
git clone https://github.com/SalmaSAGH/LinkedIn-Project.git
cd LinkedIn-Project
```
---
### 2. Installer les dépendances
```sh
npm install  
```
### 3. Configurer les variables d’environnement

Créer un fichier `.env` à la racine du projet avec le contenu suivant (adapter selon ton SGBD) :  
```sh
DATABASE_URL="postgresql://user:password@localhost:5432/linkedindb"  
NEXTAUTH_SECRET="une-cle-secrete-pour-les-tokens"  
```
### 4. Créer la base de données et générer les tables
```sh 
npx prisma migrate dev --name init  
```
### 6. Lancer l’application en développement
```sh
npm run dev
```

➡️ Accès sur : http://localhost:3000  

### 🧪 Outils utiles  
Visualiser la base de données :  
```sh
npx prisma studio  
```
Générer le client Prisma après modification du schéma :  
```sh
npx prisma generate
```
