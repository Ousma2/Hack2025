import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Users,
  User,
  Building,
  Wrench,
  Truck
} from 'lucide-react';
import { UserService, ChatActor } from '@/services/userService';
import { ChatService, ConversationWithParticipants } from '@/services/chatService';

interface Actor {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  company?: string;
}

interface NewConversationProps {
  onConversationCreated: (conversation: ConversationWithParticipants) => void;
}

const NewConversation: React.FC<NewConversationProps> = ({ onConversationCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actors, setActors] = useState<ChatActor[]>([]);
  const [loading, setLoading] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'maître d\'ouvrage':
        return <Building className="h-4 w-4" />;
      case 'chef de chantier':
        return <User className="h-4 w-4" />;
      case 'architecte':
        return <Building className="h-4 w-4" />;
      case 'fournisseur':
        return <Truck className="h-4 w-4" />;
      case 'sous-traitant':
        return <Wrench className="h-4 w-4" />;
      case 'bureau de contrôle':
        return <Building className="h-4 w-4" />;
      case 'administration':
        return <Building className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Charger les utilisateurs quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await UserService.getAllUsers();
      setActors(users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleParticipantToggle = (actorId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(actorId) 
        ? prev.filter(id => id !== actorId)
        : [...prev, actorId]
    );
  };

  const handleCreateConversation = async () => {
    if (selectedParticipants.length === 0) {
      alert('Veuillez sélectionner au moins un participant');
      return;
    }

    try {
      console.log('🚀 Début de création de conversation...');
      console.log('Participants sélectionnés:', selectedParticipants);
      
      const participants = actors.filter(actor => selectedParticipants.includes(actor.id));
      console.log('Participants filtrés:', participants);
      
      const isGroup = participants.length > 1;
      console.log('Est-ce un groupe?', isGroup);
      
      // Récupérer l'utilisateur actuel
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ Utilisateur non connecté');
        alert('Vous devez être connecté pour créer une conversation');
        return;
      }
      
      console.log('Utilisateur actuel:', currentUser);

      // Préparer les données de la conversation
      const title = conversationTitle || (isGroup ? `Groupe (${participants.length} participants)` : participants[0].name);
      const participantIds = participants.map(p => p.userId);
      
      console.log('Titre de la conversation:', title);
      console.log('IDs des participants:', participantIds);

      // Créer la conversation dans Supabase
      const conversation = await ChatService.createConversation(
        title,
        isGroup,
        currentUser.userId,
        participantIds
      );

      console.log('Conversation créée:', conversation);

      if (conversation) {
        // Créer l'objet conversation pour l'interface
        const newConversation: ConversationWithParticipants = {
          ...conversation,
          participants,
          unreadCount: 0,
          lastMessage: undefined
        };

        console.log('Nouvelle conversation pour l\'interface:', newConversation);

        onConversationCreated(newConversation);
        setIsOpen(false);
        setSelectedParticipants([]);
        setConversationTitle('');
        setSearchTerm('');
        
        alert('Conversation créée avec succès !');
      } else {
        console.error('❌ Échec de la création de la conversation');
        alert('Erreur lors de la création de la conversation');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      alert(`Erreur: ${error}`);
    }
  };

  const selectedActors = actors.filter(actor => selectedParticipants.includes(actor.id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Nouvelle conversation</span>
            {selectedParticipants.length > 0 && (
              <Badge variant="default" className="bg-blue-600">
                {selectedParticipants.length} sélectionné(s)
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les participants pour créer une nouvelle discussion
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Titre de la conversation (pour les groupes) */}
          {selectedParticipants.length > 1 && (
            <div className="mb-4">
              <Input
                placeholder="Nom du groupe (optionnel)"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
              />
            </div>
          )}

          {/* Participants sélectionnés */}
          {selectedParticipants.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Participants sélectionnés ({selectedParticipants.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedActors.map((actor) => (
                  <Badge key={actor.id} variant="secondary" className="flex items-center gap-1">
                    {actor.name}
                    <button
                      onClick={() => handleParticipantToggle(actor.id)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              {/* Bouton de test visible */}
              <div className="mt-2">
                <Button 
                  onClick={handleCreateConversation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  🚀 Créer la conversation maintenant ({selectedParticipants.length})
                </Button>
              </div>
            </div>
          )}

          {/* Recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, rôle ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Liste des acteurs */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredActors.map((actor) => (
                <div
                  key={actor.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    selectedParticipants.includes(actor.id)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={selectedParticipants.includes(actor.id)}
                    onCheckedChange={() => handleParticipantToggle(actor.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={actor.avatar} />
                    <AvatarFallback>
                      {actor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {actor.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(actor.role)}
                        <span className={`w-2 h-2 rounded-full ${
                          actor.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {actor.role}
                    </p>
                    {actor.company && (
                      <p className="text-xs text-gray-500 truncate">
                        {actor.company}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600">
              {selectedParticipants.length > 0 
                ? `${selectedParticipants.length} participant(s) sélectionné(s)`
                : 'Sélectionnez au moins un participant'
              }
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleCreateConversation}
                disabled={selectedParticipants.length === 0}
                className={selectedParticipants.length > 0 ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {selectedParticipants.length > 0 
                  ? `Créer la conversation (${selectedParticipants.length})`
                  : 'Créer la conversation'
                }
              </Button>
            </div>
          </div>
          {/* Bouton de secours toujours visible */}
          <Button 
            onClick={handleCreateConversation}
            disabled={selectedParticipants.length === 0}
            className={`w-full ${selectedParticipants.length > 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-300"}`}
          >
            {selectedParticipants.length > 0 
              ? `✅ Créer la conversation avec ${selectedParticipants.length} participant(s)`
              : '❌ Sélectionnez au moins un participant'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversation; 