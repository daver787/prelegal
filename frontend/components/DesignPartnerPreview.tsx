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

export default function DesignPartnerPreview({ data }: Props) {
  return (
    <PreviewShell title="Design Partner Agreement" subtitle="Cover Page">
      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        <strong>USING THIS DESIGN PARTNER AGREEMENT</strong>
        <br />
        This Design Partner Agreement grants early product access in exchange for structured
        feedback. Complete the fields below to customize the agreement.
      </div>

      <table className="mb-6 w-full border-collapse text-sm">
        <tbody>
          <CoverRow label="Provider">
            <div>{placeholder(data.provider.name, '[Provider name]')}</div>
            {data.provider.noticeAddress && (
              <div className="mt-1 text-xs text-gray-600">{data.provider.noticeAddress}</div>
            )}
          </CoverRow>
          <CoverRow label="Partner">
            <div>{placeholder(data.partner.name, '[Partner name]')}</div>
            {data.partner.noticeAddress && (
              <div className="mt-1 text-xs text-gray-600">{data.partner.noticeAddress}</div>
            )}
          </CoverRow>
          <CoverRow label="Effective Date">
            {formatDateCell(data.effectiveDate)}
          </CoverRow>
          <CoverRow label="Term" hint="Length of pilot access period">
            {placeholder(data.term, '[Fill in term length]')}
          </CoverRow>
          <CoverRow label="Program" hint="Description of feedback program">
            {placeholder(data.program, '[Describe the feedback program]')}
          </CoverRow>
          <CoverRow label="Fees" hint="Compensation, if any">
            {placeholder(data.fees, 'No fees (free access)')}
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
        </tbody>
      </table>

      <p className="mb-4 text-sm">
        By signing this Cover Page, each party agrees to the Design Partner Agreement as of the
        Effective Date.
      </p>

      <TwoPartySignatureTable
        label1="Provider"
        label2="Partner"
        party1={data.provider}
        party2={data.partner}
      />

      <p className="mt-2 text-xs text-gray-500">
        Common Paper Design Partner Agreement free to use under{' '}
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
