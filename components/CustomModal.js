import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomModal = ({
  show,
  onHide,
  title,
  message,
  type = 'info', // 'info', 'success', 'warning', 'danger', 'confirm'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}) => {
  const getVariant = () => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'confirm': return 'primary';
      default: return 'info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'danger': return '❌';
      case 'confirm': return '❓';
      default: return 'ℹ️';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
        <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5em' }}>{getIcon()}</span>
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '20px', textAlign: 'center' }}>
        <Alert variant={getVariant()} style={{ border: 'none', fontSize: '16px' }}>
          {message}
        </Alert>
      </Modal.Body>
      
      <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6', justifyContent: 'center' }}>
        {showCancel && (
          <Button variant="secondary" onClick={onHide} style={{ minWidth: '100px' }}>
            {cancelText}
          </Button>
        )}
        <Button 
          variant={type === 'danger' ? 'danger' : 'primary'} 
          onClick={handleConfirm}
          style={{ minWidth: '100px' }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

CustomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'confirm']),
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  showCancel: PropTypes.bool,
};

CustomModal.defaultProps = {
  title: '',
  message: '',
  type: 'info',
  onConfirm: null,
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
};

export default CustomModal; 