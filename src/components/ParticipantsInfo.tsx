import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Users,
  User,
  Building,
  Wrench,
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

interface Actor {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  company?: string;
  phone?: string;
  email?: string;
  location?: string;
}

interface ParticipantsInfoProps {
  participants: Actor[];
  conversationTitle: string;
  isGroup: boolean;
}

const ParticipantsInfo: React.FC<ParticipantsInfoProps> = ({ 
  participants, 
  conversationTitle, 
  isGroup 
}) => {
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

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'maître d\'ouvrage':
        return 'bg-blue-100 text-blue-800';
      case 'chef de chantier':
        return 'bg-green-100 text-green-800';
      case 'architecte':
        return 'bg-purple-100 text-purple-800';
      case 'fournisseur':
        return 'bg-orange-100 text-orange-800';
      case 'sous-traitant':
        return 'bg-yellow-100 text-yellow-800';
      case 'bureau de contrôle':
        return 'bg-red-100 text-red-800';
      case 'administration':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isGroup ? `Participants - ${conversationTitle}` : 'Informations du contact'}
          </DialogTitle>
          <DialogDescription>
            {isGroup 
              ? `${participants.length} participant${participants.length > 1 ? 's' : ''} dans cette conversation`
              : 'Détails du contact'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {participants.map((participant) => (
              <Card key={participant.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {participant.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(participant.role)}
                          <span className={`w-3 h-3 rounded-full ${
                            participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                      <Badge className={`mt-1 ${getRoleColor(participant.role)}`}>
                        {participant.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {participant.company && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{participant.company}</span>
                      </div>
                    )}
                    
                    {participant.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{participant.phone}</span>
                      </div>
                    )}
                    
                    {participant.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{participant.email}</span>
                      </div>
                    )}
                    
                    {participant.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{participant.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {participant.isOnline ? 'En ligne' : `Dernière connexion: ${participant.lastSeen}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantsInfo; 