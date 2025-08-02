# 🚀 Guide de Déploiement Vercel

## Prérequis

1. **Compte Vercel** : Créez un compte sur [vercel.com](https://vercel.com)
2. **Repository GitHub** : Votre code doit être sur GitHub
3. **Variables d'environnement** : Configurez Supabase

## Étapes de Déploiement

### 1. Connecter le Repository

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Sélectionnez le framework "Vite"

### 2. Configuration des Variables d'Environnement

Dans les paramètres du projet Vercel, ajoutez :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### 3. Configuration du Build

Vercel détectera automatiquement :
- **Framework** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

### 4. Déploiement

1. **Automatique** : Chaque push sur `main` déclenche un déploiement
2. **Manuel** : Utilisez `vercel --prod` depuis votre terminal

## Commandes Utiles

```bash
# Installer Vercel CLI
npm i -g vercel

# Login à Vercel
vercel login

# Déployer en production
vercel --prod

# Déployer en preview
vercel

# Voir les logs
vercel logs
```

## Configuration Avancée

### Headers de Sécurité
Déjà configurés dans `vercel.json` :
- Protection XSS
- Protection Clickjacking
- Cache optimisé pour les assets

### Optimisations
- **Code Splitting** : Automatique avec Vite
- **Compression** : Gzip/Brotli automatique
- **CDN** : Distribution globale automatique

## Dépannage

### Erreur de Build
```bash
# Vérifier localement
npm run build

# Voir les logs Vercel
vercel logs
```

### Variables d'Environnement
- Vérifiez que toutes les variables sont définies
- Redéployez après modification des variables

### Performance
- Utilisez les outils de performance Vercel
- Surveillez les Core Web Vitals

## Support

- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Support** : [vercel.com/support](https://vercel.com/support) 