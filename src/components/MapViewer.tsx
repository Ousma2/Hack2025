import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Home, 
  Building, 
  Factory, 
  Filter,
  Search,
  Heart,
  Share2,
  Phone,
  Mail
} from 'lucide-react';

interface Terrain {
  id: string;
  title: string;
  type: 'résidentiel' | 'commercial' | 'industriel';
  surface: number;
  price: number;
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  features: string[];
  status: 'disponible' | 'réservé' | 'vendu';
  owner: {
    name: string;
    phone: string;
    email: string;
  };
}

const MapViewer = () => {
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données statiques pour la démonstration
  const terrains: Terrain[] = [
    {
      id: '1',
      title: 'Terrain Résidentiel - Zone Calme',
      type: 'résidentiel',
      surface: 500,
      price: 25000000,
      location: 'Abidjan, Cocody',
      coordinates: { lat: 5.3600, lng: -4.0083 },
      description: 'Magnifique terrain dans un quartier résidentiel calme, parfait pour construire une villa familiale.',
      features: ['Électricité', 'Eau potable', 'Route goudronnée', 'Sécurité'],
      status: 'disponible',
      owner: {
        name: 'M. Koné',
        phone: '+225 0701234567',
        email: 'kone@example.com'
      }
    },
    {
      id: '2',
      title: 'Terrain Commercial - Zone d\'Affaires',
      type: 'commercial',
      surface: 800,
      price: 45000000,
      location: 'Abidjan, Plateau',
      coordinates: { lat: 5.3200, lng: -4.0200 },
      description: 'Terrain idéal pour un centre commercial ou un immeuble de bureaux dans le quartier des affaires.',
      features: ['Zone commerciale', 'Parking', 'Accès facile', 'Vue dégagée'],
      status: 'disponible',
      owner: {
        name: 'Mme Traoré',
        phone: '+225 0802345678',
        email: 'traore@example.com'
      }
    },
    {
      id: '3',
      title: 'Terrain Industriel - Zone Industrielle',
      type: 'industriel',
      surface: 2000,
      price: 80000000,
      location: 'Abidjan, Yopougon',
      coordinates: { lat: 5.3400, lng: -4.0300 },
      description: 'Grand terrain dans la zone industrielle, parfait pour une usine ou un entrepôt.',
      features: ['Zone industrielle', 'Accès camions', 'Électricité haute tension', 'Eau industrielle'],
      status: 'disponible',
      owner: {
        name: 'M. Diabaté',
        phone: '+225 0903456789',
        email: 'diabate@example.com'
      }
    },
    {
      id: '4',
      title: 'Terrain Résidentiel - Vue Mer',
      type: 'résidentiel',
      surface: 600,
      price: 35000000,
      location: 'Abidjan, Marcory',
      coordinates: { lat: 5.3500, lng: -4.0100 },
      description: 'Terrain avec vue sur la lagune, dans un quartier huppé, idéal pour une villa de luxe.',
      features: ['Vue mer', 'Clôture', 'Jardin paysager', 'Sécurité 24h'],
      status: 'réservé',
      owner: {
        name: 'M. Ouattara',
        phone: '+225 0704567890',
        email: 'ouattara@example.com'
      }
    },
    {
      id: '5',
      title: 'Terrain Commercial - Centre-Ville',
      type: 'commercial',
      surface: 400,
      price: 30000000,
      location: 'Abidjan, Treichville',
      coordinates: { lat: 5.3300, lng: -4.0400 },
      description: 'Terrain en plein centre-ville, parfait pour un restaurant ou une boutique.',
      features: ['Centre-ville', 'Passage piétons', 'Éclairage public', 'Proximité transports'],
      status: 'disponible',
      owner: {
        name: 'Mme Coulibaly',
        phone: '+225 0805678901',
        email: 'coulibaly@example.com'
      }
    }
  ];

  const filteredTerrains = terrains.filter(terrain => {
    const matchesType = filterType === 'all' || terrain.type === filterType;
    const matchesPrice = filterPrice === 'all' || 
      (filterPrice === 'low' && terrain.price < 30000000) ||
      (filterPrice === 'medium' && terrain.price >= 30000000 && terrain.price < 50000000) ||
      (filterPrice === 'high' && terrain.price >= 50000000);
    const matchesSearch = terrain.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         terrain.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesPrice && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'résidentiel':
        return <Home className="w-4 h-4" />;
      case 'commercial':
        return <Building className="w-4 h-4" />;
      case 'industriel':
        return <Factory className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible':
        return <Badge variant="default" className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'réservé':
        return <Badge variant="secondary">Réservé</Badge>;
      case 'vendu':
        return <Badge variant="destructive">Vendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Carte Interactive des Terrains</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez et sélectionnez le terrain idéal pour votre projet de construction
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Filtres et recherche */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher un terrain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de terrain</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="résidentiel">Résidentiel</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industriel">Industriel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prix</Label>
                <Select value={filterPrice} onValueChange={setFilterPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les prix</SelectItem>
                    <SelectItem value="low">Moins de 30M XOF</SelectItem>
                    <SelectItem value="medium">30M - 50M XOF</SelectItem>
                    <SelectItem value="high">Plus de 50M XOF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Carte simulée */}
          <Card>
            <CardHeader>
              <CardTitle>Carte Interactive</CardTitle>
              <CardDescription>
                Cliquez sur un terrain pour voir les détails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Carte interactive</p>
                  <p className="text-sm">(Intégration Google Maps)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des terrains */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {filteredTerrains.length} terrain{filteredTerrains.length > 1 ? 's' : ''} trouvé{filteredTerrains.length > 1 ? 's' : ''}
            </h2>
          </div>

          <div className="space-y-4">
            {filteredTerrains.map((terrain) => (
              <Card 
                key={terrain.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTerrain?.id === terrain.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTerrain(terrain)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(terrain.type)}
                      <h3 className="font-semibold text-lg">{terrain.title}</h3>
                    </div>
                    {getStatusBadge(terrain.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Localisation</p>
                      <p className="font-medium">{terrain.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Surface</p>
                      <p className="font-medium">{terrain.surface} m²</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prix</p>
                      <p className="font-medium text-primary">{formatCurrency(terrain.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{terrain.type}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{terrain.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {terrain.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Propriétaire: {terrain.owner.name}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        Favoris
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Partager
                      </Button>
                      <Button size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Contacter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Détails du terrain sélectionné */}
      {selectedTerrain && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Détails du terrain sélectionné</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">{selectedTerrain.title}</h3>
                <p className="text-muted-foreground mb-4">{selectedTerrain.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Prix:</span>
                    <span className="font-semibold text-primary">{formatCurrency(selectedTerrain.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface:</span>
                    <span>{selectedTerrain.surface} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Localisation:</span>
                    <span>{selectedTerrain.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut:</span>
                    <span>{getStatusBadge(selectedTerrain.status)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Contact du propriétaire</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Nom:</span>
                    <span>{selectedTerrain.owner.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{selectedTerrain.owner.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{selectedTerrain.owner.email}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler maintenant
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer un message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapViewer; 