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
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.bottom <= 10 || rect.top >= window.innerHeight - 10) {
          setOpen(false);
          return;
        }
      }
      actionRef.current?.updatePosition();
    };

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  return (
    <Box ref={containerRef} sx={{ width: props.fullWidth ? '100%' : 'auto', position: 'relative' }}>
      <Select
        {...props}
        open={open}
        onOpen={(e) => { setOpen(true); onOpen?.(e); }}
        onClose={(e) => { setOpen(false); onClose?.(e); }}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          disableScrollLock: true,
          ...MenuProps,
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
