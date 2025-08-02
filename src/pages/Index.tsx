import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Truck, 
  HardHat, 
  MapPin, 
  Users, 
  BarChart3, 
  Calendar,
  LogOut,
  Settings,
  Brain,
  MessageCircle,
  Bell
} from 'lucide-react';
import heroImage from '@/assets/hero-btp.jpg';

interface Profile {
  id: string;
  user_id: string;
  role: 'client' | 'fournisseur' | 'chef_chantier';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar_url?: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Using any for now until types are regenerated
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <Building className="w-5 h-5" />;
      case 'fournisseur':
        return <Truck className="w-5 h-5" />;
      case 'chef_chantier':
        return <HardHat className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client':
        return 'Client / Maître d\'ouvrage';
      case 'fournisseur':
        return 'Fournisseur';
      case 'chef_chantier':
        return 'Chef de chantier';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'client':
        return 'secondary';
      case 'fournisseur':
        return 'outline';
      case 'chef_chantier':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!user) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <HardHat className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">BTP Connect</h1>
              </div>
              <Button variant="construction" onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative text-white overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="BTP Construction"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                BTP Connect
              </h2>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
                La plateforme professionnelle qui connecte tous les acteurs du BTP
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="xl" 
                  variant="secondary"
                  onClick={() => navigate('/auth')}
                >
                  Commencer maintenant
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  En savoir plus
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-concrete">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Une solution pour chaque acteur du BTP
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Que vous soyez client, fournisseur ou chef de chantier, BTP Connect facilite vos projets de construction
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-card hover:shadow-construction transition-construction">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Clients & Maîtres d'ouvrage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Choisir un terrain sur carte interactive</li>
                    <li>• Sélectionner un chef de chantier qualifié</li>
                    <li>• Suivre l'avancement de votre projet</li>
                    <li>• Commander matériaux en ligne</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-industrial transition-construction">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle>Fournisseurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Publier vos offres de matériaux</li>
                    <li>• Proposer des terrains à vendre</li>
                    <li>• Gérer vos stocks et commandes</li>
                    <li>• Étendre votre zone de couverture</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-construction transition-construction">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <HardHat className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Chefs de chantier</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Présenter vos compétences</li>
                    <li>• Gérer vos chantiers depuis un dashboard</li>
                    <li>• Planifier et suivre les tâches</li>
                    <li>• Communiquer avec vos clients</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If authenticated, show dashboard based on role
  return (
    <div className="min-h-screen bg-gradient-concrete">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <HardHat className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">BTP Connect</h1>
              {profile && (
                <Badge variant={getRoleBadgeVariant(profile.role)} className="ml-4">
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(profile.role)}
                    <span>{getRoleLabel(profile.role)}</span>
                  </div>
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {profile?.first_name} {profile?.last_name}
              </span>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Tableau de bord
          </h2>
          <p className="text-muted-foreground">
            Bienvenue, {profile?.first_name}. Gérez votre activité BTP depuis votre espace personnel.
          </p>
        </div>

        {/* Dashboard based on role */}
        {profile?.role === 'client' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Choisir un terrain</span>
                </CardTitle>
                <CardDescription>
                  Parcourez les terrains disponibles sur la carte interactive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="construction" className="w-full" onClick={() => navigate('/map')}>
                  Voir la carte
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Chefs de chantier</span>
                </CardTitle>
                <CardDescription>
                  Trouvez le chef de chantier idéal pour votre projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Parcourir les profils
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Mes projets</span>
                </CardTitle>
                <CardDescription>
                  Suivez l'avancement de vos chantiers en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Voir mes projets
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>IA d'Estimation</span>
                </CardTitle>
                <CardDescription>
                  Estimez les coûts et délais avec notre intelligence artificielle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="construction" className="w-full" onClick={() => navigate('/ai')}>
                  Formulaire IA
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/ai-chat')}>
                  IA Interactive (Chat)
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat & Communication</span>
                </CardTitle>
                <CardDescription>
                  Communiquez avec les autres acteurs du BTP en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="construction" className="w-full" onClick={() => navigate('/chat')}>
                  Ouvrir le Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Consultez toutes vos notifications et alertes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/notifications')}>
                  Voir les notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {profile?.role === 'fournisseur' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Mes offres</span>
                </CardTitle>
                <CardDescription>
                  Gérez vos matériaux et terrains en vente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="construction" className="w-full">
                  Gérer mes offres
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Commandes</span>
                </CardTitle>
                <CardDescription>
                  Suivez vos ventes et commandes en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Voir les commandes
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Zone de couverture</span>
                </CardTitle>
                <CardDescription>
                  Définissez votre zone de livraison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configurer
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>IA d'Estimation</span>
                </CardTitle>
                <CardDescription>
                  Optimisez vos prix avec notre intelligence artificielle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="construction" className="w-full" onClick={() => navigate('/ai')}>
                  Formulaire IA
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/ai-chat')}>
                  IA Interactive (Chat)
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat & Communication</span>
                </CardTitle>
                <CardDescription>
                  Communiquez avec les clients et chefs de chantier en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="construction" className="w-full" onClick={() => navigate('/chat')}>
                  Ouvrir le Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Consultez toutes vos notifications et alertes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/notifications')}>
                  Voir les notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {profile?.role === 'chef_chantier' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Mes chantiers</span>
                </CardTitle>
                <CardDescription>
                  Gérez vos chantiers actifs et planifiez vos tâches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="construction" className="w-full">
                  Voir mes chantiers
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Mon profil</span>
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos compétences et disponibilités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Modifier mon profil
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Statistiques</span>
                </CardTitle>
                <CardDescription>
                  Consultez vos performances et évaluations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Voir les stats
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>IA d'Estimation</span>
                </CardTitle>
                <CardDescription>
                  Planifiez vos chantiers avec notre intelligence artificielle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="construction" className="w-full" onClick={() => navigate('/ai')}>
                  Formulaire IA
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/ai-chat')}>
                  IA Interactive (Chat)
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat & Communication</span>
                </CardTitle>
                <CardDescription>
                  Communiquez avec vos clients et fournisseurs en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="construction" className="w-full" onClick={() => navigate('/chat')}>
                  Ouvrir le Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Consultez toutes vos notifications et alertes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/notifications')}>
                  Voir les notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
