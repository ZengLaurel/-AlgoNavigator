export interface MapNode {
  id: string
  name: string
  type: 'array' | 'linked-list' | 'stack' | 'queue'
  route: string | null
  scrollTitle: string
  scrollPosition: { x: number; y: number }
  isImplemented: boolean
}

export const MAP_NODES: MapNode[] = [
  {
    id: 'supply-camp',
    name: 'Supply Camp',
    scrollTitle: 'Array of Campsites',
    scrollPosition: { x: 21, y: 51 },
    type: 'array',
    route: null,
    isImplemented: false,
  },
  {
    id: 'misty-forest',
    name: 'Misty Forest',
    scrollTitle: 'Linked Mistwood',
    scrollPosition: { x: 50, y: 64 },
    type: 'linked-list',
    route: null,
    isImplemented: false,
  },
  {
    id: 'stack-ruins',
    name: 'Stack Ruins',
    scrollTitle: 'Ruins of the Shadow Stack',
    scrollPosition: { x: 73, y: 22 },
    type: 'stack',
    route: '/#/stack',
    isImplemented: true,
  },
  {
    id: 'harbor-pier',
    name: 'Harbor Pier',
    scrollTitle: 'Queued Harbor',
    scrollPosition: { x: 77, y: 77 },
    type: 'queue',
    route: null,
    isImplemented: false,
  },
]
