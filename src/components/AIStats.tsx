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
  AlertTriangle
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
              Données d'entraînement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investissement Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalInvestment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tous projets confondus
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
              Par projet
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
              Par projet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par type de projet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Analyse par Type de Projet</span>
          </CardTitle>
          <CardDescription>
            Performance détaillée par catégorie de construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.statsByType).map(([type, data]) => (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {data.count} projet{data.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(data.totalCost)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Coût total
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Durée moyenne</span>
                    </div>
                    <div className="font-medium">{Math.round(data.avgDuration)} jours</div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Retards moyens</span>
                    </div>
                    <div className="font-medium">{Math.round(data.avgRetards)} jours</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse de la prédiction */}
      {prediction && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Target className="w-5 h-5" />
              <span>Analyse de la Prédiction</span>
            </CardTitle>
            <CardDescription>
              Comparaison avec les données historiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Coûts</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coût total estimé</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(prediction.cout_total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matériaux</span>
                    <span className="font-medium">
                      {formatCurrency(prediction.cout_materiaux_estime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Main d'œuvre</span>
                    <span className="font-medium">
                      {formatCurrency(prediction.cout_main_oeuvre_estime)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Planning</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Durée estimée</span>
                    <span className="font-semibold text-secondary">
                      {prediction.duree_estimee} jours
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risque de retard</span>
                    <Badge variant={prediction.risque_retard > 50 ? "destructive" : prediction.risque_retard > 25 ? "secondary" : "default"}>
                      {prediction.risque_retard}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">vs moyenne historique</span>
                      <span className={`font-medium ${prediction.duree_estimee > stats.avgDuration ? 'text-red-500' : 'text-green-500'}`}>
                        {prediction.duree_estimee > stats.avgDuration ? 'Plus long' : 'Plus court'}
                      </span>
                    </div>
                    <Progress 
                      value={(prediction.duree_estimee / stats.avgDuration) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIStats; 