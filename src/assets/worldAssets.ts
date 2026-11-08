import array from './images/map-nodes/array.png'
import linkedList from './images/map-nodes/linked-list.png'
import stack from './images/map-nodes/stack.png'
import queue from './images/map-nodes/queue.png'
import worldMap from './images/world-map-bg.jpg'

export type WorldAssetKey =
  'array' | 'linked-list' | 'stack' | 'queue' | 'world-map'

export const WORLD_ASSETS: Record<WorldAssetKey, string> = {
  array,
  'linked-list': linkedList,
  stack,
  queue,
  'world-map': worldMap,
}
