import { useEffect, useRef, useState } from 'react';
import { Box, Select } from '@mui/material';
import type { SelectProps } from '@mui/material';
import type { PopoverActions } from '@mui/material/Popover';

const AnchoredSelect = ({ onOpen, onClose, MenuProps, ...props }: SelectProps<any>) => {
  const actionRef = useRef<PopoverActions | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const update = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest?.('.MuiMenu-paper') ||
          target.closest?.('.MuiPopover-paper') ||
          target.closest?.('.MuiPaper-root'))
      ) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const enforcePosition = (element: HTMLElement) => {
    if (!containerRef.current || !element) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // ALWAYS start strictly from the bottom of the input container box
    const top = rect.bottom + 4;
    const availableSpaceBelow = Math.max(120, viewportHeight - top - 16);
    const maxHeight = Math.min(260, availableSpaceBelow);

    element.style.setProperty('position', 'fixed', 'important');
    element.style.setProperty('top', `${top}px`, 'important');
    element.style.setProperty('left', `${Math.max(10, rect.left)}px`, 'important');
    element.style.setProperty('transform', 'none', 'important');
    element.style.setProperty('max-height', `${maxHeight}px`, 'important');
    element.style.setProperty('overflow', 'hidden', 'important');

    if (props.fullWidth || containerRef.current.offsetWidth) {
      element.style.setProperty('min-width', `${containerRef.current.offsetWidth}px`, 'important');
    }

    const menuList = element.querySelector('.MuiMenu-list') as HTMLElement | null;
    if (menuList) {
      menuList.style.setProperty('max-height', `${maxHeight}px`, 'important');
      menuList.style.setProperty('overflow-y', 'auto', 'important');
    }
  };

  const handleEntering = (element: HTMLElement, isAppearing: boolean) => {
    enforcePosition(element);
    if (typeof MenuProps?.TransitionProps?.onEntering === 'function') {
      MenuProps.TransitionProps.onEntering(element, isAppearing);
    }
  };

  const handleEntered = (element: HTMLElement, isAppearing: boolean) => {
    enforcePosition(element);
    if (typeof MenuProps?.TransitionProps?.onEntered === 'function') {
      MenuProps.TransitionProps.onEntered(element, isAppearing);
    }
  };

  return (
    <Box ref={containerRef} sx={{ width: props.fullWidth ? '100%' : 'auto', position: 'relative' }}>
      <Select
        {...props}
        open={open}
        onOpen={(e) => {
          setOpen(true);
          onOpen?.(e);
        }}
        onClose={(e) => {
          setOpen(false);
          onClose?.(e);
        }}
        MenuProps={{
          disableScrollLock: true,
          ...MenuProps,
          TransitionProps: {
            ...MenuProps?.TransitionProps,
            onEntering: handleEntering,
            onEntered: handleEntered,
          },
          action: (a) => {
            actionRef.current = a;
            if (typeof MenuProps?.action === 'function') {
              MenuProps.action(a);
            }
          },
        }}
      />
    </Box>
  );
};

export default AnchoredSelect;
