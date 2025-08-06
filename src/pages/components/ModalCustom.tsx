import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  width = 400,
  children,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <Box sx={{ ...style, width }}>
        {title && (
          <Typography id="custom-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
        )}
        <Box sx={{ mt: 2 }} id="custom-modal-description">
          {children}
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
