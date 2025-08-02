-- Script pour corriger les politiques RLS et permettre de voir tous les utilisateurs
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les politiques actuelles sur la table profiles
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

-- 2. Supprimer les politiques restrictives existantes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- 3. Créer une nouvelle politique pour permettre la lecture de tous les profils
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

-- 4. Créer une politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Créer une politique pour permettre l'insertion de nouveaux profils
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Vérifier que RLS est activé sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Test de la nouvelle configuration
-- Cette requête devrait maintenant retourner tous les profils
SELECT 
    user_id,
    first_name,
    last_name,
    role,
    company_name
FROM profiles 
ORDER BY created_at DESC;

-- 8. Vérifier les politiques après modification
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

-- 9. Test avec un utilisateur authentifié (optionnel)
-- Cette requête simule ce que fait l'application
SELECT 
    user_id,
    first_name,
    last_name,
    role,
    company_name,
    created_at
FROM profiles 
WHERE role IN ('client', 'fournisseur', 'chef_chantier')
ORDER BY created_at DESC; 