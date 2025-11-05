import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

/**
 * Button text constants
 */
const BUTTON_TEXT = {
  no: '아니오',
  yes: '예',
} as const;

/**
 * Props for the RecurringEventDialog component
 */
interface RecurringEventDialogProps {
  title: string;
  message: string;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback fired when the dialog should be closed */
  onClose: () => void;
  /** Callback fired when user confirms an action */
  onConfirm: (editSingleOnly: boolean) => void;
  /** The operation mode */
}

/**
 * Dialog component for handling recurring event operations
 * Allows users to choose between single instance or series-wide operations
 */
const RecurringEventDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: RecurringEventDialogProps) => {
  /**
   * Handles the "Yes" button click - operates on single instance only
   */
  const handleSingleOperation = () => {
    onConfirm(true); // true = single instance operation
  };

  /**
   * Handles the "No" button click - operates on entire series
   */
  const handleSeriesOperation = () => {
    onConfirm(false); // false = series-wide operation
  };

  // Early return for closed dialog
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="recurring-event-dialog-title"
      aria-describedby="recurring-event-dialog-description"
    >
      <DialogTitle id="recurring-event-dialog-title">{title}</DialogTitle>

      <DialogContent>
        <Typography id="recurring-event-dialog-description">{message}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSeriesOperation} variant="outlined" color="primary">
          {BUTTON_TEXT.no}
        </Button>
        <Button onClick={handleSingleOperation} variant="contained" color="primary">
          {BUTTON_TEXT.yes}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringEventDialog;
