'use client';

import type { AgreementData } from '@/lib/types';
import NdaPreview from './NdaPreview';
import CsaPreview from './CsaPreview';
import DesignPartnerPreview from './DesignPartnerPreview';
import PsaPreview from './PsaPreview';
import SoftwareLicensePreview from './SoftwareLicensePreview';
import PartnershipPreview from './PartnershipPreview';
import PilotPreview from './PilotPreview';
import WelcomePreview from './WelcomePreview';

interface Props {
  data: AgreementData;
}

export default function DocumentPreview({ data }: Props) {
  switch (data.documentType) {
    case 'mutual_nda':
    case 'mutual_nda_coverpage':
      return <NdaPreview data={data} />;
    case 'csa':
      return <CsaPreview data={data} />;
    case 'design_partner':
      return <DesignPartnerPreview data={data} />;
    case 'psa':
      return <PsaPreview data={data} />;
    case 'software_license':
      return <SoftwareLicensePreview data={data} />;
    case 'partnership':
      return <PartnershipPreview data={data} />;
    case 'pilot':
      return <PilotPreview data={data} />;
    default:
      return <WelcomePreview />;
  }
}
