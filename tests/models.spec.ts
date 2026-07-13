import type { WorkoutLog, WorkoutTemplate } from '@/types/models'

describe('core workout models', () => {
  it('supports workout template shape', () => {
    const template: WorkoutTemplate = {
      id: 1,
      name: '30-Min Chest & Shoulders',
      tags: ['Chest', 'Shoulders'],
      exercises: [10, 11],
    }

    expect(template.exercises).toHaveLength(2)
  })

  it('supports workout log shape', () => {
    const log: WorkoutLog = {
      id: 1,
      templateId: 1,
      date: new Date().toISOString(),
      exercises: [
        {
          exerciseId: 10,
          sets: [{ id: 100, reps: 8, weight: 70, completed: true }],
        },
      ],
    }

    expect(log.exercises[0].sets[0].completed).toBe(true)
  })
})
