import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Shield, Zap } from 'lucide-react';

export interface Formation {
  id: string;
  name: string;
  positions: {
    GK: number;
    DEF: number;
    MID: number;
    ATT: number;
  };
  description: string;
  style: string;
  icon: React.ComponentType<any>;
}

export const formations: Formation[] = [
  {
    id: '4-3-3',
    name: '4-3-3',
    positions: { GK: 1, DEF: 4, MID: 3, ATT: 3 },
    description: 'Balanced formation with strong attacking width',
    style: 'Attacking',
    icon: Zap
  },
  {
    id: '4-4-2',
    name: '4-4-2',
    positions: { GK: 1, DEF: 4, MID: 4, ATT: 2 },
    description: 'Classic formation with solid midfield control',
    style: 'Balanced',
    icon: Target
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    positions: { GK: 1, DEF: 3, MID: 5, ATT: 2 },
    description: 'Midfield dominance with wing-back support',
    style: 'Possession',
    icon: Users
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    positions: { GK: 1, DEF: 4, MID: 2, ATT: 3 },
    description: 'Modern formation with creative attacking midfield',
    style: 'Modern',
    icon: Target
  },
  {
    id: '5-3-2',
    name: '5-3-2',
    positions: { GK: 1, DEF: 5, MID: 3, ATT: 2 },
    description: 'Defensive solidity with counter-attacking threat',
    style: 'Defensive',
    icon: Shield
  }
];

interface FormationSelectorProps {
  selectedFormation: Formation | null;
  onFormationSelect: (formation: Formation) => void;
  currentSquad?: Array<{ position: string }>;
}

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  selectedFormation,
  onFormationSelect,
  currentSquad = []
}) => {
  const getPositionCount = (position: string) => {
    return currentSquad.filter(player => player.position === position).length;
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'Attacking': return 'bg-red-100 text-red-800';
      case 'Defensive': return 'bg-blue-100 text-blue-800';
      case 'Balanced': return 'bg-green-100 text-green-800';
      case 'Possession': return 'bg-purple-100 text-purple-800';
      case 'Modern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const FormationVisualization: React.FC<{ formation: Formation; compact?: boolean }> = ({ 
    formation, 
    compact = false 
  }) => {
    const size = compact ? 'w-3 h-3' : 'w-4 h-4';
    const spacing = compact ? 'space-y-1' : 'space-y-2';
    
    return (
      <div className={`flex flex-col items-center ${spacing} py-2`}>
        {/* Attackers */}
        <div className="flex justify-center space-x-1">
          {Array(formation.positions.ATT).fill(0).map((_, i) => (
            <div key={`att-${i}`} className={`${size} bg-red-500 rounded-full`} />
          ))}
        </div>
        
        {/* Midfielders */}
        <div className="flex justify-center space-x-1">
          {Array(formation.positions.MID).fill(0).map((_, i) => (
            <div key={`mid-${i}`} className={`${size} bg-green-500 rounded-full`} />
          ))}
        </div>
        
        {/* Defenders */}
        <div className="flex justify-center space-x-1">
          {Array(formation.positions.DEF).fill(0).map((_, i) => (
            <div key={`def-${i}`} className={`${size} bg-blue-500 rounded-full`} />
          ))}
        </div>
        
        {/* Goalkeeper */}
        <div className="flex justify-center">
          <div className={`${size} bg-yellow-500 rounded-full`} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Formation</h3>
        <p className="text-gray-600">Select a tactical setup that suits your playing style</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formations.map((formation) => {
          const isSelected = selectedFormation?.id === formation.id;
          const IconComponent = formation.icon;
          
          return (
            <Card 
              key={formation.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onFormationSelect(formation)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-xl">{formation.name}</CardTitle>
                  </div>
                  <Badge className={getStyleColor(formation.style)} variant="secondary">
                    {formation.style}
                  </Badge>
                </div>
                <CardDescription>{formation.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Formation Visualization */}
                <div className="bg-green-100 rounded-lg p-4">
                  <FormationVisualization formation={formation} />
                </div>
                
                {/* Position Requirements */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Required Players:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>GK:</span>
                      <span className={getPositionCount('GK') >= formation.positions.GK ? 'text-green-600' : 'text-gray-600'}>
                        {getPositionCount('GK')}/{formation.positions.GK}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>DEF:</span>
                      <span className={getPositionCount('DEF') >= formation.positions.DEF ? 'text-green-600' : 'text-gray-600'}>
                        {getPositionCount('DEF')}/{formation.positions.DEF}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MID:</span>
                      <span className={getPositionCount('MID') >= formation.positions.MID ? 'text-green-600' : 'text-gray-600'}>
                        {getPositionCount('MID')}/{formation.positions.MID}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ATT:</span>
                      <span className={getPositionCount('ATT') >= formation.positions.ATT ? 'text-green-600' : 'text-gray-600'}>
                        {getPositionCount('ATT')}/{formation.positions.ATT}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <Button className="w-full" variant="outline" disabled>
                    Selected Formation
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
