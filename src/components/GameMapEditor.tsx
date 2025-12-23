"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Grid, Mountain, Trees, Droplets, Home, Castle, Sword, Trash2, Save, Download, Upload, Eraser, Palette, Sparkles } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 40;

type TerrainType = 'grass' | 'water' | 'mountain' | 'forest' | 'sand' | 'stone';
type ObjectType = 'house' | 'castle' | 'tree' | 'rock' | 'chest' | 'enemy' | 'player' | 'flag' | null;

interface Cell {
  terrain: TerrainType;
  object: ObjectType;
}

const TERRAIN_TYPES = {
  grass: { color: '#7cb342', icon: '🌱', name: 'Grass' },
  water: { color: '#42a5f5', icon: '💧', name: 'Water' },
  mountain: { color: '#757575', icon: '⛰️', name: 'Mountain' },
  forest: { color: '#2e7d32', icon: '🌲', name: 'Forest' },
  sand: { color: '#fdd835', icon: '🏜️', name: 'Sand' },
  stone: { color: '#90a4ae', icon: '🪨', name: 'Stone' },
};

const OBJECTS = {
  house: { icon: '🏠', name: 'House' },
  castle: { icon: '🏰', name: 'Castle' },
  tree: { icon: '🌳', name: 'Tree' },
  rock: { icon: '🪨', name: 'Rock' },
  chest: { icon: '📦', name: 'Chest' },
  enemy: { icon: '👾', name: 'Enemy' },
  player: { icon: '🧙', name: 'Player' },
  flag: { icon: '🚩', name: 'Flag' },
};

