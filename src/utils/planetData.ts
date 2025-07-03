export interface PlanetData {
  name: string;
  size: number;
  distance: number;
  color: number;
  speed: number;
  description: string;
  moons?: number;
}

export const createPlanetData = (): PlanetData[] => [
  {
    name: 'Mercury',
    size: 1.5,
    distance: 25,
    color: 0x8c7853,
    speed: 1.6,
    description: 'Closest to the Sun',
    moons: 0
  },
  {
    name: 'Venus',
    size: 2.0,
    distance: 35,
    color: 0xffc649,
    speed: 1.2,
    description: 'Hottest planet',
    moons: 0
  },
  {
    name: 'Earth',
    size: 2.2,
    distance: 50,
    color: 0x6b93d6,
    speed: 1.0,
    description: 'Our home planet',
    moons: 1
  },
  {
    name: 'Mars',
    size: 1.8,
    distance: 65,
    color: 0xc1440e,
    speed: 0.8,
    description: 'The Red Planet',
    moons: 2
  },
  {
    name: 'Jupiter',
    size: 4.5,
    distance: 90,
    color: 0xd8ca9d,
    speed: 0.4,
    description: 'Largest planet',
    moons: 79
  },
  {
    name: 'Saturn',
    size: 4.0,
    distance: 115,
    color: 0xfad5a5,
    speed: 0.3,
    description: 'Planet with rings',
    moons: 82
  },
  {
    name: 'Uranus',
    size: 3.0,
    distance: 140,
    color: 0x4fd0e7,
    speed: 0.2,
    description: 'Ice giant',
    moons: 27
  },
  {
    name: 'Neptune',
    size: 3.0,
    distance: 165,
    color: 0x4b70dd,
    speed: 0.15,
    description: 'Windiest planet',
    moons: 14
  }
];