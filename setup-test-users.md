# Guide pour ajouter des utilisateurs de test

## 🧪 Test du système de chat

Pour tester le système de chat, vous devez d'abord créer quelques utilisateurs de test dans Supabase.

### Option 1: Via l'interface Supabase

1. **Allez sur votre projet Supabase**
2. **Naviguez vers Authentication > Users**
3. **Créez quelques utilisateurs de test** :

#### Utilisateur 1 - Maître d'ouvrage
- Email: `client@test.com`
- Password: `password123`
- Métadonnées:
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "client",
  "company_name": "Construction Dupont SARL",
  "phone": "01 23 45 67 89"
}
```

#### Utilisateur 2 - Chef de chantier
- Email: `chef@test.com`
- Password: `password123`
- Métadonnées:
```json
{
  "first_name": "Marie",
  "last_name": "Martin",
  "role": "chef_chantier",
  "company_name": "BTP Martin",
  "phone": "01 98 76 54 32"
}
```

#### Utilisateur 3 - Fournisseur
- Email: `fournisseur@test.com`
- Password: `password123`
- Métadonnées:
```json
{
  "first_name": "Pierre",
  "last_name": "Bernard",
  "role": "fournisseur",
  "company_name": "Matériaux Bernard",
  "phone": "01 45 67 89 12"
}
```

### Option 2: Via SQL (plus rapide)

Exécutez ce script dans l'éditeur SQL de Supabase :

```sql
-- Insérer des utilisateurs de test dans auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES 
(
  gen_random_uuid(),
  'client@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Jean", "last_name": "Dupont", "role": "client", "company_name": "Construction Dupont SARL", "phone": "01 23 45 67 89"}'
),
(
  gen_random_uuid(),
  'chef@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Marie", "last_name": "Martin", "role": "chef_chantier", "company_name": "BTP Martin", "phone": "01 98 76 54 32"}'
),
(
  gen_random_uuid(),
  'fournisseur@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Pierre", "last_name": "Bernard", "role": "fournisseur", "company_name": "Matériaux Bernard", "phone": "01 45 67 89 12"}'
);
```

## 🚀 Test du système

Une fois les utilisateurs créés :

1. **Allez sur `/chat-test`** dans votre application
2. **Connectez-vous** avec un des comptes de test
3. **Vérifiez que vous voyez tous les utilisateurs** dans la liste
4. **Créez une conversation de test** avec un autre utilisateur
5. **Envoyez des messages** pour tester la fonctionnalité

## 📋 Réponse à votre question

**Oui, vous verrez tous les utilisateurs !** 

Le système récupère tous les utilisateurs de la table `profiles` via la fonction `UserService.getAllUsers()`. Cette fonction est utilisée dans le composant `NewConversation` pour afficher la liste des utilisateurs disponibles lors de la création d'une nouvelle conversation.

Les utilisateurs sont filtrés par :
- Nom (prénom + nom)
- Rôle (Maître d'ouvrage, Fournisseur, Chef de chantier)
- Entreprise

## 🔍 Vérifications à faire

1. **Connexion Supabase** ✅
2. **Récupération des utilisateurs** ✅
3. **Création de conversations** ✅
4. **Envoi de messages** ✅
5. **Temps réel** ✅

Allez sur `/chat-test` pour lancer les tests automatiques ! 