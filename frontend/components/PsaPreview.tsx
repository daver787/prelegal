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

export default function PsaPreview({ data }: Props) {
  return (
    <PreviewShell title="Professional Services Agreement" subtitle="Cover Page">
      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        <strong>USING THIS PROFESSIONAL SERVICES AGREEMENT</strong>
        <br />
        This Professional Services Agreement covers SOW-based services and deliverables. Complete
        the fields below, then sign to enter into the agreement.
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
          <CoverRow label="Increased Cap Amount">
            {placeholder(data.increasedCapAmount, '[Fill in amount]')}
          </CoverRow>
          <CoverRow label="Deliverables" hint="Description of work to be delivered">
            {placeholder(data.deliverables, '[Describe deliverables]')}
          </CoverRow>
          <CoverRow label="Rejection Period" hint="Time to review and accept deliverables">
            {placeholder(data.rejectionPeriod, '[Fill in period]')}
          </CoverRow>
          <CoverRow label="Fees">
            {placeholder(data.fees, '[Fill in fees]')}
          </CoverRow>
          <CoverRow label="Payment Period">
            {placeholder(data.paymentPeriod, '[Fill in payment terms]')}
          </CoverRow>
        </tbody>
      </table>

      <p className="mb-4 text-sm">
        By signing this Cover Page, each party agrees to the Professional Services Agreement as of
        the Effective Date.
      </p>

      <TwoPartySignatureTable
        label1="Provider"
        label2="Customer"
        party1={data.provider}
        party2={data.customer}
      />

      <p className="mt-2 text-xs text-gray-500">
        Common Paper Professional Services Agreement free to use under{' '}
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
