export interface PartyDetails {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

export interface NdaFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: 'expires' | 'continues';
  mndaTermYears: number;
  confidentialityTermType: 'years' | 'perpetual';
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyDetails;
  party2: PartyDetails;
}

export const defaultFormData: NdaFormData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
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
};
