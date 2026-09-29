import {
  Medication,
  Prescription,
  ApprovedAlternative,
  Allergy,
  Stock,
  PrescriberRule,
  FollowUp,
  AuditLogEntry,
  SystemContext
} from '../types';
import {
  MEDICATIONS as SYNTH_MEDICATIONS,
  APPROVED_ALTERNATIVES as SYNTH_APPROVED_ALTERNATIVES,
  STOCK as SYNTH_STOCK,
  PRESCRIBER_RULES as SYNTH_PRESCRIBER_RULES,
  ALLERGIES as SYNTH_ALLERGIES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_CONTEXT,
  BASE_DATE
} from './syntheticDataset';
import { SYNTHETIC_EVIDENCE_CATALOG } from './evidenceCatalog';

export const MEDICATIONS: Record<string, Medication> = SYNTH_MEDICATIONS;
export const APPROVED_ALTERNATIVES: ApprovedAlternative[] = SYNTH_APPROVED_ALTERNATIVES;
export const STOCK: Record<string, Stock> = SYNTH_STOCK;
export const PRESCRIBER_RULES: PrescriberRule[] = SYNTH_PRESCRIBER_RULES;
export const ALLERGIES: Allergy[] = SYNTH_ALLERGIES;
export const PRESCRIPTIONS: Prescription[] = INITIAL_PRESCRIPTIONS;
export const EVIDENCE_CATALOG = SYNTHETIC_EVIDENCE_CATALOG;

export const CONTEXT: SystemContext = INITIAL_SYSTEM_CONTEXT;

// State container for backward compatibility with components that read/write directly
export const STATE = {
  followUps: [...INITIAL_FOLLOW_UPS],
  auditLogs: [...INITIAL_AUDIT_LOGS]
};
