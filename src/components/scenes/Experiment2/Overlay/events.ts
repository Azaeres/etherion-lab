import { createEvent } from 'react-event-hook'

export const { emitOverlayClick, useOverlayClickListener } = createEvent('overlayClick')<
  KeyboardEvent | MouseEvent
>()
