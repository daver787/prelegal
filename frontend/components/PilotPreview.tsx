'use client';

import type { AgreementData } from '@/lib/types';
import {
  placeholder,
  formatDateCell,
  CoverRow,
  TwoPartySignatureTable,
  PreviewShell,
} from './previewHelpers';

interface Props {
  data: AgreementData;
}

export default function PilotPreview({ data }: Props) {
  return (
    <PreviewShell title="Pilot Agreement" subtitle="Cover Page">
      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        <strong>USING THIS PILOT AGREEMENT</strong>
        <br />
        This Pilot Agreement allows a prospective customer to evaluate a product before committing
        to a longer-term deal. Complete the fields below to customize the agreement.
      </div>

      <table className="mb-6 w-full border-collapse text-sm">
        <tbody>
          <CoverRow label="Provider">
            <div>{placeholder(data.provider.name, '[Provider name]')}</div>
            {data.provider.noticeAddress && (
              <div className="mt-1 text-xs text-gray-600">{data.provider.noticeAddress}</div>
            )}
          </CoverRow>
          <CoverRow label="Customer">
            <div>{placeholder(data.customer.name, '[Customer name]')}</div>
            {data.customer.noticeAddress && (
              <div className="mt-1 text-xs text-gray-600">{data.customer.noticeAddress}</div>
            )}
          </CoverRow>
          <CoverRow label="Effective Date">
            {formatDateCell(data.effectiveDate)}
          </CoverRow>
          <CoverRow label="Pilot Period" hint="Duration of the evaluation period">
            {placeholder(data.pilotPeriod, '[Fill in pilot duration]')}
          </CoverRow>
          <CoverRow label="Fees" hint="Compensation, if any">
            {placeholder(data.fees, 'No fees (free evaluation)')}
          </CoverRow>
          <CoverRow label="Governing Law &amp; Courts">
            <div>
              <span className="font-semibold">Governing Law:</span>{' '}
              {placeholder(data.governingLaw, '[Fill in state]')}
            </div>
            <div className="mt-1">
              <span className="font-semibold">Chosen Courts:</span>{' '}
              {placeholder(data.chosenCourts, '[Fill in courts]')}
            </div>
          </CoverRow>
          <CoverRow label="General Cap Amount">
            {placeholder(data.generalCapAmount, '[Fill in amount]')}
          </CoverRow>
        </tbody>
      </table>

      <p className="mb-4 text-sm">
        By signing this Cover Page, each party agrees to the Pilot Agreement as of the Effective
        Date.
      </p>

      <TwoPartySignatureTable
        label1="Provider"
        label2="Customer"
        party1={data.provider}
        party2={data.customer}
      />

      <p className="mt-2 text-xs text-gray-500">
        Common Paper Pilot Agreement free to use under{' '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          className="text-blue-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 4.0
        </a>
        .
      </p>
    </PreviewShell>
  );
}
