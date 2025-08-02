import MapViewer from '@/components/MapViewer';
import { Button } from '@/components/ui/button';
import { HardHat, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Map = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-concrete">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <HardHat className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">BTP Connect</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="py-8">
        <MapViewer />
      </main>
    </div>
  );
};

export default Map; 