import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, title, message, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Confirm</Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
