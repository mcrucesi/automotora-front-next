import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('no renderiza cuando isOpen es false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renderiza cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('llama a onClose cuando se hace clic en el botón cerrar', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose cuando se hace clic en el backdrop', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const backdrop = document.querySelector('.bg-black');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('llama a onClose cuando se presiona Escape', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('aplica el tamaño md por defecto', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modal = document.querySelector('.max-w-2xl');
    expect(modal).toBeInTheDocument();
  });

  it('aplica el tamaño sm cuando se especifica', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="sm">
        <div>Modal content</div>
      </Modal>
    );

    const modal = document.querySelector('.max-w-md');
    expect(modal).toBeInTheDocument();
  });

  it('aplica el tamaño lg cuando se especifica', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="lg">
        <div>Modal content</div>
      </Modal>
    );

    const modal = document.querySelector('.max-w-4xl');
    expect(modal).toBeInTheDocument();
  });

  it('aplica el tamaño xl cuando se especifica', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="xl">
        <div>Modal content</div>
      </Modal>
    );

    const modal = document.querySelector('.max-w-6xl');
    expect(modal).toBeInTheDocument();
  });
});