export default function GameMapEditor() {
  const [grid, setGrid] = useState<Cell[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ terrain: 'grass' as TerrainType, object: null as ObjectType }))
    )
  );
  const [selectedTool, setSelectedTool] = useState<'terrain' | 'object' | 'eraser'>('terrain');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('grass');
  const [selectedObject, setSelectedObject] = useState<Exclude<ObjectType, null>>('house');
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapName, setMapName] = useState('My Game Map');
  const canvasRef = useRef(null);

  const handleCellInteraction = (row: number, col: number) => {
    const newGrid = [...grid];
    if (selectedTool === 'terrain') {
      newGrid[row][col] = { ...newGrid[row][col], terrain: selectedTerrain };
    } else if (selectedTool === 'object') {
      newGrid[row][col] = { ...newGrid[row][col], object: selectedObject };
    } else if (selectedTool === 'eraser') {
      newGrid[row][col] = { terrain: 'grass' as TerrainType, object: null as ObjectType };
    }
    setGrid(newGrid);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    handleCellInteraction(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      handleCellInteraction(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearMap = () => {
    if (confirm('Clear entire map?')) {
      setGrid(Array(GRID_SIZE).fill(null).map(() => 
        Array(GRID_SIZE).fill(null).map(() => ({ terrain: 'grass' as TerrainType, object: null as ObjectType }))
      ));
    }
  };

  const saveMap = () => {
    const mapData = {
      name: mapName,
      size: GRID_SIZE,
      grid: grid,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const mapData = JSON.parse(event.target?.result as string);
          setGrid(mapData.grid);
          setMapName(mapData.name);
        } catch (error) {
          alert('Error loading map file');
        }
      };
      reader.readAsText(file);
    }
  };

  const generateMap = () => {
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ terrain: 'grass' as TerrainType, object: null as ObjectType }))
    );

    // Generate water bodies (lakes/rivers)
    const numWaterBodies = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numWaterBodies; i++) {
      const centerRow = Math.floor(Math.random() * GRID_SIZE);
      const centerCol = Math.floor(Math.random() * GRID_SIZE);
      const size = Math.floor(Math.random() * 4) + 3;
      
      for (let r = -size; r <= size; r++) {
        for (let c = -size; c <= size; c++) {
          const row = centerRow + r;
          const col = centerCol + c;
          if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            const distance = Math.sqrt(r * r + c * c);
            if (distance <= size && Math.random() > 0.3) {
              newGrid[row][col].terrain = 'water';
            }
          }
        }
      }
    }

    // Generate mountains
    const numMountainRanges = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numMountainRanges; i++) {
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      const length = Math.floor(Math.random() * 8) + 5;
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      
      for (let j = 0; j < length; j++) {
        const row = direction === 'horizontal' ? startRow + Math.floor(Math.random() * 3) - 1 : startRow + j;
        const col = direction === 'vertical' ? startCol + Math.floor(Math.random() * 3) - 1 : startCol + j;
        
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE && newGrid[row][col].terrain !== 'water') {
          newGrid[row][col].terrain = Math.random() > 0.3 ? 'mountain' : 'stone';
        }
      }
    }

    // Generate forests
    const numForests = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numForests; i++) {
      const centerRow = Math.floor(Math.random() * GRID_SIZE);
      const centerCol = Math.floor(Math.random() * GRID_SIZE);
      const size = Math.floor(Math.random() * 3) + 2;
      
      for (let r = -size; r <= size; r++) {
        for (let c = -size; c <= size; c++) {
          const row = centerRow + r;
          const col = centerCol + c;
          if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            if (newGrid[row][col].terrain === 'grass' && Math.random() > 0.4) {
              newGrid[row][col].terrain = 'forest';
            }
          }
        }
      }
    }

    // Generate sandy beaches near water
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col].terrain === 'grass') {
          let nearWater = false;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const r = row + dr;
              const c = col + dc;
              if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && newGrid[r][c].terrain === 'water') {
                nearWater = true;
              }
            }
          }
          if (nearWater && Math.random() > 0.5) {
            newGrid[row][col].terrain = 'sand';
          }
        }
      }
    }

    // Place objects
    const objectTypes = Object.keys(OBJECTS) as Exclude<ObjectType, null>[];
    const numObjects = Math.floor(Math.random() * 15) + 10;
    
    for (let i = 0; i < numObjects; i++) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const terrain = newGrid[row][col].terrain;
      
      // Don't place objects on water or if one already exists
      if (terrain !== 'water' && !newGrid[row][col].object) {
        let objectType: Exclude<ObjectType, null> | undefined;
        
        // Place contextually appropriate objects
        if (terrain === 'forest') {
          objectType = Math.random() > 0.5 ? 'tree' : 'enemy';
        } else if (terrain === 'mountain' || terrain === 'stone') {
          objectType = Math.random() > 0.6 ? 'rock' : 'castle';
        } else if (terrain === 'grass') {
          objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        } else if (terrain === 'sand') {
          objectType = Math.random() > 0.7 ? 'chest' : 'flag';
        }
        
        if (objectType) {
          newGrid[row][col].object = objectType;
        }
      }
    }

    // Ensure at least one player spawn
    let playerPlaced = false;
    for (let row = 0; row < GRID_SIZE && !playerPlaced; row++) {
      for (let col = 0; col < GRID_SIZE && !playerPlaced; col++) {
        if (newGrid[row][col].terrain === 'grass' && !newGrid[row][col].object) {
          newGrid[row][col].object = 'player';
          playerPlaced = true;
        }
      }
    }

    setGrid(newGrid);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Grid className="w-6 h-6 text-emerald-400" />
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
              placeholder="Map Name"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={generateMap} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </button>
            <button onClick={clearMap} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button onClick={saveMap} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".json" onChange={loadMap} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            Tools
          </h3>
          
          {/* Tool Selection */}
          <div className="mb-4 space-y-2">
            <button
              onClick={() => setSelectedTool('terrain')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                selectedTool === 'terrain' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Mountain className="w-5 h-5" />
              Terrain
            </button>
            <button
              onClick={() => setSelectedTool('object')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                selectedTool === 'object' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Home className="w-5 h-5" />
              Objects
            </button>
            <button
              onClick={() => setSelectedTool('eraser')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                selectedTool === 'eraser' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Eraser className="w-5 h-5" />
              Eraser
            </button>
          </div>

          {/* Terrain Types */}
          {selectedTool === 'terrain' && (
            <div className="mb-4">
              <h4 className="text-slate-400 text-sm font-semibold mb-2">Terrain Types</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TERRAIN_TYPES).map(([key, terrain]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTerrain(key as TerrainType)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTerrain === key
                        ? 'border-emerald-400 bg-slate-700 scale-105'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: selectedTerrain === key ? terrain.color + '40' : '' }}
                  >
                    <div className="text-2xl mb-1">{terrain.icon}</div>
                    <div className="text-xs text-white">{terrain.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Objects */}
          {selectedTool === 'object' && (
            <div>
              <h4 className="text-slate-400 text-sm font-semibold mb-2">Objects</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(OBJECTS).map(([key, obj]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedObject(key as Exclude<ObjectType, null>)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedObject === key
                        ? 'border-emerald-400 bg-slate-700 scale-105'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{obj.icon}</div>
                    <div className="text-xs text-white">{obj.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 bg-slate-900">
          <div className="inline-block" style={{ touchAction: 'none' }}>
            <div 
              className="border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                gap: '1px',
                backgroundColor: '#334155'
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    style={{
                      width: `${CELL_SIZE}px`,
                      height: `${CELL_SIZE}px`,
                      backgroundColor: TERRAIN_TYPES[cell.terrain]?.color || '#7cb342',
                    }}
                  >
                    {cell.object && (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none">
                        {OBJECTS[cell.object]?.icon}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}