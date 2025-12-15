import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('renderiza el badge con el texto correcto', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('aplica la variante primary por defecto', () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-primary-100');
  });

  it('aplica la variante success cuando se especifica', () => {
    render(<Badge variant="success">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-success-light');
  });

  it('aplica la variante error cuando se especifica', () => {
    render(<Badge variant="error">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('aplica la variante warning cuando se especifica', () => {
    render(<Badge variant="warning">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('aplica la variante accent cuando se especifica', () => {
    render(<Badge variant="accent">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-accent-100');
  });

  it('aplica la variante gray cuando se especifica', () => {
    render(<Badge variant="gray">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-gray-100');
  });

  it('acepta className personalizado', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renderiza como elemento span', () => {
    const { container } = render(<Badge>Badge</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
