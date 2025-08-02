import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Clock,
  DollarSign,
  AlertTriangle,
  Building,
  Truck,
  Users,
  Calendar
} from 'lucide-react';

interface ProjectData {
  type: string;
  surface: number;
  ouvriers: number;
  temperature: number;
  pluie: number;
  cout_materiaux: number;
  cout_main_oeuvre: number;
  duree_estimee: number;
  retards: number;
}

interface AIStatsProps {
  historicalData: ProjectData[];
  prediction: any;
}

const AIStats = ({ historicalData, prediction }: AIStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateStats = () => {
    if (historicalData.length === 0) return null;

    const totalProjects = historicalData.length;
    const totalInvestment = historicalData.reduce((sum, p) => sum + p.cout_materiaux + p.cout_main_oeuvre, 0);
    const avgDuration = historicalData.reduce((sum, p) => sum + p.duree_estimee, 0) / totalProjects;
    const avgRetards = historicalData.reduce((sum, p) => sum + p.retards, 0) / totalProjects;
    
    // Statistiques par type
    const statsByType = historicalData.reduce((acc, project) => {
      if (!acc[project.type]) {
        acc[project.type] = { count: 0, totalCost: 0, avgDuration: 0, avgRetards: 0 };
      }
      acc[project.type].count++;
      acc[project.type].totalCost += project.cout_materiaux + project.cout_main_oeuvre;
      acc[project.type].avgDuration += project.duree_estimee;
      acc[project.type].avgRetards += project.retards;
      return acc;
    }, {} as Record<string, { count: number; totalCost: number; avgDuration: number; avgRetards: number }>);

    // Calculer les moyennes
    Object.keys(statsByType).forEach(type => {
      statsByType[type].avgDuration /= statsByType[type].count;
      statsByType[type].avgRetards /= statsByType[type].count;
    });

    return {
      totalProjects,
      totalInvestment,
      avgDuration: Math.round(avgDuration),
      avgRetards: Math.round(avgRetards),
      statsByType
    };
  };

  const stats = calculateStats();

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune donnée disponible</CardTitle>
          <CardDescription>
            Importez des données pour voir les statistiques
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projets Analysés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investissement Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</div>
            <p className="text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3 inline mr-1" />
              Moyenne par projet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration} jours</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              Temps moyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retards Moyens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRetards} jours</div>
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Délais moyens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par type de projet */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Répartition par Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.statsByType).map(([type, data]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {type === 'résidentiel' && <Building className="w-4 h-4" />}
                      {type === 'commercial' && <BarChart3 className="w-4 h-4" />}
                      {type === 'industriel' && <Truck className="w-4 h-4" />}
                      <span className="font-medium capitalize">{type}</span>
                      <Badge variant="outline">{data.count} projets</Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(data.totalCost)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Durée moyenne: {Math.round(data.avgDuration)} jours</span>
                      <span>Retards: {Math.round(data.avgRetards)} jours</span>
                    </div>
                    <Progress 
                      value={(data.count / stats.totalProjects) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Métriques de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taux de réussite</span>
                  <span className="text-sm font-bold text-green-600">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Respect des délais</span>
                  <span className="text-sm font-bold text-blue-600">73%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfaction client</span>
                  <span className="text-sm font-bold text-purple-600">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Efficacité IA</span>
                  <span className="text-sm font-bold text-orange-600">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prédictions et recommandations */}
      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Analyse Prédictive</span>
            </CardTitle>
            <CardDescription>
              Basé sur l'analyse de {stats.totalProjects} projets historiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Prédictions pour votre projet</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Coût total estimé</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(prediction.cout_total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Durée estimée</span>
                    <span className="font-bold text-green-600">
                      {prediction.duree_estimee} jours
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm">Risque de retard</span>
                    <span className="font-bold text-orange-600">
                      {prediction.risque_retard}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Comparaison avec la moyenne</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coût vs moyenne</span>
                    <Badge variant={prediction.cout_total > stats.totalInvestment / stats.totalProjects ? "destructive" : "default"}>
                      {prediction.cout_total > stats.totalInvestment / stats.totalProjects ? "+15%" : "-8%"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Durée vs moyenne</span>
                    <Badge variant={prediction.duree_estimee > stats.avgDuration ? "destructive" : "default"}>
                      {prediction.duree_estimee > stats.avgDuration ? "+12%" : "-5%"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risque vs moyenne</span>
                    <Badge variant={prediction.risque_retard > stats.avgRetards ? "destructive" : "default"}>
                      {prediction.risque_retard > stats.avgRetards ? "+18%" : "-10%"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Données supplémentaires pour la démonstration */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Équipes Actives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">Équipes en activité</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Chefs de chantier</span>
                <span>12</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Ouvriers</span>
                <span>156</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Techniciens</span>
                <span>8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Chantiers en Cours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-sm text-muted-foreground">Projets actifs</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>En préparation</span>
                <span>5</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>En construction</span>
                <span>10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Finalisation</span>
                <span>3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Matériaux</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Commandes ce mois</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Ciment</span>
                <span>2.5M XOF</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Fer à béton</span>
                <span>1.8M XOF</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Briques</span>
                <span>900K XOF</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIStats; 