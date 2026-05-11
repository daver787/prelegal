import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import NdaPreview from '@/components/NdaPreview';
import { defaultFormData } from '@/lib/types';

describe('NdaPreview — document structure', () => {
  it('renders the document title', () => {
    render(<NdaPreview data={defaultFormData} />);
    expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
  });

  it('renders the Cover Page subtitle', () => {
    render(<NdaPreview data={defaultFormData} />);
    // "Cover Page" also appears as bold text inside the Standard Terms clause text
    expect(screen.getAllByText('Cover Page').length).toBeGreaterThan(0);
  });

  it('renders the Standard Terms heading', () => {
    render(<NdaPreview data={defaultFormData} />);
    expect(screen.getByText('Standard Terms')).toBeInTheDocument();
  });

  it('has the #nda-preview-content element for PDF capture', () => {
    const { container } = render(<NdaPreview data={defaultFormData} />);
    expect(container.querySelector('#nda-preview-content')).toBeInTheDocument();
  });

  it('renders the USING THIS AGREEMENT intro block', () => {
    render(<NdaPreview data={defaultFormData} />);
    expect(screen.getByText(/USING THIS MUTUAL NON-DISCLOSURE AGREEMENT/)).toBeInTheDocument();
  });

  it('renders PARTY 1 and PARTY 2 table headers', () => {
    render(<NdaPreview data={defaultFormData} />);
    expect(screen.getByText('PARTY 1')).toBeInTheDocument();
    expect(screen.getByText('PARTY 2')).toBeInTheDocument();
  });

  it('renders the signature row labels', () => {
    render(<NdaPreview data={defaultFormData} />);
    expect(screen.getByText('Signature')).toBeInTheDocument();
    expect(screen.getAllByText('Print Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Company').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Date').length).toBeGreaterThan(0);
  });

  it('renders CC BY 4.0 attribution at least twice (cover page + standard terms)', () => {
    render(<NdaPreview data={defaultFormData} />);
    const links = screen.getAllByText('CC BY 4.0');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the signing intro sentence', () => {
    render(<NdaPreview data={defaultFormData} />);
    expect(
      screen.getByText(/By signing this Cover Page, each party agrees/)
    ).toBeInTheDocument();
  });
});

describe('NdaPreview — all 11 Standard Terms clauses', () => {
  const clauseTitles = [
    'Introduction',
    'Use and Protection of Confidential Information',
    'Exceptions',
    'Disclosures Required by Law',
    'Term and Termination',
    'Return or Destruction of Confidential Information',
    'Proprietary Rights',
    'Disclaimer',
    'Governing Law and Jurisdiction',
    'Equitable Relief',
    'General',
  ];

  clauseTitles.forEach((title) => {
    it(`renders clause "${title}"`, () => {
      render(<NdaPreview data={defaultFormData} />);
      expect(screen.getByText(new RegExp(title))).toBeInTheDocument();
    });
  });
});

describe('NdaPreview — Cover Page field rendering', () => {
  it('renders the default purpose value', () => {
    render(<NdaPreview data={defaultFormData} />);
    // purpose appears at least once in the cover page
    expect(
      screen.getAllByText(defaultFormData.purpose).length
    ).toBeGreaterThan(0);
  });

  it('renders governing law placeholder when empty', () => {
    render(<NdaPreview data={{ ...defaultFormData, governingLaw: '' }} />);
    expect(screen.getAllByText('[Fill in state]').length).toBeGreaterThan(0);
  });

  it('renders filled governing law when provided', () => {
    render(<NdaPreview data={{ ...defaultFormData, governingLaw: 'Delaware' }} />);
    expect(screen.getAllByText('Delaware').length).toBeGreaterThan(0);
  });

  it('renders jurisdiction placeholder when empty', () => {
    render(<NdaPreview data={{ ...defaultFormData, jurisdiction: '' }} />);
    expect(screen.getAllByText('[Fill in city or county and state]').length).toBeGreaterThan(0);
  });

  it('renders filled jurisdiction when provided', () => {
    render(<NdaPreview data={{ ...defaultFormData, jurisdiction: 'Wilmington, DE' }} />);
    expect(screen.getAllByText('Wilmington, DE').length).toBeGreaterThan(0);
  });

  it('renders effective date formatted as long locale string', () => {
    render(<NdaPreview data={{ ...defaultFormData, effectiveDate: '2026-06-15' }} />);
    expect(screen.getAllByText('June 15, 2026').length).toBeGreaterThan(0);
  });

  it('renders fallback when effective date is empty', () => {
    render(<NdaPreview data={{ ...defaultFormData, effectiveDate: '' }} />);
    // Shows "Today's date" italicized placeholder
    expect(screen.getByText("Today's date")).toBeInTheDocument();
  });
});

describe('NdaPreview — MNDA Term display', () => {
  it('shows singular year when mndaTermYears is 1', () => {
    render(<NdaPreview data={{ ...defaultFormData, mndaTermType: 'expires', mndaTermYears: 1 }} />);
    expect(screen.getByText('Expires 1 year from Effective Date.')).toBeInTheDocument();
  });

  it('shows plural years when mndaTermYears is 2', () => {
    render(<NdaPreview data={{ ...defaultFormData, mndaTermType: 'expires', mndaTermYears: 2 }} />);
    expect(screen.getByText('Expires 2 years from Effective Date.')).toBeInTheDocument();
  });

  it('shows continues-until-terminated text when mndaTermType is continues', () => {
    render(<NdaPreview data={{ ...defaultFormData, mndaTermType: 'continues' }} />);
    expect(
      screen.getByText(/Continues until terminated in accordance with the terms of the MNDA/)
    ).toBeInTheDocument();
  });
});

describe('NdaPreview — Confidentiality Term display', () => {
  it('shows singular year when confidentialityTermYears is 1', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, confidentialityTermType: 'years', confidentialityTermYears: 1 }}
      />
    );
    // This text appears in both the cover page table row AND as a token span in clause 5
    expect(
      screen.getAllByText(/^1 year from Effective Date/).length
    ).toBeGreaterThan(0);
  });

  it('shows plural years when confidentialityTermYears is 3', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, confidentialityTermType: 'years', confidentialityTermYears: 3 }}
      />
    );
    // This text appears in both the cover page table row AND as a token span in clause 5
    expect(
      screen.getAllByText(/^3 years from Effective Date/).length
    ).toBeGreaterThan(0);
  });

  it('shows In perpetuity when confidentialityTermType is perpetual', () => {
    render(<NdaPreview data={{ ...defaultFormData, confidentialityTermType: 'perpetual' }} />);
    expect(screen.getByText('In perpetuity.')).toBeInTheDocument();
  });
});

