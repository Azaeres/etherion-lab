import { createEvent } from 'react-event-hook'

export const { emitMessage, useMessageListener } = createEvent('message')<
  KeyboardEvent | MouseEvent
>()
