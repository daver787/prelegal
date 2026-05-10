'use client';

import { Fragment } from 'react';
import type { NdaFormData } from '@/lib/types';
import { STANDARD_TERMS_CLAUSES, computeTokenValues } from '@/lib/ndaTemplate';

interface Props {
  data: NdaFormData;
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
      )}
    </>
  );
}

function renderClauseText(text: string, tokens: Record<string, string>): React.ReactNode {
  const parts = text.split(/<span class="coverpage_link">(.*?)<\/span>/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const value = tokens[part] || `[${part}]`;
          return (
            <span key={i} className="font-medium text-blue-700">
              {value}
            </span>
          );
        }
        return <Fragment key={i}>{renderBold(part)}</Fragment>;
      })}
    </>
  );
}

function placeholder(value: string, fallback: string) {
  return value || <span className="italic text-gray-400">{fallback}</span>;
}

export default function NdaPreview({ data }: Props) {
  const tokens = computeTokenValues(data);

  const effectiveDateDisplay = data.effectiveDate
    ? new Date(data.effectiveDate + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const mndaTermDisplay =
    data.mndaTermType === 'expires'
      ? `Expires ${data.mndaTermYears} year${data.mndaTermYears !== 1 ? 's' : ''} from Effective Date.`
      : 'Continues until terminated in accordance with the terms of the MNDA.';

  const confidentialityTermDisplay =
    data.confidentialityTermType === 'years'
      ? `${data.confidentialityTermYears} year${data.confidentialityTermYears !== 1 ? 's' : ''} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : 'In perpetuity.';

  return (
    <div className="mx-auto max-w-3xl">
      <div
        id="nda-preview-content"
        className="rounded-lg bg-white px-12 py-10 shadow-sm font-serif text-[13px] leading-relaxed text-gray-900"
        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        {/* Title */}
        <h1 className="mb-1 text-center text-xl font-bold tracking-wide">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-gray-500">
          Cover Page
        </p>

        {/* Intro */}
        <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
          <strong>USING THIS MUTUAL NON-DISCLOSURE AGREEMENT</strong>
          <br />
          This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page and (2) the Common
          Paper Mutual NDA Standard Terms Version 1.0. Any modifications of the Standard Terms should be made
          on the Cover Page, which will control over conflicts with the Standard Terms.
        </div>

        {/* Cover Page Fields */}
        <table className="mb-6 w-full border-collapse text-sm">
          <tbody>
            <CoverRow label="Purpose" hint="How Confidential Information may be used">
              {placeholder(data.purpose, 'Not specified')}
            </CoverRow>
            <CoverRow label="Effective Date">
              {effectiveDateDisplay ? (
                effectiveDateDisplay
              ) : (
                <span className="italic text-gray-400">Today&apos;s date</span>
              )}
            </CoverRow>
            <CoverRow label="MNDA Term" hint="The length of this MNDA">
              {mndaTermDisplay}
            </CoverRow>
            <CoverRow label="Term of Confidentiality" hint="How long Confidential Information is protected">
              {confidentialityTermDisplay}
            </CoverRow>
            <CoverRow label="Governing Law &amp; Jurisdiction">
              <div>
                <span className="font-semibold">Governing Law:</span>{' '}
                {placeholder(data.governingLaw, '[Fill in state]')}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Jurisdiction:</span>{' '}
                {placeholder(data.jurisdiction, '[Fill in city or county and state]')}
              </div>
            </CoverRow>
            {data.modifications && (
              <CoverRow label="MNDA Modifications">{data.modifications}</CoverRow>
            )}
          </tbody>
        </table>

        {/* Signature block intro */}
        <p className="mb-4 text-sm">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>

        {/* Signature table */}
        <table className="mb-6 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left text-xs font-semibold w-1/4" />
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-center text-xs font-semibold">
                PARTY 1
              </th>
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-center text-xs font-semibold">
                PARTY 2
              </th>
            </tr>
          </thead>
          <tbody>
            <SigRow label="Signature">
              <div className="h-8" />
              <div className="h-8" />
            </SigRow>
            <SigRow label="Print Name">
              <>{placeholder(data.party1.name, '')}</>
              <>{placeholder(data.party2.name, '')}</>
            </SigRow>
            <SigRow label="Title">
              <>{placeholder(data.party1.title, '')}</>
              <>{placeholder(data.party2.title, '')}</>
            </SigRow>
            <SigRow label="Company">
              <>{placeholder(data.party1.company, '')}</>
              <>{placeholder(data.party2.company, '')}</>
            </SigRow>
            <SigRow label="Notice Address">
              <>{placeholder(data.party1.noticeAddress, '')}</>
              <>{placeholder(data.party2.noticeAddress, '')}</>
            </SigRow>
            <SigRow label="Date">
              <>
                {data.party1.date
                  ? new Date(data.party1.date + 'T00:00:00').toLocaleDateString('en-US')
                  : ''}
              </>
              <>
                {data.party2.date
                  ? new Date(data.party2.date + 'T00:00:00').toLocaleDateString('en-US')
                  : ''}
              </>
            </SigRow>
          </tbody>
        </table>

        {/* Attribution */}
        <p className="mb-8 text-xs text-gray-500">
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{' '}
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

        {/* Divider */}
        <div className="my-8 border-t-2 border-gray-300" />

        {/* Standard Terms */}
        <h2 className="mb-6 text-center text-lg font-bold tracking-wide">Standard Terms</h2>

        {STANDARD_TERMS_CLAUSES.map((clause) => (
          <div key={clause.number} className="mb-5">
            <p className="text-sm leading-relaxed">
              <strong>
                {clause.number}. {clause.title}.
              </strong>{' '}
              {renderClauseText(clause.text, tokens)}
            </p>
          </div>
        ))}

        {/* Standard Terms attribution */}
        <p className="mt-6 text-xs text-gray-500">
          Common Paper Mutual Non-Disclosure Agreement{' '}
          <a
            href="https://commonpaper.com/standards/mutual-nda/1.0/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noreferrer"
          >
            Version 1.0
          </a>{' '}
          free to use under{' '}
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
      </div>
    </div>
  );
}

function CoverRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td className="border border-gray-300 px-4 py-3 align-top text-xs font-semibold text-gray-700 w-1/3 bg-gray-50">
        {label}
        {hint && <div className="mt-0.5 text-xs font-normal text-gray-500">{hint}</div>}
      </td>
      <td className="border border-gray-300 px-4 py-3 align-top text-sm">{children}</td>
    </tr>
  );
}

function SigRow({
  label,
  children,
}: {
  label: string;
  children: [React.ReactNode, React.ReactNode];
}) {
  const [c1, c2] = children;
  return (
    <tr>
      <td className="border border-gray-300 px-4 py-3 align-top text-xs font-semibold text-gray-700 bg-gray-50">
        {label}
      </td>
      <td className="border border-gray-300 px-4 py-3 align-top text-sm">{c1}</td>
      <td className="border border-gray-300 px-4 py-3 align-top text-sm">{c2}</td>
    </tr>
  );
}
