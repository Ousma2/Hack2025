import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { 
  Bell,
  BellOff,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  sender?: string;
  conversationId?: string;
}

interface ChatNotificationsProps {
  unreadCount: number;
  onNotificationClick?: (notification: Notification) => void;
}

const ChatNotifications: React.FC<ChatNotificationsProps> = ({ 
  unreadCount, 
  onNotificationClick 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Notifications d'exemple
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'Nouveau message',
        message: 'Marie Martin a envoyé un message dans "Chantier Résidence Les Jardins"',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        sender: 'Marie Martin',
        conversationId: '1'
      },
      {
        id: '2',
        type: 'alert',
        title: 'Retard signalé',
        message: 'Retard de 2 jours signalé sur la livraison des tuiles',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        conversationId: '3'
      },
      {
        id: '3',
        type: 'success',
        title: 'Validation effectuée',
        message: 'Les plans de la façade ont été validés par l\'architecte',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
        conversationId: '1'
      },
      {
        id: '4',
        type: 'info',
        title: 'Nouveau participant',
        message: 'Équipe Plomberie a rejoint la conversation "Chantier Résidence Les Jardins"',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        isRead: true,
        conversationId: '1'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'info':
        return <User className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'info':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ));
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          {unreadNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              {unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadNotifications.length > 0 && (
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {unreadNotifications.length > 0 
              ? `${unreadNotifications.length} notification${unreadNotifications.length > 1 ? 's' : ''} non lue${unreadNotifications.length > 1 ? 's' : ''}`
              : 'Aucune nouvelle notification'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.sender && (
                          <div className="flex items-center space-x-1 mt-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {notification.sender}
                            </span>
                          </div>
                        )}
                        {!notification.isRead && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChatNotifications; 