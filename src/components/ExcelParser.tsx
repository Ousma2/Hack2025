import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  X
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

interface ExcelParserProps {
  onDataParsed: (data: ProjectData[]) => void;
  historicalData: ProjectData[];
}

const ExcelParser = ({ onDataParsed, historicalData }: ExcelParserProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setError(null);
      setSuccess(false);
    }
  };

  const parseCSV = (csvText: string): ProjectData[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data: ProjectData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values.length >= headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        // Convertir et valider les données
        const projectData: ProjectData = {
          type: row.type || row['type de chantier'] || '',
          surface: parseFloat(row.surface || row['taille du chantier'] || '0'),
          ouvriers: parseInt(row.ouvriers || row['nombre d\'ouvriers'] || '0'),
          temperature: parseFloat(row.temperature || row['conditions météo'] || '25'),
          pluie: parseFloat(row.pluie || row['jours de pluie'] || '0'),
          cout_materiaux: parseFloat(row['cout_materiaux'] || row['coût des matériaux'] || '0'),
          cout_main_oeuvre: parseFloat(row['cout_main_oeuvre'] || row['coût de la main d\'œuvre'] || '0'),
          duree_estimee: parseInt(row['duree_estimee'] || row['durée estimée'] || '0'),
          retards: parseInt(row.retards || row['retards'] || '0')
        };
        
        // Valider que les données sont valides
        if (projectData.type && projectData.surface > 0) {
          data.push(projectData);
        }
      }
    }
    
    return data;
  };

  const handleParseFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        setError("Aucune donnée valide trouvée dans le fichier. Vérifiez le format.");
        setLoading(false);
        return;
      }
      
      setParsedData(data);
      onDataParsed([...historicalData, ...data]);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError("Erreur lors de la lecture du fichier. Vérifiez que c'est un fichier CSV valide.");
    }
    
    setLoading(false);
  };

  const exportTemplate = () => {
    const template = `Type de chantier,Surface (m²),Nombre d'ouvriers,Température (°C),Jours de pluie,Coût matériaux (FCFA),Coût main d'œuvre (FCFA),Durée estimée (jours),Retards (jours)
résidentiel,150,8,28,5,25000000,15000000,90,5
commercial,500,15,30,10,80000000,45000000,180,15
industriel,1000,25,32,8,150000000,80000000,240,20`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_donnees_construction.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setSuccess(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5" />
          <span>Import de Données</span>
        </CardTitle>
        <CardDescription>
          Importez vos données Excel/CSV pour améliorer la précision des prédictions IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {parsedData.length} projets importés avec succès !
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="file">Fichier Excel/CSV</Label>
          <div className="flex space-x-2">
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="flex-1"
            />
            {file && (
              <Button variant="ghost" size="icon" onClick={clearData}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <div className="text-sm text-muted-foreground">
              Fichier sélectionné : {file.name}
            </div>
          )}
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Format attendu :</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-1">Colonnes obligatoires :</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Type de chantier (résidentiel, commercial, industriel)</li>
                <li>• Surface (m²)</li>
                <li>• Nombre d'ouvriers</li>
                <li>• Température moyenne (°C)</li>
                <li>• Jours de pluie par mois</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-1">Colonnes de coûts :</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Coût matériaux (FCFA)</li>
                <li>• Coût main d'œuvre (FCFA)</li>
                <li>• Durée estimée (jours)</li>
                <li>• Retards (jours)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleParseFile} 
            disabled={!file || loading}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyse...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Importer les données</span>
              </div>
            )}
          </Button>
          <Button variant="outline" onClick={exportTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
        </div>

        {parsedData.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Données importées :</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {parsedData.map((project, index) => (
                <div key={index} className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{project.type}</Badge>
                    <span className="text-sm font-medium">{project.surface}m²</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {project.ouvriers} ouvriers • {project.duree_estimee} jours
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelParser; 