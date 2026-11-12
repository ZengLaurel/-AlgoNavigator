/** Independent Python object state is compared with TypeScript evidence replay. */
export const MODULE_HARNESS = String.raw`
import json as _json
import copy as _copy
class TeachingStructure:
    def __init__(self, initial):
        self._state = _copy.deepcopy(initial)
        self._events = []
    def _perform(self, operation, args):
        if len(self._events) >= 128:
            raise ValueError('EVIDENCE_LIMIT')
        before = _copy.deepcopy(self._state)
        state = self._state
        returned = None
        error = None
        def fail(code):
            raise ValueError(code)
        def valid_value(value):
            import math
            return (isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)) or (isinstance(value, str) and len(value) <= 32)
        def new_id(items):
            n = len(self._events)
            while any(item['id'] == 'new-' + str(n) for item in items):
                n += 1
            return 'new-' + str(n)
        def node(id):
            found = next((n for n in state['nodes'] if n['id'] == id), None)
            if found is None: fail('INVALID_REFERENCE')
            return found
        def reachable():
            order = []
            id = state['head']
            while id is not None:
                if id in order: fail('CYCLE')
                order.append(id)
                id = node(id)['next']
            return order
        try:
            if state['kind'] == 'array':
                items = state['items']
                if operation == 'grow':
                    size = args['capacity']
                    if type(size) is not int or size <= state['capacity'] or size > 16: fail('INVALID_CAPACITY')
                    state['capacity'] = size
                elif operation == 'traverse':
                    returned = [i['value'] for i in items]
                else:
                    index = args['index']
                    if type(index) is not int or index < 0 or index >= len(items) + (1 if operation == 'insert' else 0): fail('INVALID_INDEX')
                    if operation in ('insert', 'set') and not valid_value(args['value']): fail('INVALID_VALUE')
                    if operation == 'get': returned = items[index]['value']
                    elif operation == 'set': items[index]['value'] = args['value']
                    elif operation == 'remove': returned = items.pop(index)['value']
                    elif operation == 'insert':
                        if len(items) >= state['capacity']: fail('CAPACITY_FULL')
                        items.insert(index, {'id': new_id(items), 'value': args['value']})
                    else: fail('INVALID_OPERATION')
            elif state['kind'] == 'queue':
                if operation == 'enqueue':
                    if not valid_value(args['value']): fail('INVALID_VALUE')
                    all_items = state['waiting'] + state['served']
                    if len(all_items) >= 16: fail('EVIDENCE_LIMIT')
                    state['waiting'].append({'id': new_id(all_items), 'value': args['value']})
                elif operation in ('peek', 'dequeue'):
                    if not state['waiting']: fail('EMPTY')
                    returned = state['waiting'][0]['value']
                    if operation == 'dequeue': state['served'].append(state['waiting'].pop(0))
                else: fail('INVALID_OPERATION')
            else:
                if operation == 'visit': returned = node(args['id'])['value']
                elif operation == 'setHead':
                    if args['id'] is not None: node(args['id'])
                    state['head'] = args['id']
                elif operation == 'link':
                    if args['nextId'] is not None: node(args['nextId'])
                    node(args['id'])['next'] = args['nextId']
                elif operation in ('insertHead', 'insertAfter'):
                    fresh = node(args['id'])
                    order = reachable()
                    if fresh['id'] in order or fresh['next'] is not None: fail('ALREADY_LINKED')
                    if operation == 'insertHead':
                        fresh['next'] = state['head']
                        state['head'] = fresh['id']
                    else:
                        if args['previousId'] not in order: fail('INVALID_REFERENCE')
                        previous = node(args['previousId'])
                        fresh['next'] = previous['next']
                        previous['next'] = fresh['id']
                elif operation == 'removeHead':
                    reachable()
                    if state['head'] is None: fail('EMPTY')
                    removed = node(state['head'])
                    state['head'] = removed['next']
                    returned = removed['value']
                    removed['next'] = None
                elif operation == 'removeAfter':
                    if args['previousId'] not in reachable(): fail('INVALID_REFERENCE')
                    previous = node(args['previousId'])
                    if previous['next'] is None: fail('EMPTY')
                    removed = node(previous['next'])
                    previous['next'] = removed['next']
                    returned = removed['value']
                    removed['next'] = None
                else: fail('INVALID_OPERATION')
        except ValueError as exc:
            error = str(exc)
            self._state = _copy.deepcopy(before)
            returned = None
        self._events.append(dict(sequence=len(self._events), operation=operation, args=args, before=before, after=_copy.deepcopy(self._state), returned=returned, accepted=error is None, errorCode=error))
        if error: raise ValueError(error)
        return returned
    def get(self, index): return self._perform('get', dict(index=index))
    def set(self, index, value): return self._perform('set', dict(index=index, value=value))
    def insert(self, index, value): return self._perform('insert', dict(index=index, value=value))
    def remove(self, index): return self._perform('remove', dict(index=index))
    def grow(self, capacity): return self._perform('grow', dict(capacity=capacity))
    def traverse(self): return self._perform('traverse', {})
    def enqueue(self, value): return self._perform('enqueue', dict(value=value))
    def dequeue(self): return self._perform('dequeue', {})
    def peek(self): return self._perform('peek', {})
    def visit(self, id): return self._perform('visit', dict(id=id))
    def setHead(self, id): return self._perform('setHead', dict(id=id))
    def link(self, id, nextId): return self._perform('link', dict(id=id, nextId=nextId))
    def insertHead(self, id): return self._perform('insertHead', dict(id=id))
    def insertAfter(self, previousId, id): return self._perform('insertAfter', dict(previousId=previousId, id=id))
    def removeHead(self): return self._perform('removeHead', {})
    def removeAfter(self, previousId): return self._perform('removeAfter', dict(previousId=previousId))
`
