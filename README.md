# 🏗️ BTP Connect

Plateforme web tout-en-un pour les professionnels du bâtiment et travaux publics (BTP). Simplifiez la gestion de vos chantiers, optimisez vos achats de matériaux et connectez-vous avec les meilleurs artisans.

## ✨ Fonctionnalités

### 🤖 Intelligence Artificielle
- **Marydahh** : Votre assistante IA spécialisée en estimation BTP
- Estimation automatique des coûts et délais
- Recommandations personnalisées pour vos projets
- Analyse prédictive basée sur l'historique des chantiers

### 💬 Chat & Communication
- Système de messagerie en temps réel
- Conversations privées et de groupe
- Partage de documents et photos de chantier
- Notifications instantanées

### 🛒 E-commerce Intelligent
- Catalogue de matériaux adapté au BTP
- Estimation automatique des quantités
- Suggestions de produits alternatifs (locaux/durables)
- Gestion des stocks en temps réel

### 📅 Planification de Chantier
- Gestion des tâches par phase (fondations, murs, toiture...)
- Calendrier interactif avec suivi d'avancement
- Affectation des responsables et corps de métier
- Gestion multi-chantiers

### 👥 Annuaire d'Artisans
- Recherche par région et métier
- Profils détaillés avec portfolio
- Système de notation et commentaires
- Mise en relation intégrée

### 💰 Gestion Budgétaire
- Suivi des dépenses en temps réel
- Alertes de dépassement de budget
- Génération automatique de factures
- Rapports financiers détaillés

## 🚀 Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **UI** : Shadcn/ui + Tailwind CSS
- **Backend** : Supabase (Base de données + Auth + Realtime)
- **IA** : Modèles prédictifs personnalisés
- **Déploiement** : Vercel

## 🛠️ Installation Locale

```bash
# Cloner le projet
git clone [votre-repo]
cd Hack2025

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## 🌐 Déploiement Vercel

1. **Connectez votre repository GitHub à Vercel**
2. **Configurez les variables d'environnement** :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Déployez automatiquement** :
   ```bash
   vercel --prod
   ```

## 📱 Accès

- **URL de production** : [votre-url-vercel]
- **Dashboard** : Interface complète pour tous les acteurs du BTP
- **Chat IA** : Conversation avec Marydahh pour estimations
- **Mobile** : Interface responsive optimisée

## 🔧 Configuration

### Variables d'environnement requises :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### Base de données Supabase :
- Tables : `profiles`, `conversations`, `messages`, `conversation_participants`
- RLS (Row Level Security) activé
- Realtime activé pour le chat

## 📊 Performance

- ⚡ **Build optimisé** : Vite + SWC
- 🎯 **Lazy loading** : Chargement à la demande
- 📱 **PWA ready** : Installation sur mobile
- 🔒 **Sécurité** : Headers de sécurité configurés

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**BTP Connect** - Simplifiez vos chantiers, optimisez vos projets ! 🏗️✨


























