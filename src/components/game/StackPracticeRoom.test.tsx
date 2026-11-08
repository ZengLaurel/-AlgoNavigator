import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StackPracticeRoom } from './StackPracticeRoom'

const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
function demonstrateBuild() {
  ;['push', 'pop', 'push', 'push', 'pop', 'push'].forEach(click)
}
describe('Teach Xiao Tuo learning loop', () => {
  it('requires comparing repaired messages rather than accepting trace completion alone', () => {
    render(<StackPracticeRoom mastered={[]} onMastered={vi.fn()} />)
    click('844 · Repair two messages')
    ;['push', 'push', 'pop', 'push', 'push', 'push'].forEach(click)
    click('Explain to Xiao Tuo')
    expect(
      screen.queryByRole('button', { name: 'Let Xiao Tuo try a new example' }),
    ).toBeNull()
    fireEvent.change(
      screen.getByLabelText('Are the repaired messages equal?'),
      { target: { value: 'false' } },
    )
    click('Explain to Xiao Tuo')
    expect(
      screen.queryByRole('button', { name: 'Let Xiao Tuo try a new example' }),
    ).toBeNull()
    fireEvent.change(
      screen.getByLabelText('Are the repaired messages equal?'),
      { target: { value: 'true' } },
    )
    click('Explain to Xiao Tuo')
    expect(
      screen.getByRole('button', { name: 'Let Xiao Tuo try a new example' }),
    ).toBeTruthy()
  })
  it('presents four sourced activities, a clearly labelled mistaken sprite and progressive hints', () => {
    render(<StackPracticeRoom mastered={[]} onMastered={vi.fn()} />)
    expect(screen.getByText(/mistaken guess/)).toBeTruthy()
    expect(
      screen.getAllByRole('button', { name: /1441|844|2390|1047/ }),
    ).toHaveLength(4)
    expect(
      screen
        .getByRole('link', { name: /Source: LeetCode 1441/ })
        .getAttribute('href'),
    ).toContain('build-an-array')
    click('Show hint 1 of 3')
    expect(
      screen.getByText('The right end of the tower is its top.'),
    ).toBeTruthy()
    expect(
      screen.queryByText(
        'Even an unwanted crate must be pushed before it can be removed.',
      ),
    ).toBeNull()
  })
  it('does not advance after a wrong operation or peek and never awards mastery for hints', () => {
    const mastered = vi.fn()
    render(<StackPracticeRoom mastered={[]} onMastered={mastered} />)
    click('ignore')
    click('peek')
    expect(
      screen.getByRole('img', { name: /Stack bottom to top: empty/ }),
    ).toBeTruthy()
    expect(screen.getByText(/Read 0 symbols/)).toBeTruthy()
    expect(mastered).not.toHaveBeenCalled()
  })
  it('requires demonstration, correct teaching, and a fresh transfer before Xiao Tuo learns', () => {
    const mastered = vi.fn()
    render(<StackPracticeRoom mastered={[]} onMastered={mastered} />)
    demonstrateBuild()
    click('Explain to Xiao Tuo')
    click('Let Xiao Tuo try a new example')
    expect(screen.getByRole('status').textContent).toContain(
      'Try correcting both',
    )
    expect(mastered).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Which item leaves first?'), {
      target: { value: 'lifo' },
    })
    fireEvent.change(screen.getByLabelText('Why?'), {
      target: { value: 'top' },
    })
    click('Let Xiao Tuo try a new example')
    expect(screen.getByText('3. Try a fresh example')).toBeTruthy()
    expect(mastered).not.toHaveBeenCalled()
    ;['push', 'push', 'pop', 'push', 'push', 'pop', 'push'].forEach(click)
    click('Check the fresh example')
    expect(mastered).toHaveBeenCalledWith('build')
    expect(screen.getByText(/Xiao Tuo: Aha!/)).toBeTruthy()
    expect(
      (
        screen.getByRole('button', {
          name: 'push',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
  })
  it('resets example, hints and explanation on exercise switch and restart', () => {
    render(<StackPracticeRoom mastered={[]} onMastered={vi.fn()} />)
    click('push')
    click('Show hint 1 of 3')
    click('844 · Repair two messages')
    expect(screen.getByText(/Read 0 symbols/)).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Show hint 1 of 3' }),
    ).toBeTruthy()
    click('push')
    click('Restart this teaching activity')
    expect(
      screen.getByRole('img', { name: /Stack bottom to top: empty/ }),
    ).toBeTruthy()
  })
})
