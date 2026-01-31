/**
 * Code Templates
 *
 * Pre-built templates for common FHIR application types.
 * These templates provide starter code that can be customized
 * based on the user's requirements.
 */

/**
 * Template file structure
 */
export interface TemplateFile {
  name: string
  path: string
  code: string
}

/**
 * Application template definition
 */
export interface AppTemplate {
  id: string
  name: string
  description: string
  requiredResources: string[]
  optionalResources?: string[]
  files: TemplateFile[]
}

/**
 * Template application options
 */
export interface TemplateOptions {
  appName: string
  description: string
  additionalResources?: string[]
}

/**
 * Result of applying a template
 */
export interface AppliedTemplate {
  appName: string
  description: string
  files: TemplateFile[]
}

// =====================================================
// Template Definitions
// =====================================================

const MEDICATION_TRACKER_TEMPLATE: AppTemplate = {
  id: 'medication-tracker',
  name: 'Medication Tracker',
  description: 'Track and manage patient medications with reminders',
  requiredResources: ['Patient', 'MedicationRequest'],
  optionalResources: ['MedicationStatement', 'MedicationAdministration'],
  files: [
    {
      name: 'MedicationList',
      path: 'src/components/MedicationList.tsx',
      code: `'use client';

import { useMedplum } from '@medplum/react';
import { MedicationRequest, Bundle } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';

interface MedicationListProps {
  patientId: string;
}

export function MedicationList({ patientId }: MedicationListProps) {
  const medplum = useMedplum();
  const [medications, setMedications] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedications() {
      try {
        const bundle = await medplum.search('MedicationRequest', {
          patient: patientId,
          _sort: '-authoredon',
        }) as Bundle<MedicationRequest>;

        setMedications(bundle.entry?.map(e => e.resource!) || []);
      } catch (err) {
        setError('Failed to load medications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMedications();
  }, [medplum, patientId]);

  if (loading) return <div className="animate-pulse">Loading medications...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Medications</h2>
      {medications.length === 0 ? (
        <p className="text-gray-500">No medications found</p>
      ) : (
        <ul className="divide-y">
          {medications.map((med) => (
            <li key={med.id} className="py-3">
              <div className="font-medium">
                {med.medicationCodeableConcept?.text || 'Unknown medication'}
              </div>
              <div className="text-sm text-gray-500">
                Status: {med.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`
    },
    {
      name: 'MedicationCard',
      path: 'src/components/MedicationCard.tsx',
      code: `'use client';

import { MedicationRequest } from '@medplum/fhirtypes';

interface MedicationCardProps {
  medication: MedicationRequest;
  onRefill?: () => void;
}

export function MedicationCard({ medication, onRefill }: MedicationCardProps) {
  const name = medication.medicationCodeableConcept?.text || 'Unknown';
  const dosage = medication.dosageInstruction?.[0]?.text || 'No dosage info';
  const status = medication.status;

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-gray-600">{dosage}</p>
        </div>
        <span className={\`px-2 py-1 text-xs rounded \${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }\`}>
          {status}
        </span>
      </div>
      {onRefill && status === 'active' && (
        <button
          onClick={onRefill}
          className="mt-3 w-full rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
        >
          Request Refill
        </button>
      )}
    </div>
  );
}
`
    },
    {
      name: 'page',
      path: 'src/app/page.tsx',
      code: `'use client';

import { MedplumProvider } from '@medplum/react';
import { MedplumClient } from '@medplum/core';
import { MedicationList } from '@/components/MedicationList';

const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
  clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID,
});

export default function Home() {
  // In production, get patientId from auth context
  const patientId = 'example-patient-id';

  return (
    <MedplumProvider medplum={medplum}>
      <main className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold">{{APP_NAME}}</h1>
        <p className="mb-8 text-gray-600">{{APP_DESCRIPTION}}</p>
        <MedicationList patientId={patientId} />
      </main>
    </MedplumProvider>
  );
}
`
    }
  ]
}

