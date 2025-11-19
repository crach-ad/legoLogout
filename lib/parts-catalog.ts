import type { Part, PartCategory } from './types'

export const PARTS_CATALOG: Record<PartCategory, Part[]> = {
  electronics: [
    { id: 'hub', name: 'Smart Hub (Required)', price: 80 },
    { id: 'motor_set', name: 'Motor Set (2 Large Motors)', price: 70 },
    { id: 'sensor_pack', name: 'Sensor Pack (Distance, Color, Force)', price: 60 },
    { id: 'light', name: 'Light Brick', price: 15 }
  ],
  motion: [
    { id: 'wheel_set_large', name: 'Large Wheel & Tire Set (4 wheels)', price: 50 },
    { id: 'wheel_set_medium', name: 'Medium Wheel & Tire Set (4 wheels)', price: 35 },
    { id: 'wheel_set_small', name: 'Small Wheel & Tire Set (4 wheels)', price: 25 },
    { id: 'gear_set', name: 'Gear Assortment (Large, Medium, Small)', price: 15 },
    { id: 'track', name: 'Track Links Kit', price: 20 }
  ],
  structure: [
    { id: 'beam_set_large', name: 'Large Beam Bundle (15M, 13M, 11M)', price: 30 },
    { id: 'beam_set_small', name: 'Small Beam Bundle (9M, 7M, 5M)', price: 18 },
    { id: 'frame_set', name: 'Frame Set (Large & Medium)', price: 35 },
    { id: 'panel_set', name: 'Panel Set (Large & Small)', price: 15 },
    { id: 'angle_bracket', name: 'Angle Bracket Pack (5 pieces)', price: 10 }
  ],
  connectors: [
    { id: 'pin_pack', name: 'Pin Variety Pack (Long, Short, Friction)', price: 8 },
    { id: 'axle_set', name: 'Axle Assortment (12M, 8M, 6M, 4M)', price: 12 },
    { id: 'connector_pack', name: 'Connector Pack (Bushes, Pegs, Joints)', price: 10 }
  ],
  specialty: [
    { id: 'astronaut_crew', name: 'Astronaut Crew (2 Minifigs)', price: 25 },
    { id: 'mission_kit', name: 'Mission Kit (Flag, Antenna, Camera)', price: 20 },
    { id: 'solar_panel', name: 'Solar Panel Array', price: 15 },
    { id: 'science_tools', name: 'Science Tools (Robotic Arm, Drill, Container)', price: 35 }
  ],
  landscape: [
    { id: 'baseplate', name: 'Mars Baseplate', price: 20 },
    { id: 'rock_collection', name: 'Rock Collection (Large, Medium, Small)', price: 20 },
    { id: 'crater_set', name: 'Crater Set (Large & Small)', price: 15 },
    { id: 'resource_pack', name: 'Resource Pack (Crystals, Metal, Dust)', price: 18 },
    { id: 'terrain_features', name: 'Terrain Features (Cliff, Cave, Landing Pad)', price: 45 }
  ]
}
