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
  Download,
  Calendar,
  CalendarDays
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
  date_debut?: string;
  date_fin?: string;
}

interface Prediction {
  cout_total: number;
  duree_estimee: number;
  cout_materiaux_estime: number;
  cout_main_oeuvre_estime: number;
  risque_retard: number;
  recommandations: string[];
  date_debut_estimee: string;
  date_fin_estimee: string;
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

  // Données d'exemple réalistes pour des projets BTP
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
      retards: 5,
      date_debut: '2024-01-15',
      date_fin: '2024-04-15'
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
      retards: 15,
      date_debut: '2024-02-01',
      date_fin: '2024-08-01'
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
      retards: 20,
      date_debut: '2024-03-01',
      date_fin: '2024-11-01'
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
      retards: 8,
      date_debut: '2024-04-01',
      date_fin: '2024-08-01'
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
      retards: 12,
      date_debut: '2024-05-01',
      date_fin: '2024-10-01'
    }
  ];

  useEffect(() => {
    // Charger les données d'exemple au démarrage
    setHistoricalData(sampleData);
  }, []);

  const handleDataParsed = (newData: ProjectData[]) => {
    setHistoricalData(newData);
  };

  // Fonction pour calculer les dates réalistes
  const calculateDates = (dureeEstimee: number): { date_debut: string; date_fin: string } => {
    const today = new Date();
    const dateDebut = new Date(today);
    dateDebut.setDate(today.getDate() + 30); // Commence dans 30 jours
    
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateDebut.getDate() + dureeEstimee);
    
    return {
      date_debut: dateDebut.toISOString().split('T')[0],
      date_fin: dateFin.toISOString().split('T')[0]
    };
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
    const avgSurface = similarProjects.reduce((sum, p) => sum + p.surface, 0) / similarProjects.length;
    const surfaceFactor = surface / avgSurface;
    
    // Facteurs météo
    const temperatureFactor = temperature > 30 ? 1.1 : temperature < 20 ? 0.95 : 1.0;
    const pluieFactor = pluie > 10 ? 1.15 : pluie > 5 ? 1.05 : 1.0;

    // Facteur d'équipe (plus d'ouvriers = durée réduite mais coût main d'œuvre augmenté)
    const avgOuvriers = similarProjects.reduce((sum, p) => sum + p.ouvriers, 0) / similarProjects.length;
    const ouvriersFactor = ouvriers > avgOuvriers ? 0.8 : ouvriers < avgOuvriers ? 1.2 : 1.0;
    const mainOeuvreFactor = ouvriers / avgOuvriers;

    // Calculs finaux avec des durées plus réalistes
    const coutMateriauxEstime = avgCoutMateriaux * surfaceFactor * temperatureFactor * pluieFactor;
    const coutMainOeuvreEstime = avgCoutMainOeuvre * surfaceFactor * mainOeuvreFactor * temperatureFactor * pluieFactor;
    const dureeEstimee = Math.max(30, Math.round(avgDuree * surfaceFactor * temperatureFactor * pluieFactor * ouvriersFactor));
    const coutTotal = coutMateriauxEstime + coutMainOeuvreEstime;
    
    // Calcul du risque de retard plus réaliste
    const risqueRetard = Math.min(100, Math.max(5, (pluie / 10) * 15 + (temperature > 35 ? 10 : 0) + (avgRetards / avgDuree) * 100));

    // Calcul des dates
    const dates = calculateDates(dureeEstimee);

    // Recommandations améliorées
    const recommandations = [];
    if (pluie > 10) recommandations.push("Prévoir des protections contre la pluie et des toitures temporaires");
    if (temperature > 30) recommandations.push("Adapter les horaires de travail (6h-12h, 16h-22h) pour éviter les heures chaudes");
    if (surface > 500) recommandations.push("Considérer une équipe plus importante et des équipements supplémentaires");
    if (risqueRetard > 30) recommandations.push("Prévoir une marge de sécurité de 15-20% dans le planning");
    if (ouvriers < 10 && surface > 200) recommandations.push("Augmenter le nombre d'ouvriers pour respecter les délais");
    if (dureeEstimee > 180) recommandations.push("Planifier les achats de matériaux à l'avance pour éviter les ruptures");

    return {
      cout_total: Math.round(coutTotal),
      duree_estimee: dureeEstimee,
      cout_materiaux_estime: Math.round(coutMateriauxEstime),
      cout_main_oeuvre_estime: Math.round(coutMainOeuvreEstime),
      risque_retard: Math.round(risqueRetard),
      recommandations,
      date_debut_estimee: dates.date_debut,
      date_fin_estimee: dates.date_fin
    };
  };

  const calculatePredictionFromAll = (): Prediction => {
    const avgCoutMateriaux = historicalData.reduce((sum, p) => sum + p.cout_materiaux, 0) / historicalData.length;
    const avgCoutMainOeuvre = historicalData.reduce((sum, p) => sum + p.cout_main_oeuvre, 0) / historicalData.length;
    const avgDuree = historicalData.reduce((sum, p) => sum + p.duree_estimee, 0) / historicalData.length;
    
    const avgSurface = historicalData.reduce((sum, p) => sum + p.surface, 0) / historicalData.length;
    const surfaceFactor = newProject.surface / avgSurface;
    
    const coutMateriauxEstime = avgCoutMateriaux * surfaceFactor;
    const coutMainOeuvreEstime = avgCoutMainOeuvre * surfaceFactor;
    const dureeEstimee = Math.max(30, Math.round(avgDuree * surfaceFactor));
    const coutTotal = coutMateriauxEstime + coutMainOeuvreEstime;
    
    const dates = calculateDates(dureeEstimee);
    
    return {
      cout_total: Math.round(coutTotal),
      duree_estimee: dureeEstimee,
      cout_materiaux_estime: Math.round(coutMateriauxEstime),
      cout_main_oeuvre_estime: Math.round(coutMainOeuvreEstime),
      risque_retard: 25,
      recommandations: ["Utilisation de données générales pour l'estimation", "Recommandé d'ajouter des données spécifiques au type de projet"],
      date_debut_estimee: dates.date_debut,
      date_fin_estimee: dates.date_fin
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

                  {/* Dates estimées */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold">Début estimé</span>
                      </div>
                      <div className="text-sm">{formatDate(prediction.date_debut_estimee)}</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <CalendarDays className="w-4 h-4 text-secondary" />
                        <span className="font-semibold">Fin estimée</span>
                      </div>
                      <div className="text-sm">{formatDate(prediction.date_fin_estimee)}</div>
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