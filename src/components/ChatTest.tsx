import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserService, ChatActor } from '@/services/userService';
import { ChatService, ConversationWithParticipants } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

const ChatTest: React.FC = () => {
  const [users, setUsers] = useState<ChatActor[]>([]);
  const [currentUser, setCurrentUser] = useState<ChatActor | null>(null);
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: string[] = [];
    
    try {
      setLoading(true);
      
      // Test 1: Vérifier la connexion Supabase
      results.push('🔍 Test 1: Connexion à Supabase...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        results.push('✅ Connexion Supabase réussie');
        setCurrentUser(await UserService.getCurrentUser());
      } else {
        results.push('❌ Aucun utilisateur connecté');
      }

      // Test 2: Debug - Vérifier les politiques RLS
      results.push('🔍 Test 2: Vérification des politiques RLS...');
      try {
        // Test direct de la table profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
        
        if (profilesError) {
          results.push(`❌ Erreur d'accès aux profils: ${profilesError.message}`);
          results.push(`   Code: ${profilesError.code}`);
          results.push(`   Details: ${profilesError.details}`);
        } else {
          results.push(`✅ Accès aux profils autorisé - ${profilesData?.length || 0} profils trouvés`);
          if (profilesData && profilesData.length > 0) {
            results.push('📋 Détails des profils:');
            profilesData.forEach((profile, index) => {
              results.push(`   ${index + 1}. ${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'} (${profile.role})`);
            });
          }
        }
        
        setDebugInfo({ profilesData, profilesError });
      } catch (error) {
        results.push(`❌ Erreur lors du test d'accès: ${error}`);
      }

      // Test 3: Récupérer tous les utilisateurs via UserService
      results.push('🔍 Test 3: Récupération via UserService.getAllUsers()...');
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
      
      if (allUsers.length > 0) {
        results.push(`✅ ${allUsers.length} utilisateurs trouvés via UserService`);
        results.push('📋 Liste des utilisateurs:');
        allUsers.forEach((user, index) => {
          results.push(`   ${index + 1}. ${user.name} (${user.role}) - ${user.company || 'Aucune entreprise'}`);
        });
      } else {
        results.push('❌ Aucun utilisateur trouvé via UserService');
      }

      // Test 4: Vérifier les politiques RLS spécifiques
      results.push('🔍 Test 4: Vérification des politiques RLS...');
      try {
        // Test avec différentes requêtes
        const { data: countData, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          results.push(`❌ Erreur de comptage: ${countError.message}`);
        } else {
          results.push(`✅ Comptage autorisé - ${countData?.length || 0} profils`);
        }
      } catch (error) {
        results.push(`❌ Erreur lors du test de comptage: ${error}`);
      }

      // Test 5: Récupérer les conversations de l'utilisateur connecté
      if (user) {
        results.push('🔍 Test 5: Récupération des conversations...');
        const userConversations = await ChatService.getUserConversations(user.id);
        setConversations(userConversations);
        
        if (userConversations.length > 0) {
          results.push(`✅ ${userConversations.length} conversations trouvées`);
          userConversations.forEach((conv, index) => {
            results.push(`   ${index + 1}. "${conv.title}" - ${conv.participants.length} participants`);
          });
        } else {
          results.push('ℹ️ Aucune conversation trouvée (normal si vous n\'en avez pas encore créé)');
        }
      }

    } catch (error) {
      results.push(`❌ Erreur générale: ${error}`);
    } finally {
      setLoading(false);
      setTestResults(results);
    }
  };

  const createTestConversation = async () => {
    if (!currentUser || users.length === 0) return;
    
    try {
      const testUser = users.find(u => u.userId !== currentUser.userId);
      if (!testUser) {
        alert('Aucun autre utilisateur disponible pour créer une conversation de test');
        return;
      }

      const conversation = await ChatService.createConversation(
        `Test avec ${testUser.name}`,
        false,
        currentUser.userId,
        [testUser.userId]
      );

      if (conversation) {
        alert('Conversation de test créée avec succès !');
        runTests(); // Recharger les tests
      } else {
        alert('Erreur lors de la création de la conversation de test');
      }
    } catch (error) {
      alert(`Erreur: ${error}`);
    }
  };

  const sendTestMessage = async () => {
    if (!currentUser || conversations.length === 0) return;
    
    try {
      const testConversation = conversations[0];
      const message = await ChatService.sendMessage(
        testConversation.id,
        currentUser.userId,
        'Ceci est un message de test ! 🚀'
      );

      if (message) {
        alert('Message de test envoyé avec succès !');
      } else {
        alert('Erreur lors de l\'envoi du message de test');
      }
    } catch (error) {
      alert(`Erreur: ${error}`);
    }
  };

  const fixRLSPolicies = async () => {
    try {
      results.push('🔧 Tentative de correction des politiques RLS...');
      
      // Désactiver temporairement RLS pour les tests
      const { error: disableError } = await supabase.rpc('disable_rls_for_profiles');
      
      if (disableError) {
        results.push(`❌ Impossible de désactiver RLS: ${disableError.message}`);
      } else {
        results.push('✅ RLS temporairement désactivé pour les tests');
      }
    } catch (error) {
      results.push(`❌ Erreur lors de la correction RLS: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Test du Système de Chat - Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Statut de connexion */}
          <div className="flex items-center gap-4">
            <Badge variant={currentUser ? "default" : "destructive"}>
              {currentUser ? "Connecté" : "Non connecté"}
            </Badge>
            {currentUser && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser.name}</span>
                <Badge variant="outline">{currentUser.role}</Badge>
              </div>
            )}
          </div>

          {/* Boutons de test */}
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={loading}>
              {loading ? "Tests en cours..." : "Relancer les tests"}
            </Button>
            <Button onClick={createTestConversation} variant="outline">
              Créer conversation de test
            </Button>
            <Button onClick={sendTestMessage} variant="outline">
              Envoyer message de test
            </Button>
            <Button onClick={fixRLSPolicies} variant="outline" className="bg-orange-100">
              Corriger RLS
            </Button>
          </div>

          {/* Résultats des tests */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Résultats des tests:</h3>
            <div className="space-y-1 text-sm">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>

          {/* Informations de debug */}
          {debugInfo.profilesData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔍 Informations de debug:</h3>
              <div className="text-blue-800 space-y-2">
                <p><strong>Profils trouvés:</strong> {debugInfo.profilesData?.length || 0}</p>
                {debugInfo.profilesError && (
                  <p><strong>Erreur:</strong> {debugInfo.profilesError.message}</p>
                )}
                <details>
                  <summary className="cursor-pointer font-medium">Voir les détails des profils</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded">
                    {JSON.stringify(debugInfo.profilesData, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Solution recommandée */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Solution recommandée:</h3>
            <div className="text-yellow-800 space-y-2">
              <p><strong>Problème identifié:</strong> Les politiques RLS empêchent probablement de voir tous les utilisateurs.</p>
              <p><strong>Solution:</strong> Modifiez les politiques RLS dans Supabase pour permettre la lecture de tous les profils.</p>
              <p><strong>Action:</strong> Allez dans Supabase > SQL Editor et exécutez:</p>
              <pre className="bg-white p-2 rounded text-xs">
{`-- Permettre la lecture de tous les profils
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);`}
              </pre>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ChatTest; 