import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  BarChart3,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  Target
} from 'lucide-react';

interface ChatStatsProps {
  totalMessages: number;
  activeConversations: number;
  totalParticipants: number;
  averageResponseTime: number;
  completionRate: number;
}

const ChatStats: React.FC<ChatStatsProps> = ({
  totalMessages,
  activeConversations,
  totalParticipants,
  averageResponseTime,
  completionRate
}) => {
  const stats = [
    {
      title: 'Messages envoyés',
      value: totalMessages,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Conversations actives',
      value: activeConversations,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Participants',
      value: totalParticipants,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Temps de réponse moyen',
      value: `${averageResponseTime} min`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentActivity = [
    {
      type: 'message',
      description: 'Marie Martin a répondu dans "Chantier Résidence Les Jardins"',
      time: 'Il y a 5 min',
      status: 'completed'
    },
    {
      type: 'decision',
      description: 'Validation des plans de façade',
      time: 'Il y a 30 min',
      status: 'completed'
    },
    {
      type: 'alert',
      description: 'Retard signalé sur la livraison des tuiles',
      time: 'Il y a 1h',
      status: 'pending'
    },
    {
      type: 'meeting',
      description: 'Réunion de coordination programmée',
      time: 'Il y a 2h',
      status: 'scheduled'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'decision':
        return <Target className="h-4 w-4" />;
      case 'alert':
        return <Activity className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <BarChart3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Statistiques de communication</DialogTitle>
          <DialogDescription>
            Vue d'ensemble de l'activité et des performances de communication
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statistiques principales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Métriques clés</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Taux de complétion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taux de complétion des tâches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progression</span>
                    <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {completionRate >= 80 ? 'Excellent' : completionRate >= 60 ? 'Bon' : 'À améliorer'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status === 'completed' ? 'Terminé' : 
                             activity.status === 'pending' ? 'En attente' : 'Programmé'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Indicateurs de performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Indicateurs de performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Temps de réponse moyen</span>
                    <Badge variant="outline">{averageResponseTime} min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Messages par jour</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Participants actifs</span>
                    <Badge variant="outline">{totalParticipants}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatStats; 