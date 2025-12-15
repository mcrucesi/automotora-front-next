import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renderiza el botón con el texto correcto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('aplica la variante primary por defecto', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-500');
  });

  it('aplica la variante accent cuando se especifica', () => {
    render(<Button variant="accent">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent-500');
  });

  it('aplica la variante outline cuando se especifica', () => {
    render(<Button variant="outline">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-2');
  });

  it('aplica el tamaño md por defecto', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6');
  });

  it('aplica el tamaño sm cuando se especifica', () => {
    render(<Button size="sm">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4');
  });

  it('aplica el tamaño lg cuando se especifica', () => {
    render(<Button size="lg">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-8');
  });

  it('ejecuta onClick cuando se hace clic', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta onClick cuando está deshabilitado', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('está deshabilitado cuando disabled es true', () => {
    render(<Button disabled>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('acepta className personalizado', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('pasa props HTML adicionales al elemento button', () => {
    render(
      <Button type="submit" data-testid="submit-btn">
        Submit
      </Button>
    );
    const button = screen.getByTestId('submit-btn');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
