import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  FileText,
  Image,
  Paperclip
} from 'lucide-react';
import NewConversation from '@/components/NewConversation';
import ParticipantsInfo from '@/components/ParticipantsInfo';
import ChatNotifications from '@/components/ChatNotifications';
import ChatStats from '@/components/ChatStats';
import { UserService, ChatActor } from '@/services/userService';
import { ChatService, ConversationWithParticipants, Message } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

interface Actor {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
}

interface Conversation {
  id: string;
  title: string;
  participants: Actor[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
}

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<ChatActor | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur connecté
        const user = await UserService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          // Récupérer les conversations de l'utilisateur
          const userConversations = await ChatService.getUserConversations(user.userId);
          setConversations(userConversations);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const message = await ChatService.sendMessage(
        selectedConversation.id,
        currentUser.userId,
        newMessage
      );

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Mettre à jour la conversation
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: message, unreadCount: 0 }
            : conv
        ));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleNewConversation = async (newConversation: ConversationWithParticipants) => {
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
  };

  const handleNotificationClick = (notification: any) => {
    // Naviguer vers la conversation correspondante
    if (notification.conversationId) {
      const conversation = conversations.find(c => c.id === notification.conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  };

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async () => {
        try {
          const conversationMessages = await ChatService.getConversationMessages(selectedConversation.id);
          setMessages(conversationMessages);
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
        }
      };

      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement des conversations...
          </h2>
          <p className="text-gray-600">
            Récupération des données depuis Supabase
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connexion requise
          </h2>
          <p className="text-gray-600 mb-4">
            Vous devez être connecté pour accéder au chat
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Liste des conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Discussions</h1>
            <div className="flex items-center space-x-2">
              <ChatStats 
                totalMessages={messages.length}
                activeConversations={conversations.length}
                totalParticipants={conversations.reduce((sum, conv) => sum + conv.participants.length, 0)}
                averageResponseTime={15}
                completionRate={85}
              />
              <ChatNotifications 
                unreadCount={conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                onNotificationClick={handleNotificationClick}
              />
              <NewConversation onConversationCreated={handleNewConversation} />
            </div>
          </div>
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Aucune conversation trouvée. Créez votre première discussion !
              </p>
              <p className="text-sm text-gray-500">
                Cliquez sur le bouton "+" pour commencer
              </p>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {conversation.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || 'Aucun message'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conversation.isGroup && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Groupe • {conversation.participants.length} participants
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header du chat */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {selectedConversation.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {selectedConversation.participants.map((participant, index) => (
                        <span key={participant.id} className="text-sm text-gray-600">
                          {participant.name} ({participant.role})
                          {index < selectedConversation.participants.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                                 <div className="flex items-center space-x-2">
                   <ParticipantsInfo 
                     participants={selectedConversation.participants}
                     conversationTitle={selectedConversation.title}
                     isGroup={selectedConversation.isGroup}
                   />
                   <Button size="sm" variant="ghost">
                     <Phone className="h-4 w-4" />
                   </Button>
                   <Button size="sm" variant="ghost">
                     <Video className="h-4 w-4" />
                   </Button>
                   <Button size="sm" variant="ghost">
                     <MoreVertical className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                                 {messages.map((message) => {
                   const isCurrentUser = currentUser && message.sender_id === currentUser.userId;
                   return (
                     <div
                       key={message.id}
                       className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                     >
                       <div
                         className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                           isCurrentUser
                             ? 'bg-blue-600 text-white'
                             : 'bg-gray-200 text-gray-900'
                         }`}
                       >
                         <div className="text-sm">{message.content}</div>
                         <div className={`text-xs mt-1 ${
                           isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                         }`}>
                           {new Date(message.created_at).toLocaleTimeString([], {
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </div>
                       </div>
                     </div>
                   );
                 })}
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Image className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <FileText className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Écran d'accueil quand aucune conversation n'est sélectionnée
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sélectionnez une conversation
              </h2>
              <p className="text-gray-600">
                Choisissez une discussion pour commencer à échanger avec vos collègues
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 