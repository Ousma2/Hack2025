import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SelectionTest: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const testItems = [
    { id: '1', name: 'Utilisateur 1', role: 'Client' },
    { id: '2', name: 'Utilisateur 2', role: 'Fournisseur' },
    { id: '3', name: 'Utilisateur 3', role: 'Chef de chantier' },
  ];

  const handleToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test de sélection</span>
            {selectedItems.length > 0 && (
              <Badge variant="default" className="bg-blue-600">
                {selectedItems.length} sélectionné(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Liste des éléments */}
          <div className="space-y-2">
            {testItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedItems.includes(item.id)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleToggle(item.id)}
                />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton de test */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedItems.length > 0 
                ? `${selectedItems.length} élément(s) sélectionné(s)`
                : 'Sélectionnez au moins un élément'
              }
            </div>
            <Button 
              disabled={selectedItems.length === 0}
              className={selectedItems.length > 0 ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {selectedItems.length > 0 
                ? `Continuer (${selectedItems.length})`
                : 'Continuer'
              }
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SelectionTest; 