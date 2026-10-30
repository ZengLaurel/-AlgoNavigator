export const STACK_HARNESS = String.raw`
class MyStack:
    def __init__(self):
        self.items = []

    def push(self, value):
        self.items.append(value)

    def pop(self):
        if not self.items:
            raise IndexError("pop from empty stack")
        return self.items.pop()

    def peek(self):
        if not self.items:
            raise IndexError("peek from empty stack")
        return self.items[-1]


def _read_state(stack):
    return list(stack.items)
`

export const STACK_STATE_EXPRESSION = '_read_state(stack)'