describe('NdaPreview — Signature table party details', () => {
  it('renders party1 name in the signature table', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, party1: { ...defaultFormData.party1, name: 'Alice Smith' } }}
      />
    );
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders party2 name in the signature table', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, party2: { ...defaultFormData.party2, name: 'Bob Jones' } }}
      />
    );
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('renders party1 company', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, party1: { ...defaultFormData.party1, company: 'Acme Corp' } }}
      />
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders party2 company', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, party2: { ...defaultFormData.party2, company: 'Globex' } }}
      />
    );
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('renders party1 title', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, party1: { ...defaultFormData.party1, title: 'CEO' } }}
      />
    );
    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('renders party1 notice address', () => {
    render(
      <NdaPreview
        data={{
          ...defaultFormData,
          party1: { ...defaultFormData.party1, noticeAddress: 'alice@example.com' },
        }}
      />
    );
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders formatted party1 date when set', () => {
    render(
      <NdaPreview
        data={{ ...defaultFormData, party1: { ...defaultFormData.party1, date: '2026-06-01' } }}
      />
    );
    // Date formatted as locale short date
    expect(screen.getByText('6/1/2026')).toBeInTheDocument();
  });
});

describe('NdaPreview — MNDA Modifications', () => {
  it('renders modifications row when modifications text is provided', () => {
    render(<NdaPreview data={{ ...defaultFormData, modifications: 'Section 3 is modified.' }} />);
    expect(screen.getByText('Section 3 is modified.')).toBeInTheDocument();
    expect(screen.getByText('MNDA Modifications')).toBeInTheDocument();
  });

  it('does NOT render the MNDA Modifications row when modifications is empty', () => {
    render(<NdaPreview data={{ ...defaultFormData, modifications: '' }} />);
    expect(screen.queryByText('MNDA Modifications')).not.toBeInTheDocument();
  });
});

describe('NdaPreview — token interpolation in Standard Terms', () => {
  it('shows custom purpose value inside Standard Terms clauses', () => {
    const purpose = 'Exploring a joint venture';
    render(<NdaPreview data={{ ...defaultFormData, purpose }} />);
    // The purpose appears in clause 1 and clause 2 as highlighted spans
    const allMatches = screen.getAllByText(purpose);
    expect(allMatches.length).toBeGreaterThanOrEqual(2); // cover page + at least 2 in standard terms
  });

  it('shows governing law value inside clause 9', () => {
    render(<NdaPreview data={{ ...defaultFormData, governingLaw: 'Nevada' }} />);
    const matches = screen.getAllByText('Nevada');
    // Nevada appears in cover page AND twice in clause 9
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it('shows jurisdiction value inside clause 9', () => {
    render(<NdaPreview data={{ ...defaultFormData, jurisdiction: 'Clark County, NV' }} />);
    const matches = screen.getAllByText('Clark County, NV');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});
