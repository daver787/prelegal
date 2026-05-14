export type DocumentType =
  | 'mutual_nda'
  | 'mutual_nda_coverpage'
  | 'csa'
  | 'design_partner'
  | 'psa'
  | 'software_license'
  | 'partnership'
  | 'pilot';

export const DOC_LABELS: Record<DocumentType, string> = {
  mutual_nda: 'Mutual NDA',
  mutual_nda_coverpage: 'Mutual NDA Cover Page',
  csa: 'Cloud Service Agreement',
  design_partner: 'Design Partner Agreement',
  psa: 'Professional Services Agreement',
  software_license: 'Software License Agreement',
  partnership: 'Partnership Agreement',
  pilot: 'Pilot Agreement',
};

export interface PartyDetails {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

const emptyParty: PartyDetails = { name: '', title: '', company: '', noticeAddress: '', date: '' };

export interface AgreementData {
  documentType: DocumentType | null;

  // NDA-specific
  purpose: string;
  mndaTermType: 'expires' | 'continues';
  mndaTermYears: number;
  confidentialityTermType: 'years' | 'perpetual';
  confidentialityTermYears: number;
  jurisdiction: string;
  modifications: string;

  // Shared
  effectiveDate: string;
  governingLaw: string;
  chosenCourts: string;

  // Party slots
  party1: PartyDetails;
  party2: PartyDetails;
  provider: PartyDetails;
  customer: PartyDetails;
  partner: PartyDetails;
  company: PartyDetails;

  // Liability caps
  generalCapAmount: string;
  increasedCapAmount: string;
  increasedClaims: string;
  unlimitedClaims: string;
  providerCoveredClaims: string;
  customerCoveredClaims: string;
  additionalWarranties: string;

  // Services / commercial
  deliverables: string;
  rejectionPeriod: string;
  fees: string;
  paymentPeriod: string;
  paymentProcess: string;

  // Partnership
  endDate: string;
  obligations: string;
  territory: string;
  brandGuidelines: string;

  // Design Partner
  term: string;
  program: string;

  // Software License
  subscriptionPeriod: string;
  permittedUses: string;
  licenseLimits: string;
  warrantyPeriod: string;

  // Pilot
  pilotPeriod: string;
}

export const defaultFormData: AgreementData = {
  documentType: null,
  purpose: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  mndaTermType: 'expires',
  mndaTermYears: 1,
  confidentialityTermType: 'years',
  confidentialityTermYears: 1,
  jurisdiction: '',
  modifications: '',
  governingLaw: '',
  chosenCourts: '',
  party1: { ...emptyParty },
  party2: { ...emptyParty },
  provider: { ...emptyParty },
  customer: { ...emptyParty },
  partner: { ...emptyParty },
  company: { ...emptyParty },
  generalCapAmount: '',
  increasedCapAmount: '',
  increasedClaims: '',
  unlimitedClaims: '',
  providerCoveredClaims: '',
  customerCoveredClaims: '',
  additionalWarranties: '',
  deliverables: '',
  rejectionPeriod: '',
  fees: '',
  paymentPeriod: '',
  paymentProcess: '',
  endDate: '',
  obligations: '',
  territory: '',
  brandGuidelines: '',
  term: '',
  program: '',
  subscriptionPeriod: '',
  permittedUses: '',
  licenseLimits: '',
  warrantyPeriod: '',
  pilotPeriod: '',
};

// Keep NdaFormData as an alias for backward compatibility within this file
export type NdaFormData = AgreementData;
