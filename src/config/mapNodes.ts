import { moduleCatalog } from '../content/modules/catalog'
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
    route: moduleCatalog.array.route,
    isImplemented: moduleCatalog.array.implemented,
  },
  {
    id: 'misty-forest',
    name: 'Misty Forest',
    scrollTitle: 'Linked Mistwood',
    scrollPosition: { x: 50, y: 64 },
    type: 'linked-list',
    route: moduleCatalog['linked-list'].route,
    isImplemented: moduleCatalog['linked-list'].implemented,
  },
  {
    id: 'stack-ruins',
    name: 'Stack Ruins',
    scrollTitle: 'Ruins of the Shadow Stack',
    scrollPosition: { x: 73, y: 22 },
    type: 'stack',
    route: '/#/stack',
    isImplemented: moduleCatalog.stack.implemented,
  },
  {
    id: 'harbor-pier',
    name: 'Harbor Pier',
    scrollTitle: 'Queued Harbor',
    scrollPosition: { x: 77, y: 77 },
    type: 'queue',
    route: moduleCatalog.queue.route,
    isImplemented: moduleCatalog.queue.implemented,
  },
]
