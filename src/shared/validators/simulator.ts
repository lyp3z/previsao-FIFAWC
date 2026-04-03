import { z } from 'zod';

export const matchOverrideSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export const simulatorPayloadSchema = z.object({
  overrides: z.array(matchOverrideSchema).default([]),
  teamId: z.string().optional(),
});

export type SimulatorPayload = z.infer<typeof simulatorPayloadSchema>;
