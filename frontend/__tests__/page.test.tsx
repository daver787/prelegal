import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock html2pdf.js dynamic import
jest.mock(
  'html2pdf.js',
  () => ({
    default: jest.fn(() => ({
      set: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      save: jest.fn().mockResolvedValue(undefined),
    })),
  }),
  { virtual: true }
);

import Home from '@/app/page';

describe('Home page — rendering', () => {
  it('renders the page header title', () => {
    render(<Home />);
    expect(screen.getByText('Mutual NDA Creator')).toBeInTheDocument();
  });

  it('renders the subtitle referencing Common Paper', () => {
    render(<Home />);
    // Exact match avoids matching the longer intro-block text in the preview
    expect(
      screen.getByText('Common Paper Mutual NDA Standard Terms Version 1.0')
    ).toBeInTheDocument();
  });

  it('renders the Download PDF button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
  });

  it('renders the form panel (Agreement Details section)', () => {
    render(<Home />);
    expect(screen.getByText('Agreement Details')).toBeInTheDocument();
  });

  it('renders the preview panel (Standard Terms heading)', () => {
    render(<Home />);
    expect(screen.getByText('Standard Terms')).toBeInTheDocument();
  });

  it('renders the NDA title in the preview', () => {
    render(<Home />);
    expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
  });

  it('Download PDF button is not disabled on initial render', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Download PDF/i })).not.toBeDisabled();
  });
});

describe('Home page — form and preview integration', () => {
  it('preview updates when Governing Law is typed into form', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const govLawInput = screen.getByPlaceholderText('e.g. Delaware');
    await user.type(govLawInput, 'Oregon');

    await waitFor(() => {
      const matches = screen.getAllByText('Oregon');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('preview updates when Jurisdiction is typed into form', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const jurisdictionInput = screen.getByPlaceholderText('e.g. New Castle, DE');
    await user.type(jurisdictionInput, 'Portland');

    await waitFor(() => {
      const matches = screen.getAllByText('Portland');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('preview party name updates when Party 1 name is typed', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const nameInputs = screen.getAllByPlaceholderText('Full name');
    await user.type(nameInputs[0], 'Jordan');

    await waitFor(() => {
      expect(screen.getByText('Jordan')).toBeInTheDocument();
    });
  });

  it('switching MNDA Term to continues updates preview text', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const radios = screen.getAllByRole('radio');
    await user.click(radios[1]); // continues radio

    // getByText with regex matches parent DOM nodes too, use getAllByText
    await waitFor(() => {
      expect(screen.getAllByText(/Continues until terminated/).length).toBeGreaterThan(0);
    });
  });

  it('switching confidentiality to perpetual updates preview', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const radios = screen.getAllByRole('radio');
    await user.click(radios[3]); // perpetual radio

    await waitFor(() => {
      // "In perpetuity." appears in cover page table; use getAllByText for safety
      expect(screen.getAllByText('In perpetuity.').length).toBeGreaterThan(0);
    });
  });

  it('entering modifications shows them in preview', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const modTextarea = screen.getByPlaceholderText('Leave blank if none');
    await user.type(modTextarea, 'Clause 3 modified');

    await waitFor(() => {
      // Text appears in both the textarea (as value) and the preview table cell
      expect(screen.getAllByText('Clause 3 modified').length).toBeGreaterThan(0);
    });
  });
});
