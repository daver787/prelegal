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

export default function PartnershipPreview({ data }: Props) {
  return (
    <PreviewShell title="Partnership Agreement" subtitle="Cover Page">
      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        <strong>USING THIS PARTNERSHIP AGREEMENT</strong>
        <br />
        This Partnership Agreement covers business partnerships including mutual obligations,
        trademark licensing, and brand guidelines. Complete the fields below to customize the
        agreement.
      </div>

      <table className="mb-6 w-full border-collapse text-sm">
        <tbody>
          <CoverRow label="Company">
            <div>{placeholder(data.company.name, '[Company name]')}</div>
            {data.company.noticeAddress && (
              <div className="mt-1 text-xs text-gray-600">{data.company.noticeAddress}</div>
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
          {data.endDate && (
            <CoverRow label="End Date">
              {formatDateCell(data.endDate)}
            </CoverRow>
          )}
          <CoverRow label="Obligations" hint="Mutual obligations between the parties">
            {placeholder(data.obligations, '[Describe mutual obligations]')}
          </CoverRow>
          {data.paymentProcess && (
            <CoverRow label="Payment Process">{data.paymentProcess}</CoverRow>
          )}
          <CoverRow label="Territory" hint="Geographic scope of trademark license">
            {placeholder(data.territory, '[Fill in territory]')}
          </CoverRow>
          <CoverRow label="Brand Guidelines">
            {placeholder(data.brandGuidelines, '[Reference or describe brand guidelines]')}
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
        By signing this Cover Page, each party agrees to the Partnership Agreement as of the
        Effective Date.
      </p>

      <TwoPartySignatureTable
        label1="Company"
        label2="Partner"
        party1={data.company}
        party2={data.partner}
      />

      <p className="mt-2 text-xs text-gray-500">
        Common Paper Partnership Agreement free to use under{' '}
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