const PATIENT_PORTAL_TEMPLATE: AppTemplate = {
  id: 'patient-portal',
  name: 'Patient Portal',
  description: 'A comprehensive patient health portal',
  requiredResources: ['Patient'],
  optionalResources: ['Observation', 'Condition', 'AllergyIntolerance'],
  files: [
    {
      name: 'PatientSummary',
      path: 'src/components/PatientSummary.tsx',
      code: `'use client';

import { Patient } from '@medplum/fhirtypes';
import { formatHumanName } from '@medplum/core';

interface PatientSummaryProps {
  patient: Patient;
}

export function PatientSummary({ patient }: PatientSummaryProps) {
  const name = patient.name?.[0] ? formatHumanName(patient.name[0]) : 'Unknown';
  const birthDate = patient.birthDate || 'Not specified';
  const gender = patient.gender || 'Not specified';

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Patient Information</h2>
      <dl className="space-y-2">
        <div className="flex">
          <dt className="w-32 font-medium text-gray-500">Name:</dt>
          <dd>{name}</dd>
        </div>
        <div className="flex">
          <dt className="w-32 font-medium text-gray-500">Birth Date:</dt>
          <dd>{birthDate}</dd>
        </div>
        <div className="flex">
          <dt className="w-32 font-medium text-gray-500">Gender:</dt>
          <dd className="capitalize">{gender}</dd>
        </div>
      </dl>
    </div>
  );
}
`
    },
    {
      name: 'PatientHeader',
      path: 'src/components/PatientHeader.tsx',
      code: `'use client';

import { Patient } from '@medplum/fhirtypes';
import { formatHumanName } from '@medplum/core';

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const name = patient.name?.[0] ? formatHumanName(patient.name[0]) : 'Patient';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center gap-4 border-b pb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
        {initials}
      </div>
      <div>
        <h1 className="text-xl font-semibold">{name}</h1>
        <p className="text-sm text-gray-500">Welcome to your health portal</p>
      </div>
    </header>
  );
}
`
    },
    {
      name: 'page',
      path: 'src/app/page.tsx',
      code: `'use client';

import { MedplumProvider, useMedplum } from '@medplum/react';
import { MedplumClient } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';
import { PatientSummary } from '@/components/PatientSummary';
import { PatientHeader } from '@/components/PatientHeader';

const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
  clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID,
});

function PatientPortal() {
  const medplum = useMedplum();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        // In production, get patient from auth context
        const result = await medplum.readResource('Patient', 'example-id');
        setPatient(result);
      } catch (err) {
        console.error('Failed to load patient', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [medplum]);

  if (loading) return <div className="animate-pulse p-6">Loading...</div>;
  if (!patient) return <div className="p-6 text-red-500">Patient not found</div>;

  return (
    <main className="container mx-auto max-w-4xl space-y-6 p-6">
      <PatientHeader patient={patient} />
      <PatientSummary patient={patient} />
    </main>
  );
}

export default function Home() {
  return (
    <MedplumProvider medplum={medplum}>
      <PatientPortal />
    </MedplumProvider>
  );
}
`
    }
  ]
}

