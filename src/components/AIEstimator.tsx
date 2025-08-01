import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExcelParser from './ExcelParser';
import AIStats from './AIStats';
import { 
  Brain, 
  Calculator, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  Download
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

interface Prediction {
  cout_total: number;
  duree_estimee: number;
  cout_materiaux_estime: number;
  cout_main_oeuvre_estime: number;
  risque_retard: number;
  recommandations: string[];
}

const AIEstimator = () => {
  const [historicalData, setHistoricalData] = useState<ProjectData[]>([]);
  const [newProject, setNewProject] = useState({
    type: '',
    surface: 0,
    ouvriers: 0,
    temperature: 25,
    pluie: 0
  });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);


  // Données d'exemple pour démonstration
  const sampleData: ProjectData[] = [
    {
      type: 'résidentiel',
      surface: 150,
      ouvriers: 8,
      temperature: 28,
      pluie: 5,
      cout_materiaux: 25000000,
      cout_main_oeuvre: 15000000,
      duree_estimee: 90,
      retards: 5
    },
    {
      type: 'commercial',
      surface: 500,
      ouvriers: 15,
      temperature: 30,
      pluie: 10,
      cout_materiaux: 80000000,
      cout_main_oeuvre: 45000000,
      duree_estimee: 180,
      retards: 15
    },
    {
      type: 'industriel',
      surface: 1000,
      ouvriers: 25,
      temperature: 32,
      pluie: 8,
      cout_materiaux: 150000000,
      cout_main_oeuvre: 80000000,
      duree_estimee: 240,
      retards: 20
    },
    {
      type: 'résidentiel',
      surface: 200,
      ouvriers: 10,
      temperature: 26,
      pluie: 3,
      cout_materiaux: 35000000,
      cout_main_oeuvre: 20000000,
      duree_estimee: 120,
      retards: 8
    },
    {
      type: 'commercial',
      surface: 300,
      ouvriers: 12,
      temperature: 29,
      pluie: 7,
      cout_materiaux: 55000000,
      cout_main_oeuvre: 35000000,
      duree_estimee: 150,
      retards: 12
    }
  ];

  useEffect(() => {
    // Charger les données d'exemple au démarrage
    setHistoricalData(sampleData);
  }, []);

  const handleDataParsed = (newData: ProjectData[]) => {
    setHistoricalData(newData);
  };

  const calculatePrediction = (): Prediction => {
    const { type, surface, ouvriers, temperature, pluie } = newProject;
    
    // Trouver les projets similaires
    const similarProjects = historicalData.filter(p => p.type === type);
    
    if (similarProjects.length === 0) {
      // Utiliser tous les projets si aucun projet du même type
      return calculatePredictionFromAll();
    }

    // Calculer les moyennes pour les projets similaires
    const avgCoutMateriaux = similarProjects.reduce((sum, p) => sum + p.cout_materiaux, 0) / similarProjects.length;
    const avgCoutMainOeuvre = similarProjects.reduce((sum, p) => sum + p.cout_main_oeuvre, 0) / similarProjects.length;
    const avgDuree = similarProjects.reduce((sum, p) => sum + p.duree_estimee, 0) / similarProjects.length;
    const avgRetards = similarProjects.reduce((sum, p) => sum + p.retards, 0) / similarProjects.length;

    // Facteurs d'ajustement basés sur la surface
    const surfaceFactor = surface / similarProjects.reduce((sum, p) => sum + p.surface, 0) / similarProjects.length;
    
    // Facteurs météo
    const temperatureFactor = temperature > 30 ? 1.1 : temperature < 20 ? 0.95 : 1.0;
    const pluieFactor = pluie > 10 ? 1.15 : pluie > 5 ? 1.05 : 1.0;

    // Calculs finaux
    const coutMateriauxEstime = avgCoutMateriaux * surfaceFactor * temperatureFactor * pluieFactor;
    const coutMainOeuvreEstime = avgCoutMainOeuvre * surfaceFactor * temperatureFactor * pluieFactor;
    const dureeEstimee = avgDuree * surfaceFactor * temperatureFactor * pluieFactor;
    const coutTotal = coutMateriauxEstime + coutMainOeuvreEstime;
    
    // Calcul du risque de retard
    const risqueRetard = Math.min(100, (pluie / 10) * 20 + (temperature > 35 ? 15 : 0) + (avgRetards / avgDuree) * 100);

    // Recommandations
    const recommandations = [];
    if (pluie > 10) recommandations.push("Prévoir des protections contre la pluie");
    if (temperature > 30) recommandations.push("Adapter les horaires de travail pour éviter les heures chaudes");
    if (surface > 500) recommandations.push("Considérer une équipe plus importante pour accélérer le projet");
    if (risqueRetard > 30) recommandations.push("Prévoir une marge de sécurité dans le planning");

    return {
      cout_total: Math.round(coutTotal),
      duree_estimee: Math.round(dureeEstimee),
      cout_materiaux_estime: Math.round(coutMateriauxEstime),
      cout_main_oeuvre_estime: Math.round(coutMainOeuvreEstime),
      risque_retard: Math.round(risqueRetard),
      recommandations
    };
  };

  const calculatePredictionFromAll = (): Prediction => {
    const avgCoutMateriaux = historicalData.reduce((sum, p) => sum + p.cout_materiaux, 0) / historicalData.length;
    const avgCoutMainOeuvre = historicalData.reduce((sum, p) => sum + p.cout_main_oeuvre, 0) / historicalData.length;
    const avgDuree = historicalData.reduce((sum, p) => sum + p.duree_estimee, 0) / historicalData.length;
    
    const surfaceFactor = newProject.surface / (historicalData.reduce((sum, p) => sum + p.surface, 0) / historicalData.length);
    
    const coutMateriauxEstime = avgCoutMateriaux * surfaceFactor;
    const coutMainOeuvreEstime = avgCoutMainOeuvre * surfaceFactor;
    const dureeEstimee = avgDuree * surfaceFactor;
    const coutTotal = coutMateriauxEstime + coutMainOeuvreEstime;
    
    return {
      cout_total: Math.round(coutTotal),
      duree_estimee: Math.round(dureeEstimee),
      cout_materiaux_estime: Math.round(coutMateriauxEstime),
      cout_main_oeuvre_estime: Math.round(coutMainOeuvreEstime),
      risque_retard: 25,
      recommandations: ["Utilisation de données générales pour l'estimation"]
    };
  };

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      const result = calculatePrediction();
      setPrediction(result);
      setLoading(false);
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">IA d'Estimation BTP</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Notre intelligence artificielle analyse vos données historiques pour prédire les coûts, 
          délais et optimiser les matériaux de vos projets de construction.
        </p>
      </div>

      <Tabs defaultValue="estimation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estimation">Estimation IA</TabsTrigger>
          <TabsTrigger value="donnees">Données</TabsTrigger>
          <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="estimation" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Formulaire de saisie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Nouveau Projet</span>
                </CardTitle>
                <CardDescription>
                  Saisissez les caractéristiques de votre projet pour obtenir une estimation IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de chantier</Label>
                  <Select value={newProject.type} onValueChange={(value) => setNewProject({...newProject, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="résidentiel">Résidentiel</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industriel">Industriel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    value={newProject.surface}
                    onChange={(e) => setNewProject({...newProject, surface: Number(e.target.value)})}
                    placeholder="Ex: 200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ouvriers">Nombre d'ouvriers</Label>
                  <Input
                    id="ouvriers"
                    type="number"
                    value={newProject.ouvriers}
                    onChange={(e) => setNewProject({...newProject, ouvriers: Number(e.target.value)})}
                    placeholder="Ex: 10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Température (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={newProject.temperature}
                      onChange={(e) => setNewProject({...newProject, temperature: Number(e.target.value)})}
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pluie">Jours de pluie/mois</Label>
                    <Input
                      id="pluie"
                      type="number"
                      value={newProject.pluie}
                      onChange={(e) => setNewProject({...newProject, pluie: Number(e.target.value)})}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handlePredict} 
                  disabled={!newProject.type || newProject.surface === 0}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyse en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Obtenir l'estimation IA</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Résultats de prédiction */}
            {prediction && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    <span>Prédiction IA</span>
                  </CardTitle>
                  <CardDescription>
                    Estimation basée sur l'analyse de {historicalData.length} projets historiques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(prediction.cout_total)}
                      </div>
                      <div className="text-sm text-muted-foreground">Coût Total</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {prediction.duree_estimee} jours
                      </div>
                      <div className="text-sm text-muted-foreground">Durée Estimée</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {formatCurrency(prediction.cout_materiaux_estime)}
                      </div>
                      <div className="text-sm text-muted-foreground">Matériaux</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-foreground">
                        {formatCurrency(prediction.cout_main_oeuvre_estime)}
                      </div>
                      <div className="text-sm text-muted-foreground">Main d'œuvre</div>
                    </div>
                  </div>

                  {/* Risque de retard */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Risque de retard</Label>
                      <Badge variant={prediction.risque_retard > 50 ? "destructive" : prediction.risque_retard > 25 ? "secondary" : "default"}>
                        {prediction.risque_retard}%
                      </Badge>
                    </div>
                    <Progress value={prediction.risque_retard} className="h-2" />
                  </div>

                  {/* Recommandations */}
                  {prediction.recommandations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span>Recommandations IA</span>
                      </h4>
                      <ul className="space-y-2">
                        {prediction.recommandations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="donnees" className="space-y-6">
          <ExcelParser 
            onDataParsed={handleDataParsed}
            historicalData={historicalData}
          />
        </TabsContent>

        <TabsContent value="statistiques" className="space-y-6">
          <AIStats 
            historicalData={historicalData}
            prediction={prediction}
          />
        </TabsContent>
      </Tabs>


    </div>
  );
};

export default AIEstimator; 