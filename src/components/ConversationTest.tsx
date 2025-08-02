import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserService, ChatActor } from '@/services/userService';
import { ChatService } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

const ConversationTest: React.FC = () => {
  const [users, setUsers] = useState<ChatActor[]>([]);
  const [currentUser, setCurrentUser] = useState<ChatActor | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur actuel
      const user = await UserService.getCurrentUser();
      setCurrentUser(user);
      
      // Récupérer tous les utilisateurs
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
      
      console.log('Utilisateur actuel:', user);
      console.log('Tous les utilisateurs:', allUsers);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateConversation = async () => {
    if (!currentUser || users.length === 0) {
      setTestResult('❌ Aucun utilisateur disponible pour le test');
      return;
    }

    try {
      setLoading(true);
      setTestResult('🔄 Test en cours...');

      // Sélectionner un autre utilisateur
      const otherUser = users.find(u => u.userId !== currentUser.userId);
      if (!otherUser) {
        setTestResult('❌ Aucun autre utilisateur disponible');
        return;
      }

      console.log('🧪 Test de création de conversation avec:', otherUser);

      // Créer une conversation de test
      const conversation = await ChatService.createConversation(
        `Test avec ${otherUser.name}`,
        false,
        currentUser.userId,
        [otherUser.userId]
      );

      if (conversation) {
        setTestResult(`✅ Conversation créée avec succès! ID: ${conversation.id}`);
        console.log('✅ Conversation créée:', conversation);
      } else {
        setTestResult('❌ Échec de la création de la conversation');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      setTestResult(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSendMessage = async () => {
    if (!currentUser) {
      setTestResult('❌ Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      setTestResult('🔄 Test d\'envoi de message...');

      // Récupérer les conversations de l'utilisateur
      const conversations = await ChatService.getUserConversations(currentUser.userId);
      
      if (conversations.length === 0) {
        setTestResult('❌ Aucune conversation trouvée pour tester l\'envoi de message');
        return;
      }

      const firstConversation = conversations[0];
      console.log('🧪 Test d\'envoi de message dans:', firstConversation);

      // Envoyer un message de test
      const message = await ChatService.sendMessage(
        firstConversation.id,
        currentUser.userId,
        'Ceci est un message de test ! 🚀'
      );

      if (message) {
        setTestResult(`✅ Message envoyé avec succès! ID: ${message.id}`);
        console.log('✅ Message envoyé:', message);
      } else {
        setTestResult('❌ Échec de l\'envoi du message');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test d\'envoi:', error);
      setTestResult(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Test de Création de Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Statut */}
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {currentUser ? `Connecté: ${currentUser.name}` : 'Non connecté'}
            </span>
            <span className="text-sm">
              {users.length} utilisateurs disponibles
            </span>
          </div>

          {/* Boutons de test */}
          <div className="flex gap-2">
            <Button 
              onClick={testCreateConversation} 
              disabled={loading || !currentUser || users.length === 0}
            >
              {loading ? "Test en cours..." : "Tester création conversation"}
            </Button>
            <Button 
              onClick={testSendMessage} 
              disabled={loading || !currentUser}
              variant="outline"
            >
              Tester envoi message
            </Button>
            <Button 
              onClick={loadData} 
              disabled={loading}
              variant="outline"
            >
              Recharger
            </Button>
          </div>

          {/* Résultat du test */}
          {testResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Résultat du test:</h3>
              <p className="text-sm">{testResult}</p>
            </div>
          )}

          {/* Informations de debug */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Informations de debug:</h3>
            <div className="text-blue-800 space-y-2 text-sm">
              <p><strong>Utilisateur actuel:</strong> {currentUser?.name || 'Non connecté'}</p>
              <p><strong>Utilisateurs disponibles:</strong> {users.length}</p>
              {users.length > 0 && (
                <details>
                  <summary className="cursor-pointer font-medium">Voir les utilisateurs</summary>
                  <ul className="mt-2 list-disc list-inside">
                    {users.map((user, index) => (
                      <li key={user.id}>
                        {user.name} ({user.role}) - {user.company || 'Aucune entreprise'}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationTest; 