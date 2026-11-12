import {
  applyOperation,
  cloneState,
  equivalent,
  replayEvidence,
  validState,
  type ModuleAction,
  type ModuleState,
  type OperationEvent,
} from './structures'
import { exerciseIds } from '../../content/modules/catalog'
import type { NewModuleId } from './structures'

export interface TeachingExample {
  id: string
  initial: ModuleState
  goal: (state: ModuleState, events: OperationEvent[]) => boolean
}
export interface TeachingDefinition {
  moduleId: NewModuleId
  exerciseId: string
  ruleId: string
  reasonId: string
  allowedOperations: string[]
  hints: [string, string, string]
  demo: TeachingExample
  transfer: TeachingExample
}
export type TeachingPhase =
  | 'intro'
  | 'demonstrate'
  | 'correct-rule'
  | 'transfer-ready'
  | 'transfer'
  | 'learned'
export interface TeachingSession {
  moduleId: NewModuleId
  exerciseId: string
  phase: TeachingPhase
  hintLevel: number
  ruleId: string
  reasonId: string
  state: ModuleState
  events: OperationEvent[]
}
export type TeachingEvent =
  | {
      type:
        | 'start'
        | 'submit-demo'
        | 'start-transfer'
        | 'submit-transfer'
        | 'reset'
        | 'replay'
        | 'hint'
    }
  | { type: 'rule'; ruleId: string; reasonId: string }
  | { type: 'operate'; action: ModuleAction }

export function newTeachingSession(def: TeachingDefinition): TeachingSession {
  if (
    !exerciseIds[def.moduleId].includes(def.exerciseId) ||
    !validState(def.demo.initial) ||
    !validState(def.transfer.initial) ||
    def.demo.initial.kind !== def.moduleId ||
    def.transfer.initial.kind !== def.moduleId ||
    !def.ruleId ||
    !def.reasonId ||
    !def.allowedOperations.length ||
    def.demo.id === def.transfer.id ||
    equivalent(def.demo.initial, def.transfer.initial) ||
    def.hints.length !== 3 ||
    def.hints.some((h) => !h.trim())
  )
    throw new Error('Invalid teaching content')
  return {
    moduleId: def.moduleId,
    exerciseId: def.exerciseId,
    phase: 'intro',
    hintLevel: 0,
    ruleId: '',
    reasonId: '',
    state: cloneState(def.demo.initial),
    events: [],
  }
}
export function reduceTeaching(
  def: TeachingDefinition,
  current: TeachingSession,
  event: TeachingEvent,
): TeachingSession {
  if (
    current.moduleId !== def.moduleId ||
    current.exerciseId !== def.exerciseId
  )
    return current
  const next = cloneState(current)
  const example =
    current.phase === 'transfer' || current.phase === 'learned'
      ? def.transfer
      : def.demo
  const passes = () =>
    replayEvidence(example.initial, current.state, current.events) &&
    current.events.some((e) => e.accepted) &&
    current.events.every(
      (e) => !e.accepted || def.allowedOperations.includes(e.operation),
    ) &&
    example.goal(current.state, current.events)
  switch (event.type) {
    case 'start':
      if (current.phase === 'intro') next.phase = 'demonstrate'
      break
    case 'hint':
      next.hintLevel = Math.min(3, current.hintLevel + 1)
      break
    case 'operate':
      if (
        !['demonstrate', 'transfer'].includes(current.phase) ||
        !def.allowedOperations.includes(event.action.operation) ||
        current.events.length >= 128
      )
        return current
      {
        const step = applyOperation(
          current.state,
          event.action,
          current.events.length,
        )
        next.events.push(step)
        next.state = step.after
      }
      break
    case 'submit-demo':
      if (current.phase === 'demonstrate' && passes())
        next.phase = 'correct-rule'
      break
    case 'rule':
      if (
        !['correct-rule', 'transfer-ready', 'transfer'].includes(current.phase)
      )
        return current
      next.ruleId = event.ruleId
      next.reasonId = event.reasonId
      next.phase =
        event.ruleId === def.ruleId && event.reasonId === def.reasonId
          ? 'transfer-ready'
          : 'correct-rule'
      next.state = cloneState(def.demo.initial)
      next.events = []
      break
    case 'start-transfer':
      if (current.phase !== 'transfer-ready') return current
      next.phase = 'transfer'
      next.state = cloneState(def.transfer.initial)
      next.events = []
      break
    case 'submit-transfer':
      if (
        current.phase === 'transfer' &&
        current.ruleId === def.ruleId &&
        current.reasonId === def.reasonId &&
        passes()
      )
        next.phase = 'learned'
      break
    case 'reset':
      if (current.phase === 'transfer') {
        next.state = cloneState(def.transfer.initial)
        next.events = []
      } else
        return {
          ...newTeachingSession(def),
          phase: 'demonstrate',
          hintLevel: current.hintLevel,
        }
      break
    case 'replay':
      return newTeachingSession(def)
  }
  return next
}
