import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NdaForm from '@/components/NdaForm';
import { defaultFormData, type NdaFormData } from '@/lib/types';

function renderForm(data: NdaFormData = defaultFormData, onChange = jest.fn()) {
  return { onChange, ...render(<NdaForm data={data} onChange={onChange} />) };
}

// Wrapper that manages state so controlled inputs accumulate typed text correctly
function ControlledForm({ initial = defaultFormData }: { initial?: NdaFormData }) {
  const [data, setData] = React.useState(initial);
  return <NdaForm data={data} onChange={setData} />;
}

describe('NdaForm — rendering', () => {
  it('renders the Agreement Details section heading', () => {
    renderForm();
    expect(screen.getByText('Agreement Details')).toBeInTheDocument();
  });

  it('renders the MNDA Modifications section heading', () => {
    renderForm();
    expect(screen.getByText('MNDA Modifications')).toBeInTheDocument();
  });

  it('renders Party 1 section heading', () => {
    renderForm();
    expect(screen.getByText('Party 1')).toBeInTheDocument();
  });

  it('renders Party 2 section heading', () => {
    renderForm();
    expect(screen.getByText('Party 2')).toBeInTheDocument();
  });

  it('renders Purpose label and textarea with default value', () => {
    renderForm();
    expect(screen.getByText('Purpose')).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultFormData.purpose)).toBeInTheDocument();
  });

  it('renders Effective Date label and input with default value', () => {
    renderForm();
    expect(screen.getByText('Effective Date')).toBeInTheDocument();
    const dateInput = screen.getAllByDisplayValue(defaultFormData.effectiveDate);
    expect(dateInput.length).toBeGreaterThan(0);
  });

  it('renders Governing Law input with placeholder', () => {
    renderForm();
    expect(screen.getByPlaceholderText('e.g. Delaware')).toBeInTheDocument();
  });

  it('renders Jurisdiction input with placeholder', () => {
    renderForm();
    expect(screen.getByPlaceholderText('e.g. New Castle, DE')).toBeInTheDocument();
  });

  it('renders two Full name inputs (one per party)', () => {
    renderForm();
    expect(screen.getAllByPlaceholderText('Full name')).toHaveLength(2);
  });

  it('renders two Company name inputs (one per party)', () => {
    renderForm();
    expect(screen.getAllByPlaceholderText('Company name')).toHaveLength(2);
  });

  it('renders two Job title inputs (one per party)', () => {
    renderForm();
    expect(screen.getAllByPlaceholderText('Job title')).toHaveLength(2);
  });

  it('renders modifications textarea with placeholder', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Leave blank if none')).toBeInTheDocument();
  });

  it('populates governing law input when data has governingLaw', () => {
    renderForm({ ...defaultFormData, governingLaw: 'California' });
    expect(screen.getByDisplayValue('California')).toBeInTheDocument();
  });

  it('populates party1 name when data has party1.name', () => {
    renderForm({ ...defaultFormData, party1: { ...defaultFormData.party1, name: 'Alice' } });
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });
});

describe('NdaForm — MNDA Term radio buttons', () => {
  it('first radio (expires) is checked by default', () => {
    renderForm();
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it('number input for MNDA term years is enabled by default (expires selected)', () => {
    renderForm();
    const spinners = screen.getAllByRole('spinbutton');
    expect(spinners[0]).not.toBeDisabled();
  });

  it('number input for MNDA term years is disabled when continues is selected', () => {
    renderForm({ ...defaultFormData, mndaTermType: 'continues' });
    const spinners = screen.getAllByRole('spinbutton');
    expect(spinners[0]).toBeDisabled();
  });

  it('selecting continues radio calls onChange with mndaTermType: continues', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();
    const radios = screen.getAllByRole('radio');
    await user.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mndaTermType: 'continues' })
    );
  });

  it('selecting expires radio calls onChange with mndaTermType: expires', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm({ ...defaultFormData, mndaTermType: 'continues' });
    const radios = screen.getAllByRole('radio');
    await user.click(radios[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mndaTermType: 'expires' })
    );
  });
});

describe('NdaForm — Confidentiality Term radio buttons', () => {
  it('confidentiality years radio is checked by default', () => {
    renderForm();
    const radios = screen.getAllByRole('radio');
    // Indices: 0=mnda expires, 1=mnda continues, 2=conf years, 3=conf perpetual
    expect(radios[2]).toBeChecked();
    expect(radios[3]).not.toBeChecked();
  });

  it('confidentiality number input is disabled when perpetual is selected', () => {
    renderForm({ ...defaultFormData, confidentialityTermType: 'perpetual' });
    const spinners = screen.getAllByRole('spinbutton');
    // spinners[0]=mnda years, spinners[1]=conf years
    expect(spinners[1]).toBeDisabled();
  });

  it('selecting perpetual calls onChange with confidentialityTermType: perpetual', async () => {
    const user = userEvent.setup();
    const { onChange } = renderForm();
    const radios = screen.getAllByRole('radio');
    await user.click(radios[3]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ confidentialityTermType: 'perpetual' })
    );
  });
});

// Note: all onChange tests use ControlledForm so state updates and the input
// accumulates text correctly (controlled inputs need re-renders to accept typed text).
describe('NdaForm — text field onChange', () => {
  it('typing in Purpose accumulates text in the textarea', async () => {
    const user = userEvent.setup();
    render(<ControlledForm initial={{ ...defaultFormData, purpose: '' }} />);
    const textareas = screen.getAllByRole('textbox');
    // Purpose textarea is the first textbox (before Modifications)
    await user.type(textareas[0], 'Joint venture');
    expect(screen.getByDisplayValue('Joint venture')).toBeInTheDocument();
  });

  it('typing in Governing Law accumulates text correctly', async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    await user.type(screen.getByPlaceholderText('e.g. Delaware'), 'Texas');
    expect(screen.getByDisplayValue('Texas')).toBeInTheDocument();
  });

  it('typing in Jurisdiction accumulates text correctly', async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    await user.type(screen.getByPlaceholderText('e.g. New Castle, DE'), 'Austin, TX');
    expect(screen.getByDisplayValue('Austin, TX')).toBeInTheDocument();
  });

  it('typing in Party 1 name accumulates text correctly', async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    const nameInputs = screen.getAllByPlaceholderText('Full name');
    await user.type(nameInputs[0], 'Alice');
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  it('typing in Party 2 name does not affect Party 1 name', async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    const nameInputs = screen.getAllByPlaceholderText('Full name');
    await user.type(nameInputs[1], 'Bob');
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
    // Party 1 name input should remain empty
    expect(nameInputs[0]).toHaveValue('');
  });

  it('typing in Party 1 company accumulates text correctly', async () => {
    const user = userEvent.setup();
    render(<ControlledForm />);
    const companyInputs = screen.getAllByPlaceholderText('Company name');
    await user.type(companyInputs[0], 'Acme Corp');
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
  });

  it('typing in Jurisdiction does not clear Governing Law', async () => {
    const user = userEvent.setup();
    render(<ControlledForm initial={{ ...defaultFormData, governingLaw: 'Florida' }} />);
    await user.type(screen.getByPlaceholderText('e.g. New Castle, DE'), 'Miami');
    // governingLaw should be preserved
    expect(screen.getByDisplayValue('Florida')).toBeInTheDocument();
  });
});
