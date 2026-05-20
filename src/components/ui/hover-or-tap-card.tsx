import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

interface HoverOrTapCardProps {
  /** The element that opens the card. Behaves like HoverCardTrigger asChild — pass a single element (typically a <button>). */
  trigger: React.ReactElement;
  children: React.ReactNode;
  contentClassName?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  openDelay?: number;
  closeDelay?: number;
}

/**
 * A popover that opens on hover on devices with a mouse, and on tap/click
 * on touch devices. Built on Radix's Popover (which natively handles
 * click/tap, focus, outside-dismiss, and keyboard) plus pointer-aware
 * mouseenter/mouseleave handlers that only fire for `pointerType === 'mouse'`.
 *
 * Replaces our earlier HoverCard usage which was hover-only and so silently
 * did nothing on phones/tablets.
 */
export function HoverOrTapCard({
  trigger,
  children,
  contentClassName,
  align = 'center',
  sideOffset = 10,
  openDelay = 100,
  closeDelay = 140,
}: HoverOrTapCardProps) {
  const [open, setOpen] = React.useState(false);
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const clearOpenTimer = () => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };
  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleOpen = () => {
    clearCloseTimer();
    if (openTimer.current !== null || open) return;
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, openDelay);
  };
  const scheduleClose = () => {
    clearOpenTimer();
    if (closeTimer.current !== null) return;
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, closeDelay);
  };

  React.useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [],
  );

  // Only treat real mouse hovers as hover — touch pointers fall through to
  // Radix's click handling so taps still toggle reliably on phones.
  const triggerProps = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') scheduleOpen();
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') scheduleClose();
    },
  };

  const enhancedTrigger = React.cloneElement(trigger, triggerProps);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{enhancedTrigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') clearCloseTimer();
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') scheduleClose();
          }}
          className={cn(
            'z-50 rounded-[18px] border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            contentClassName,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
