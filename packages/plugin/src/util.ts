import type { Protocol } from 'playwright/types/protocol'

export type CDPSessionListener<EventName extends keyof Protocol.Events> = (
  payload: Protocol.Events[EventName],
) => void
