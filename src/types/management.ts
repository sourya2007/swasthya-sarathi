export interface StockWarning {
  item: string;
  daysLeft: string;
  warningLevel: "LOW" | "CRITICAL";
}

export interface DemandForecast {
  condition: string;
  expectedSurge: string;
  reason: string;
}

export interface Redistribution {
  fromCentre: string;
  toCentre: string;
  resource: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
}

export interface FlaggedCentre {
  centre: string;
  reason: string;
  severity: "CRITICAL" | "WARNING";
}

export interface ManagementPayload {
  transcription?: string;
  metrics: {
    footfall: string;
    bedsAvailable: string;
    doctorAttendance: string;
    testsAvailable: string;
  };
  stockWarnings: StockWarning[];
  demandForecasts: DemandForecast[];
  redistributionRecommendations: Redistribution[];
  flaggedCentres: FlaggedCentre[];
  uiTranslations?: {
    metricsTitle: string;
    stockWarningsTitle: string;
    demandForecastsTitle: string;
    redistributionTitle: string;
    flaggedCentresTitle: string;
  };
}