const OBSERVATION_DASHBOARD_TEMPLATE: AppTemplate = {
  id: 'observation-dashboard',
  name: 'Observation Dashboard',
  description: 'View and track patient health observations and vitals',
  requiredResources: ['Patient', 'Observation'],
  optionalResources: ['DiagnosticReport'],
  files: [
    {
      name: 'ObservationList',
      path: 'src/components/ObservationList.tsx',
      code: `'use client';

import { useMedplum } from '@medplum/react';
import { Observation, Bundle } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';

interface ObservationListProps {
  patientId: string;
  category?: string;
}

export function ObservationList({ patientId, category }: ObservationListProps) {
  const medplum = useMedplum();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchObservations() {
      try {
        const params: Record<string, string> = {
          patient: patientId,
          _sort: '-date',
          _count: '20',
        };
        if (category) params.category = category;

        const bundle = await medplum.search('Observation', params) as Bundle<Observation>;
        setObservations(bundle.entry?.map(e => e.resource!) || []);
      } catch (err) {
        console.error('Failed to fetch observations', err);
      } finally {
        setLoading(false);
      }
    }
    fetchObservations();
  }, [medplum, patientId, category]);

  if (loading) return <div className="animate-pulse">Loading observations...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Health Observations</h2>
      {observations.length === 0 ? (
        <p className="text-gray-500">No observations found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {observations.map((obs) => (
            <div key={obs.id} className="rounded-lg border p-4">
              <div className="font-medium">
                {obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown'}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {obs.valueQuantity?.value} {obs.valueQuantity?.unit}
              </div>
              <div className="text-sm text-gray-500">
                {obs.effectiveDateTime ? new Date(obs.effectiveDateTime).toLocaleDateString() : 'No date'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`
    },
    {
      name: 'VitalsCard',
      path: 'src/components/VitalsCard.tsx',
      code: `'use client';

import { Observation } from '@medplum/fhirtypes';

interface VitalsCardProps {
  observation: Observation;
}

export function VitalsCard({ observation }: VitalsCardProps) {
  const name = observation.code?.text || observation.code?.coding?.[0]?.display || 'Unknown';
  const value = observation.valueQuantity?.value;
  const unit = observation.valueQuantity?.unit || '';
  const date = observation.effectiveDateTime
    ? new Date(observation.effectiveDateTime).toLocaleDateString()
    : 'Unknown date';

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{name}</div>
      <div className="text-2xl font-bold">
        {value !== undefined ? \`\${value} \${unit}\` : 'N/A'}
      </div>
      <div className="text-xs text-gray-400">{date}</div>
    </div>
  );
}
`
    },
    {
      name: 'page',
      path: 'src/app/page.tsx',
      code: `'use client';

import { MedplumProvider } from '@medplum/react';
import { MedplumClient } from '@medplum/core';
import { ObservationList } from '@/components/ObservationList';

const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
  clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID,
});

export default function Home() {
  const patientId = 'example-patient-id';

  return (
    <MedplumProvider medplum={medplum}>
      <main className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold">{{APP_NAME}}</h1>
        <p className="mb-8 text-gray-600">{{APP_DESCRIPTION}}</p>
        <ObservationList patientId={patientId} />
      </main>
    </MedplumProvider>
  );
}
`
    }
  ]
}

const APPOINTMENT_SCHEDULER_TEMPLATE: AppTemplate = {
  id: 'appointment-scheduler',
  name: 'Appointment Scheduler',
  description: 'Schedule and manage patient appointments',
  requiredResources: ['Patient', 'Appointment'],
  optionalResources: ['Practitioner', 'Schedule', 'Slot'],
  files: [
    {
      name: 'AppointmentList',
      path: 'src/components/AppointmentList.tsx',
      code: `'use client';

import { useMedplum } from '@medplum/react';
import { Appointment, Bundle } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';

interface AppointmentListProps {
  patientId: string;
}

export function AppointmentList({ patientId }: AppointmentListProps) {
  const medplum = useMedplum();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const bundle = await medplum.search('Appointment', {
          patient: patientId,
          _sort: 'date',
          date: \`ge\${new Date().toISOString().split('T')[0]}\`,
        }) as Bundle<Appointment>;

        setAppointments(bundle.entry?.map(e => e.resource!) || []);
      } catch (err) {
        console.error('Failed to fetch appointments', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [medplum, patientId]);

  if (loading) return <div className="animate-pulse">Loading appointments...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No upcoming appointments</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {appointments.map((apt) => (
            <li key={apt.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{apt.description || 'Appointment'}</div>
                  <div className="text-sm text-gray-500">
                    {apt.start ? new Date(apt.start).toLocaleString() : 'TBD'}
                  </div>
                </div>
                <span className={\`self-start px-2 py-1 text-xs rounded \${
                  apt.status === 'booked' ? 'bg-green-100 text-green-800' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }\`}>
                  {apt.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`
    },
    {
      name: 'AppointmentCard',
      path: 'src/components/AppointmentCard.tsx',
      code: `'use client';

import { Appointment } from '@medplum/fhirtypes';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const startDate = appointment.start ? new Date(appointment.start) : null;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">
            {appointment.description || 'Appointment'}
          </h3>
          {startDate && (
            <p className="text-sm text-gray-600">
              {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <span className="text-sm capitalize">{appointment.status}</span>
      </div>
      {onCancel && appointment.status === 'booked' && (
        <button
          onClick={onCancel}
          className="mt-3 text-sm text-red-500 hover:text-red-700"
        >
          Cancel Appointment
        </button>
      )}
    </div>
  );
}
`
    },
    {
      name: 'page',
      path: 'src/app/page.tsx',
      code: `'use client';

import { MedplumProvider } from '@medplum/react';
import { MedplumClient } from '@medplum/core';
import { AppointmentList } from '@/components/AppointmentList';

const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
  clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID,
});

export default function Home() {
  const patientId = 'example-patient-id';

  return (
    <MedplumProvider medplum={medplum}>
      <main className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold">{{APP_NAME}}</h1>
        <p className="mb-8 text-gray-600">{{APP_DESCRIPTION}}</p>
        <AppointmentList patientId={patientId} />
      </main>
    </MedplumProvider>
  );
}
`
    }
  ]
}

