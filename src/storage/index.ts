import fs from 'fs';
import path from 'path';
import {
  Medication,
  Prescription,
  ApprovedAlternative,
  Allergy,
  Stock,
  PrescriberRule,
  FollowUp,
  AuditLogEntry,
  EvidenceCatalogItem,
  StakeholderFeedback,
  ExperimentRun,
  SystemContext
} from '../types';
import {
  MEDICATIONS,
  APPROVED_ALTERNATIVES,
  STOCK,
  PRESCRIBER_RULES,
  ALLERGIES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_VALIDATION_FEEDBACK,
  INITIAL_SYSTEM_CONTEXT
} from '../data/syntheticDataset';
import { SYNTHETIC_EVIDENCE_CATALOG } from '../data/evidenceCatalog';

export interface StorageData {
  version: string;
  lastUpdated: string;
  medications: Record<string, Medication>;
  prescriptions: Prescription[];
  approvedAlternatives: ApprovedAlternative[];
  allergies: Allergy[];
  stock: Record<string, Stock>;
  prescriberRules: PrescriberRule[];
  evidenceCatalog: Record<string, EvidenceCatalogItem>;
  followUps: FollowUp[];
  auditLogs: AuditLogEntry[];
  validationFeedback: StakeholderFeedback[];
  experimentRuns: ExperimentRun[];
}

export interface IStorageAdapter {
  init(): Promise<void>;
  getSystemContext(): Promise<SystemContext>;
  getPrescriptions(): Promise<Prescription[]>;
  getPrescriptionById(id: string): Promise<Prescription | null>;
  savePrescription(rx: Prescription): Promise<void>;
  getMedications(): Promise<Record<string, Medication>>;
  getApprovedAlternatives(): Promise<ApprovedAlternative[]>;
  getAllergies(): Promise<Allergy[]>;
  getStock(): Promise<Record<string, Stock>>;
  updateStock(medicationId: string, quantity: number, isStale?: boolean): Promise<void>;
  getPrescriberRules(): Promise<PrescriberRule[]>;
  getEvidenceCatalog(): Promise<Record<string, EvidenceCatalogItem>>;
  getFollowUps(): Promise<FollowUp[]>;
  saveFollowUp(fu: FollowUp): Promise<void>;
  updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<FollowUp | null>;
  getAuditLogs(): Promise<AuditLogEntry[]>;
  saveAuditLog(entry: AuditLogEntry): Promise<void>;
  getValidationFeedback(): Promise<StakeholderFeedback[]>;
  saveValidationFeedback(feedback: StakeholderFeedback): Promise<void>;
  getExperimentRuns(): Promise<ExperimentRun[]>;
  saveExperimentRun(run: ExperimentRun): Promise<void>;
  resetToDefault(): Promise<void>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'persistent_storage.json');

class LocalFileStorageAdapter implements IStorageAdapter {
  private cache: StorageData | null = null;

