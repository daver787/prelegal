'use client';

import type { NdaFormData, PartyDetails } from '@/lib/types';

interface Props {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</h2>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mb-1 text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const textareaCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none';

function PartySection({
  label,
  data,
  onChange,
}: {
  label: string;
  data: PartyDetails;
  onChange: (d: PartyDetails) => void;
}) {
  const set = (field: keyof PartyDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [field]: e.target.value });

  return (
    <div>
      <SectionHeading>{label}</SectionHeading>
      <Field label="Print Name">
        <input className={inputCls} placeholder="Full name" value={data.name} onChange={set('name')} />
      </Field>
      <Field label="Title">
        <input className={inputCls} placeholder="Job title" value={data.title} onChange={set('title')} />
      </Field>
      <Field label="Company">
        <input className={inputCls} placeholder="Company name" value={data.company} onChange={set('company')} />
      </Field>
      <Field label="Notice Address" hint="Email or postal address">
        <input
          className={inputCls}
          placeholder="email@company.com or 123 Main St"
          value={data.noticeAddress}
          onChange={set('noticeAddress')}
        />
      </Field>
      <Field label="Date">
        <input type="date" className={inputCls} value={data.date} onChange={set('date')} />
      </Field>
    </div>
  );
}

export default function NdaForm({ data, onChange }: Props) {
  const set =
    <K extends keyof NdaFormData>(field: K) =>
    (value: NdaFormData[K]) =>
      onChange({ ...data, [field]: value });

  return (
    <div className="p-5">
      {/* Agreement Details */}
      <div className="mb-6">
        <SectionHeading>Agreement Details</SectionHeading>

        <Field label="Purpose" hint="How Confidential Information may be used">
          <textarea
            className={textareaCls}
            rows={3}
            value={data.purpose}
            onChange={(e) => set('purpose')(e.target.value)}
          />
        </Field>

        <Field label="Effective Date">
          <input
            type="date"
            className={inputCls}
            value={data.effectiveDate}
            onChange={(e) => set('effectiveDate')(e.target.value)}
          />
        </Field>

        {/* MNDA Term */}
        <Field label="MNDA Term" hint="The length of this agreement">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mndaTermType"
                checked={data.mndaTermType === 'expires'}
                onChange={() => set('mndaTermType')('expires')}
                className="accent-blue-600"
              />
              Expires after
              <input
                type="number"
                min={1}
                max={10}
                disabled={data.mndaTermType !== 'expires'}
                value={data.mndaTermYears}
                onChange={(e) => set('mndaTermYears')(Number(e.target.value))}
                className="w-14 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
              />
              year(s) from Effective Date
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mndaTermType"
                checked={data.mndaTermType === 'continues'}
                onChange={() => set('mndaTermType')('continues')}
                className="accent-blue-600"
              />
              Continues until terminated
            </label>
          </div>
        </Field>

        {/* Term of Confidentiality */}
        <Field label="Term of Confidentiality" hint="How long Confidential Information is protected">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="confidentialityTermType"
                checked={data.confidentialityTermType === 'years'}
                onChange={() => set('confidentialityTermType')('years')}
                className="accent-blue-600"
              />
              <input
                type="number"
                min={1}
                max={10}
                disabled={data.confidentialityTermType !== 'years'}
                value={data.confidentialityTermYears}
                onChange={(e) => set('confidentialityTermYears')(Number(e.target.value))}
                className="w-14 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
              />
              year(s) from Effective Date
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="confidentialityTermType"
                checked={data.confidentialityTermType === 'perpetual'}
                onChange={() => set('confidentialityTermType')('perpetual')}
                className="accent-blue-600"
              />
              In perpetuity
            </label>
          </div>
        </Field>

        <Field label="Governing Law">
          <input
            className={inputCls}
            placeholder="e.g. Delaware"
            value={data.governingLaw}
            onChange={(e) => set('governingLaw')(e.target.value)}
          />
        </Field>

        <Field label="Jurisdiction">
          <input
            className={inputCls}
            placeholder="e.g. New Castle, DE"
            value={data.jurisdiction}
            onChange={(e) => set('jurisdiction')(e.target.value)}
          />
        </Field>
      </div>

      {/* Modifications */}
      <div className="mb-6">
        <SectionHeading>MNDA Modifications</SectionHeading>
        <Field label="Modifications" hint="Optional — list any changes to the Standard Terms">
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="Leave blank if none"
            value={data.modifications}
            onChange={(e) => set('modifications')(e.target.value)}
          />
        </Field>
      </div>

      {/* Divider */}
      <div className="mb-6 border-t border-gray-200" />

      {/* Parties */}
      <div className="mb-6">
        <PartySection
          label="Party 1"
          data={data.party1}
          onChange={(d) => onChange({ ...data, party1: d })}
        />
      </div>
      <div className="mb-6 border-t border-gray-200" />
      <div className="mb-2">
        <PartySection
          label="Party 2"
          data={data.party2}
          onChange={(d) => onChange({ ...data, party2: d })}
        />
      </div>
    </div>
  );
}
