# Configuration de la base de données Supabase pour le système de chat

## 🗄️ Tables nécessaires

Le système de chat nécessite les tables suivantes dans Supabase :

### 1. Table `conversations`
```sql
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    is_group BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Table `conversation_participants`
```sql
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);
```

### 3. Table `messages`
```sql
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'file', 'image')),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Table `message_reads` (optionnel)
```sql
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);
```

## 🔧 Comment configurer

### Option 1 : Via l'interface Supabase
1. Allez sur votre projet Supabase
2. Naviguez vers **SQL Editor**
3. Copiez et exécutez le contenu du fichier `supabase/migrations/create_chat_tables.sql`

### Option 2 : Via la CLI Supabase
1. Installez Supabase CLI : `npm install -g supabase`
2. Connectez-vous : `supabase login`
3. Liez votre projet : `supabase link --project-ref YOUR_PROJECT_REF`
4. Exécutez la migration : `supabase db push`

## 🔐 Politiques de sécurité (RLS)

Les tables sont configurées avec Row Level Security pour garantir que :
- Les utilisateurs ne voient que les conversations auxquelles ils participent
- Les utilisateurs ne peuvent envoyer des messages que dans leurs conversations
- Seuls les participants peuvent ajouter d'autres participants

## 📊 Index pour les performances

Des index sont créés sur :
- `conversation_participants(user_id)`
- `conversation_participants(conversation_id)`
- `messages(conversation_id)`
- `messages(sender_id)`
- `messages(created_at)`

## 🔄 Triggers automatiques

- Mise à jour automatique de `updated_at` sur les tables `conversations` et `messages`
- Création automatique d'un profil lors de l'inscription d'un utilisateur

## 🚀 Test du système

Une fois les tables créées :

1. **Créez quelques comptes utilisateurs** via l'interface d'inscription
2. **Connectez-vous** avec un compte
3. **Allez sur `/chat`** pour tester le système
4. **Créez une nouvelle conversation** en sélectionnant d'autres utilisateurs
5. **Envoyez des messages** pour tester la fonctionnalité

## 🐛 Dépannage

### Erreur "relation does not exist"
- Vérifiez que les tables ont été créées dans Supabase
- Vérifiez que vous êtes connecté à la bonne base de données

### Erreur "permission denied"
- Vérifiez que les politiques RLS sont correctement configurées
- Vérifiez que l'utilisateur est authentifié

### Aucun utilisateur visible
- Vérifiez que des utilisateurs existent dans la table `profiles`
- Vérifiez que les utilisateurs sont bien connectés

## 📝 Notes importantes

- Le système utilise l'authentification Supabase par défaut
- Les messages sont stockés en temps réel avec les WebSockets de Supabase
- Les fichiers/images peuvent être stockés dans Supabase Storage (à configurer séparément)
- Les notifications peuvent être étendues avec Supabase Edge Functions 