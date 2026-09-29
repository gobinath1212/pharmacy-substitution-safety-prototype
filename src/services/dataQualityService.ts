import { getStorage } from '../storage';
import { DataQualityReport, DataQualityIssue } from '../types';

export async function checkDataQuality(): Promise<DataQualityReport> {
  const storage = getStorage();
  const context = await storage.getSystemContext();
  const prescriptions = await storage.getPrescriptions();
  const medications = await storage.getMedications();
  const approvedAlternatives = await storage.getApprovedAlternatives();
  const stock = await storage.getStock();
  const allergies = await storage.getAllergies();
  const prescriberRules = await storage.getPrescriberRules();

  const issues: DataQualityIssue[] = [];
  let totalRecordsChecked = 0;

  // 1. Check Prescriptions
  const rxIds = new Set<string>();
  for (const rx of prescriptions) {
    totalRecordsChecked++;

    // Duplicate ID check
    if (rxIds.has(rx.id)) {
      issues.push({
        type: "CRITICAL",
        category: "duplicate_id",
        entityId: rx.id,
        description: `Duplicate prescription identifier detected: ${rx.id}`,
        recommendedResolution: "Deduplicate prescription identifiers."
      });
    } else {
      rxIds.add(rx.id);
    }

    // Missing required fields
    if (!rx.medicationId || !rx.patientId || !rx.prescriberId) {
      issues.push({
        type: "CRITICAL",
        category: "missing_field",
        entityId: rx.id,
        description: `Prescription ${rx.id} missing required clinical fields.`,
        recommendedResolution: "Populate medication, patient, and prescriber IDs."
      });
    }

    // Broken reference to medication
    if (!medications[rx.medicationId]) {
      issues.push({
        type: "CRITICAL",
        category: "broken_reference",
        entityId: rx.id,
        description: `Prescription references non-existent medication: ${rx.medicationId}`,
        recommendedResolution: "Add medication to synthetic catalog or update prescription."
      });
    }

    // Unconfirmed / missing allergy profile
    if (!rx.allergyIds || rx.allergyIds.length === 0) {
      issues.push({
        type: "INFO",
        category: "missing_allergy",
        entityId: rx.id,
        description: `Patient ${rx.patientId} has no allergy record in synthetic chart (elevates uncertainty).`,
        recommendedResolution: "Verify allergy history with patient."
      });
    }
  }

  // 2. Check Stock Inventory Telemetry
  const now = new Date().getTime();
  for (const [medId, item] of Object.entries(stock)) {
    totalRecordsChecked++;

    if (item.quantityAvailable < 0) {
      issues.push({
        type: "CRITICAL",
        category: "invalid_stock",
        entityId: medId,
        description: `Negative inventory quantity (${item.quantityAvailable}) for medication ${medId}.`,
        recommendedResolution: "Adjust warehouse stock to non-negative quantity."
      });
    }

    const ageHours = (now - new Date(item.lastUpdated).getTime()) / (1000 * 3600);
    if (item.isStale || ageHours > 48) {
      issues.push({
        type: "WARNING",
        category: "stale_telemetry",
        entityId: medId,
        description: `Warehouse inventory count for ${medId} is older than 48 hours (${Math.round(ageHours)}h).`,
        recommendedResolution: "Trigger physical warehouse cycle count."
      });
    }
  }

  // 3. Check Approved Alternatives
  for (const alt of approvedAlternatives) {
    totalRecordsChecked++;

    if (!medications[alt.sourceMedicationId] || !medications[alt.alternativeMedicationId]) {
      issues.push({
        type: "CRITICAL",
        category: "broken_reference",
        entityId: `${alt.sourceMedicationId}->${alt.alternativeMedicationId}`,
        description: `Approved alternative references unknown medication (${alt.sourceMedicationId} or ${alt.alternativeMedicationId}).`,
        recommendedResolution: "Ensure both source and candidate medications exist."
      });
    }
  }

  // 4. Check Prescriber Restrictions
  for (const rule of prescriberRules) {
    totalRecordsChecked++;

    if (!medications[rule.sourceMedicationId]) {
      issues.push({
        type: "WARNING",
        category: "broken_reference",
        entityId: rule.prescriberId,
        description: `Prescriber rule references unknown medication: ${rule.sourceMedicationId}`,
        recommendedResolution: "Clean orphan prescriber restriction record."
      });
    }
  }

  const criticalCount = issues.filter(i => i.type === "CRITICAL").length;
  const warningCount = issues.filter(i => i.type === "WARNING").length;
  const validCount = totalRecordsChecked - (criticalCount + warningCount);

  const integrityStatus: DataQualityReport['integrityStatus'] = 
    criticalCount > 0 ? "ACTION_REQUIRED" : warningCount > 0 ? "DEGRADED" : "HEALTHY";

  return {
    timestamp: new Date().toISOString(),
    totalRecordsChecked,
    validCount: Math.max(0, validCount),
    warningCount,
    criticalCount,
    issues,
    integrityStatus
  };
}
