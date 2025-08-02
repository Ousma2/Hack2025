import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  User,
  Building,
  Truck,
  HardHat,
  MessageCircle,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'chantier' | 'materiaux' | 'communication' | 'system';
  sender?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Retard sur le chantier',
      message: 'Le chantier "Villa Cocody" accuse un retard de 3 jours. Météo défavorable.',
      timestamp: 'Il y a 2 heures',
      read: false,
      category: 'chantier',
      sender: {
        name: 'M. Koné',
        role: 'Chef de chantier'
      }
    },
    {
      id: '2',
      type: 'success',
      title: 'Commande livrée',
      message: 'Votre commande de ciment (50 sacs) a été livrée sur le chantier.',
      timestamp: 'Il y a 4 heures',
      read: false,
      category: 'materiaux',
      sender: {
        name: 'BTP Matériaux',
        role: 'Fournisseur'
      }
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau message',
      message: 'M. Traoré vous a envoyé un message concernant le projet "Centre Commercial".',
      timestamp: 'Il y a 6 heures',
      read: true,
      category: 'communication',
      sender: {
        name: 'M. Traoré',
        role: 'Client'
      }
    },
    {
      id: '4',
      type: 'error',
      title: 'Panne d\'équipement',
      message: 'La bétonnière est en panne. Intervention prévue dans 2 heures.',
      timestamp: 'Il y a 8 heures',
      read: false,
      category: 'chantier',
      sender: {
        name: 'Équipe technique',
        role: 'Maintenance'
      }
    },
    {
      id: '5',
      type: 'success',
      title: 'Paiement reçu',
      message: 'Paiement de 2.500.000 XOF reçu pour le chantier "Immeuble Plateau".',
      timestamp: 'Il y a 1 jour',
      read: true,
      category: 'system'
    },
    {
      id: '6',
      type: 'info',
      title: 'Nouvelle offre',
      message: 'Nouvelle offre de terrain disponible à Marcory. 600m², 35M XOF.',
      timestamp: 'Il y a 1 jour',
      read: false,
      category: 'materiaux',
      sender: {
        name: 'Agence Immobilière',
        role: 'Agent'
      }
    },
    {
      id: '7',
      type: 'warning',
      title: 'Stock faible',
      message: 'Le stock de fer à béton est faible. Commander rapidement.',
      timestamp: 'Il y a 2 jours',
      read: true,
      category: 'materiaux',
      sender: {
        name: 'Système d\'inventaire',
        role: 'Automatique'
      }
    },
    {
      id: '8',
      type: 'success',
      title: 'Chantier terminé',
      message: 'Le chantier "Maison 2 chambres" a été livré avec succès.',
      timestamp: 'Il y a 3 jours',
      read: true,
      category: 'chantier',
      sender: {
        name: 'M. Diabaté',
        role: 'Chef de chantier'
      }
    }
  ]);

  const [filter, setFilter] = useState<string>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chantier':
        return <Building className="w-4 h-4" />;
      case 'materiaux':
        return <Truck className="w-4 h-4" />;
      case 'communication':
        return <MessageCircle className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Restez informé de toutes les activités de vos projets BTP
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filtres */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setFilter('all')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Toutes ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setFilter('unread')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Non lues ({unreadCount})
              </Button>
              <Button
                variant={filter === 'chantier' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setFilter('chantier')}
              >
                <Building className="w-4 h-4 mr-2" />
                Chantiers
              </Button>
              <Button
                variant={filter === 'materiaux' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setFilter('materiaux')}
              >
                <Truck className="w-4 h-4 mr-2" />
                Matériaux
              </Button>
              <Button
                variant={filter === 'communication' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setFilter('communication')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Communication
              </Button>
              <Button
                variant={filter === 'system' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setFilter('system')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Système
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={markAllAsRead}
              >
                Marquer tout comme lu
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
              >
                Paramètres
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Liste des notifications */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`transition-all hover:shadow-md ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getTypeIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-semibold text-sm">
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {notification.message}
                                  </p>
                                  
                                  {notification.sender && (
                                    <div className="flex items-center space-x-2 mb-2">
                                      <User className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {notification.sender.name} ({notification.sender.role})
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {getCategoryIcon(notification.category)}
                                      <span className="text-xs text-muted-foreground">
                                        {notification.timestamp}
                                      </span>
                                    </div>
                                    
                                    <div className="flex space-x-1">
                                      {!notification.read && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => markAsRead(notification.id)}
                                        >
                                          Marquer lu
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteNotification(notification.id)}
                                      >
                                        Supprimer
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel; 