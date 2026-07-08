export type TriageStatus = "RED" | "AMBER" | "GREEN";

export interface TriageResultPayload {
  transcription?: string;
  languageDetected: string;
  extractedSymptoms: string[];
  estimatedDuration: string;
  triageStatus: TriageStatus;
  suggestedAction: string;
  administrativeAlertFlags: string[];
  uiTranslations?: {
    statusBannerPriority: string;
    statusBannerMessage: string;
    estResponseTimeLabel: string;
    languageLabel: string;
    estDurationLabel: string;
    extractedSymptomsLabel: string;
    noSymptomsLabel: string;
    suggestedActionPlanLabel: string;
    administrativeAlertsLabel: string;
    patientIntakeLabel: string;
    symptomsDescriptionLabel: string;
    quickTestScenariosLabel: string;
    analyzeButtonLabel: string;
  };
}
