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

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

// Mock fetch for AI chat API
const mockFetch = jest.fn();
global.fetch = mockFetch;

import Home from '@/app/page';

beforeEach(() => {
  localStorage.setItem('prelegal_logged_in', '1');
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      message: 'Thanks! What state should govern this agreement?',
      updatedData: {
        purpose: 'Evaluating a business partnership',
        effectiveDate: new Date().toISOString().split('T')[0],
        mndaTermType: 'expires',
        mndaTermYears: 1,
        confidentialityTermType: 'years',
        confidentialityTermYears: 1,
        governingLaw: '',
        jurisdiction: '',
        modifications: '',
        party1: { name: '', title: '', company: '', noticeAddress: '', date: '' },
        party2: { name: '', title: '', company: '', noticeAddress: '', date: '' },
      },
    }),
  });
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('Home page — rendering', () => {
  it('renders the page header title', () => {
    render(<Home />);
    expect(screen.getByText('Mutual NDA Creator')).toBeInTheDocument();
  });

  it('renders the subtitle referencing Common Paper', () => {
    render(<Home />);
    expect(
      screen.getByText('Common Paper Mutual NDA Standard Terms Version 1.0')
    ).toBeInTheDocument();
  });

  it('renders the Download PDF button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
  });

  it('Download PDF button is not disabled on initial render', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Download PDF/i })).not.toBeDisabled();
  });

  it('renders the AI Assistant panel', () => {
    render(<Home />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('renders the AI greeting message', () => {
    render(<Home />);
    expect(screen.getByText(/help you draft your Mutual NDA/i)).toBeInTheDocument();
  });

  it('renders the chat input field', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
  });

  it('renders the Send button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  it('renders the preview panel with NDA title', () => {
    render(<Home />);
    expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
  });

  it('renders Standard Terms in the preview', () => {
    render(<Home />);
    expect(screen.getByText('Standard Terms')).toBeInTheDocument();
  });
});

describe('Home page — chat interaction', () => {
  it('Send button is disabled when input is empty', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Send/i })).toBeDisabled();
  });

  it('Send button is enabled when user types a message', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'hello');

    expect(screen.getByRole('button', { name: /Send/i })).not.toBeDisabled();
  });

  it('submits message and shows AI reply', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'Evaluating a business partnership');
    await user.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText('Thanks! What state should govern this agreement?')).toBeInTheDocument();
    });
  });

  it('calls /api/chat with user message and current form data', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/chat');
    const body = JSON.parse(options.body);
    // greeting (index 0) is excluded; only real exchange turns are sent
    expect(body.messages.some((m: { role: string; content: string }) => m.content === 'Test message')).toBe(true);
    expect(body.messages.every((m: { role: string; content: string }) => !m.content.includes("help you draft"))).toBe(true);
  });

  it('shows error message when API call fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'hello');
    await user.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('preview updates when AI returns field updates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Got it!',
        updatedData: {
          purpose: 'Evaluating a business partnership',
          effectiveDate: new Date().toISOString().split('T')[0],
          mndaTermType: 'expires',
          mndaTermYears: 1,
          confidentialityTermType: 'years',
          confidentialityTermYears: 1,
          governingLaw: 'Delaware',
          jurisdiction: 'New Castle, DE',
          modifications: '',
          party1: { name: '', title: '', company: '', noticeAddress: '', date: '' },
          party2: { name: '', title: '', company: '', noticeAddress: '', date: '' },
        },
      }),
    });

    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'Use Delaware law');
    await user.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      const matches = screen.getAllByText('Delaware');
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