// =====================================================
// All Templates
// =====================================================

const ALL_TEMPLATES: AppTemplate[] = [
  MEDICATION_TRACKER_TEMPLATE,
  PATIENT_PORTAL_TEMPLATE,
  OBSERVATION_DASHBOARD_TEMPLATE,
  APPOINTMENT_SCHEDULER_TEMPLATE
]

// =====================================================
// Template Functions
// =====================================================

/**
 * Get a template by its ID
 */
export function getTemplate(id: string): AppTemplate | undefined {
  return ALL_TEMPLATES.find(t => t.id === id)
}

/**
 * Get all available templates
 */
export function getAllTemplates(): AppTemplate[] {
  return [...ALL_TEMPLATES]
}

/**
 * Find the best matching template for a set of FHIR resources
 */
export function getTemplateForResources(resources: string[]): AppTemplate | null {
  const resourceSet = new Set(resources.map(r => r.toLowerCase()))

  // Score each template based on resource match
  const scored = ALL_TEMPLATES.map(template => {
    const requiredSet = new Set(template.requiredResources.map(r => r.toLowerCase()))
    const optionalSet = new Set(
      (template.optionalResources || []).map(r => r.toLowerCase())
    )

    // Count how many required resources match
    let requiredMatches = 0
    let optionalMatches = 0

    for (const resource of resourceSet) {
      if (requiredSet.has(resource)) requiredMatches++
      if (optionalSet.has(resource)) optionalMatches++
    }

    // Calculate score:
    // - Full coverage of required resources is essential
    // - Prefer templates that require MORE resources (more specific match)
    // - Optional matches add bonus points
    const requiredCoverage = requiredMatches / requiredSet.size
    const specificity = requiredMatches // How many resources this template actually uses
    const score = requiredCoverage * 100 + specificity * 10 + optionalMatches

    return { template, score, requiredCoverage, requiredMatches }
  })

  // Filter templates that match at least some required resources
  const viable = scored.filter(s => s.requiredCoverage >= 0.5)

  if (viable.length === 0) return null

  // Sort by score descending (higher specificity wins ties)
  viable.sort((a, b) => b.score - a.score)

  return viable[0].template
}

/**
 * Apply a template with custom options
 */
export function applyTemplate(
  template: AppTemplate,
  options: TemplateOptions
): AppliedTemplate {
  const { appName, description } = options

  // Convert app name to title case for display
  const appTitle = appName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Process each file and replace placeholders
  const processedFiles = template.files.map(file => ({
    name: file.name,
    path: file.path,
    code: file.code
      .replace(/\{\{APP_NAME\}\}/g, appTitle)
      .replace(/\{\{APP_DESCRIPTION\}\}/g, description)
      .replace(/\{\{APP_NAME_KEBAB\}\}/g, appName)
  }))

  return {
    appName,
    description,
    files: processedFiles
  }
}
