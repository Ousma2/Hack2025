# 🔧 Dépannage - Problème de visibilité des utilisateurs

## 🚨 Problème identifié

Quand vous cliquez sur le bouton "+" pour créer une nouvelle conversation, vous ne voyez que votre propre profil au lieu de tous les utilisateurs de Supabase.

## 🔍 Diagnostic

Le problème vient probablement des **politiques RLS (Row Level Security)** qui empêchent de voir tous les utilisateurs.

## ✅ Solution étape par étape

### Étape 1: Vérifier les politiques actuelles

1. **Allez dans Supabase** > **SQL Editor**
2. **Exécutez cette requête** pour voir les politiques actuelles :

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Étape 2: Corriger les politiques RLS

**Exécutez le script `fix-rls-policies.sql`** dans l'éditeur SQL de Supabase.

Ou copiez-collez ce code :

```sql
-- Supprimer les politiques restrictives existantes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Créer une nouvelle politique pour permettre la lecture de tous les profils
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

-- Créer une politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Créer une politique pour permettre l'insertion de nouveaux profils
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vérifier que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Étape 3: Tester la correction

1. **Allez sur `/chat-test`** dans votre application
2. **Relancez les tests** pour vérifier que tous les utilisateurs sont maintenant visibles
3. **Vérifiez dans le chat** que vous voyez tous les utilisateurs lors de la création d'une nouvelle conversation

### Étape 4: Vérification manuelle

**Exécutez cette requête** dans Supabase pour vérifier que tous les profils sont accessibles :

```sql
SELECT 
    user_id,
    first_name,
    last_name,
    role,
    company_name
FROM profiles 
ORDER BY created_at DESC;
```

## 🔍 Tests de diagnostic

### Test 1: Vérifier l'accès direct

```sql
-- Test d'accès direct à la table profiles
SELECT COUNT(*) FROM profiles;
```

### Test 2: Vérifier les utilisateurs authentifiés

```sql
-- Test avec un utilisateur connecté
SELECT 
    user_id,
    first_name,
    last_name,
    role
FROM profiles 
WHERE role IN ('client', 'fournisseur', 'chef_chantier')
ORDER BY created_at DESC;
```

### Test 3: Vérifier les politiques après correction

```sql
-- Vérifier les nouvelles politiques
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';
```

## 🚀 Test du système après correction

1. **Allez sur `/chat`** dans votre application
2. **Cliquez sur le bouton "+"** pour créer une nouvelle conversation
3. **Vérifiez que vous voyez tous les utilisateurs** dans la liste
4. **Sélectionnez un utilisateur** et créez une conversation
5. **Testez l'envoi de messages**

## 📋 Vérifications finales

- ✅ **Tous les utilisateurs sont visibles** lors de la création d'une conversation
- ✅ **Les politiques RLS permettent la lecture** de tous les profils
- ✅ **La sécurité est maintenue** (seul son propre profil peut être modifié)
- ✅ **Le système de chat fonctionne** correctement

## 🆘 Si le problème persiste

1. **Vérifiez les logs** dans la console du navigateur
2. **Allez sur `/chat-test`** pour voir les détails de debug
3. **Vérifiez que les tables sont bien créées** dans Supabase
4. **Vérifiez que des utilisateurs existent** dans la table `profiles`

## 📞 Support

Si le problème persiste après avoir suivi ces étapes, vérifiez :

1. **Les politiques RLS** dans Supabase > Authentication > Policies
2. **Les données** dans Supabase > Table Editor > profiles
3. **Les logs** dans la console du navigateur (F12) 