import type {
  ProjectExecutionData,
  SequenceProjection,
} from '@/types/database'
import { buildProjection } from './projector'

export function buildSequence(input: ProjectExecutionData): SequenceProjection {
  return buildProjection(input)
}