  private getDefaultData(): StorageData {
    return {
      version: "2.0.0-prototype-milestone",
      lastUpdated: new Date().toISOString(),
      medications: { ...MEDICATIONS },
      prescriptions: [...INITIAL_PRESCRIPTIONS],
      approvedAlternatives: [...APPROVED_ALTERNATIVES],
      allergies: [...ALLERGIES],
      stock: { ...STOCK },
      prescriberRules: [...PRESCRIBER_RULES],
      evidenceCatalog: { ...SYNTHETIC_EVIDENCE_CATALOG },
      followUps: [...INITIAL_FOLLOW_UPS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      validationFeedback: [...INITIAL_VALIDATION_FEEDBACK],
      experimentRuns: []
    };
  }

  public async init(): Promise<void> {
    if (this.cache) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.cache = JSON.parse(raw);
        // Ensure all required fields exist if read from previous version
        if (!this.cache?.evidenceCatalog) this.cache!.evidenceCatalog = { ...SYNTHETIC_EVIDENCE_CATALOG };
        if (!this.cache?.experimentRuns) this.cache!.experimentRuns = [];
        if (!this.cache?.validationFeedback) this.cache!.validationFeedback = [...INITIAL_VALIDATION_FEEDBACK];
        if (!this.cache?.prescriptions || this.cache.prescriptions.length < 50) {
          this.cache!.prescriptions = [...INITIAL_PRESCRIPTIONS];
          this.saveToFile();
        }
      } else {
        this.cache = this.getDefaultData();
        this.saveToFile();
      }
    } catch (e) {
      console.error("Storage init fallback to in-memory defaults:", e);
      this.cache = this.getDefaultData();
    }
  }

  private saveToFile(): void {
    if (!this.cache) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.cache.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.warn("Could not write to local file system, maintaining in-memory cache:", e);
    }
  }

  private ensureLoaded(): StorageData {
    if (!this.cache) {
      let data = this.getDefaultData();
      try {
        if (fs.existsSync(DB_FILE)) {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          data = JSON.parse(raw);
        } else {
          this.cache = data;
          this.saveToFile();
        }
      } catch {
        // fallback to default in-memory data
      }
      this.cache = data;
    }
    return this.cache;
  }

  public async getSystemContext(): Promise<SystemContext> {
    const data = this.ensureLoaded();
    return {
      medications: data.medications,
      approvedAlternatives: data.approvedAlternatives,
      allergies: data.allergies,
      stock: data.stock,
      prescriberRules: data.prescriberRules,
      evidenceCatalog: data.evidenceCatalog
    };
  }

  public async getPrescriptions(): Promise<Prescription[]> {
    return this.ensureLoaded().prescriptions;
  }

  public async getPrescriptionById(id: string): Promise<Prescription | null> {
    const rx = this.ensureLoaded().prescriptions.find(p => p.id === id);
    return rx || null;
  }

  public async savePrescription(rx: Prescription): Promise<void> {
    const data = this.ensureLoaded();
    const idx = data.prescriptions.findIndex(p => p.id === rx.id);
    if (idx >= 0) {
      data.prescriptions[idx] = rx;
    } else {
      data.prescriptions.unshift(rx);
    }
    this.saveToFile();
  }

  public async getMedications(): Promise<Record<string, Medication>> {
    return this.ensureLoaded().medications;
  }

  public async getApprovedAlternatives(): Promise<ApprovedAlternative[]> {
    return this.ensureLoaded().approvedAlternatives;
  }

  public async getAllergies(): Promise<Allergy[]> {
    return this.ensureLoaded().allergies;
  }

  public async getStock(): Promise<Record<string, Stock>> {
    return this.ensureLoaded().stock;
  }

  public async updateStock(medicationId: string, quantity: number, isStale?: boolean): Promise<void> {
    const data = this.ensureLoaded();
    if (data.stock[medicationId]) {
      data.stock[medicationId].quantityAvailable = quantity;
      data.stock[medicationId].lastUpdated = new Date().toISOString();
      if (isStale !== undefined) {
        data.stock[medicationId].isStale = isStale;
      }
      this.saveToFile();
    }
  }

  public async getPrescriberRules(): Promise<PrescriberRule[]> {
    return this.ensureLoaded().prescriberRules;
  }

  public async getEvidenceCatalog(): Promise<Record<string, EvidenceCatalogItem>> {
    return this.ensureLoaded().evidenceCatalog;
  }

  public async getFollowUps(): Promise<FollowUp[]> {
    return this.ensureLoaded().followUps;
  }

  public async saveFollowUp(fu: FollowUp): Promise<void> {
    const data = this.ensureLoaded();
    const idx = data.followUps.findIndex(f => f.id === fu.id);
    if (idx >= 0) {
      data.followUps[idx] = fu;
    } else {
      data.followUps.unshift(fu);
    }
    this.saveToFile();
  }

  public async updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<FollowUp | null> {
    const data = this.ensureLoaded();
    const idx = data.followUps.findIndex(f => f.id === id);
    if (idx < 0) return null;
    data.followUps[idx] = { ...data.followUps[idx], ...updates };
    this.saveToFile();
    return data.followUps[idx];
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    return this.ensureLoaded().auditLogs;
  }

  public async saveAuditLog(entry: AuditLogEntry): Promise<void> {
    const data = this.ensureLoaded();
    data.auditLogs.unshift(entry);
    this.saveToFile();
  }

  public async getValidationFeedback(): Promise<StakeholderFeedback[]> {
    return this.ensureLoaded().validationFeedback;
  }

  public async saveValidationFeedback(feedback: StakeholderFeedback): Promise<void> {
    const data = this.ensureLoaded();
    data.validationFeedback.unshift(feedback);
    this.saveToFile();
  }

  public async getExperimentRuns(): Promise<ExperimentRun[]> {
    return this.ensureLoaded().experimentRuns;
  }

  public async saveExperimentRun(run: ExperimentRun): Promise<void> {
    const data = this.ensureLoaded();
    data.experimentRuns.unshift(run);
    this.saveToFile();
  }

  public async resetToDefault(): Promise<void> {
    this.cache = this.getDefaultData();
    this.saveToFile();
  }
}

// Global storage singleton
let storageInstance: IStorageAdapter | null = null;

export function getStorage(): IStorageAdapter {
  if (!storageInstance) {
    storageInstance = new LocalFileStorageAdapter();
  }
  return storageInstance;
}
