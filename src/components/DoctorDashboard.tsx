import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Stethoscope, 
  PhoneCall, 
  Pill, 
  Activity, 
  Users, 
  Clock, 
  Heart, 
  Thermometer, 
  Droplet, 
  FileText, 
  Send, 
  Check, 
  Loader2, 
  AlertTriangle, 
  PhoneOff, 
  Plus, 
  X, 
  CheckCircle2, 
  FileCheck2,
  Calendar,
  AlertCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  reason: string;
  time: string;
  priority: 'CRITICAL' | 'WARNING' | 'ROUTINE';
  vitals: {
    hr: number;
    bp: string;
    temp: number;
    spo2: number;
  };
}

export function DoctorDashboard() {
  const [activePatient, setActivePatient] = useState<Patient | null>({
    id: 'P-102',
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    reason: "Severe Chest Pain, Breathlessness",
    time: "10:30 AM",
    priority: "CRITICAL",
    vitals: { hr: 110, bp: "145/95", temp: 98.6, spo2: 94 }
  });

  const [patients, setPatients] = useState<Patient[]>([
    { 
      id: 'P-101',
      name: "Rajesh Kumar", 
      age: 45,
      gender: "Male",
      reason: "High Fever and Persistent Cough", 
      time: "10:15 AM", 
      priority: "ROUTINE",
      vitals: { hr: 82, bp: "120/80", temp: 101.4, spo2: 98 }
    },
    { 
      id: 'P-102',
      name: "Priya Sharma", 
      age: 28,
      gender: "Female",
      reason: "Severe Chest Pain, Breathlessness", 
      time: "10:30 AM", 
      priority: "CRITICAL",
      vitals: { hr: 110, bp: "145/95", temp: 98.6, spo2: 94 }
    },
    { 
      id: 'P-103',
      name: "Amit Patel", 
      age: 52,
      gender: "Male",
      reason: "Diabetic follow-up & Neuropathy check", 
      time: "10:45 AM", 
      priority: "ROUTINE",
      vitals: { hr: 75, bp: "135/85", temp: 98.4, spo2: 97 }
    },
    { 
      id: 'P-104',
      name: "Sunita Verma", 
      age: 36,
      gender: "Female",
      reason: "Chronic Migraine & Blood Pressure Monitor", 
      time: "11:00 AM", 
      priority: "WARNING",
      vitals: { hr: 88, bp: "140/90", temp: 99.1, spo2: 99 }
    },
  ]);

  // Form states
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Medicine request form state
  const [medicineName, setMedicineName] = useState('');
  const [medicineQty, setMedicineQty] = useState('');
  const [medicinePriority, setMedicinePriority] = useState<'URGENT' | 'ROUTINE'>('ROUTINE');
  const [medicineList, setMedicineList] = useState<{name: string, qty: number, priority: string}[]>([]);
  const [isSubmittingMedicines, setIsSubmittingMedicines] = useState(false);
  const [medicineSuccess, setMedicineSuccess] = useState(false);

  // Clinical reports / notes state
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [isFilingReport, setIsFilingReport] = useState(false);
  const [fileSuccess, setFileSuccess] = useState(false);

  // Daily Clinic Report State
  const [reportText, setReportText] = useState('');
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [transmissionId, setTransmissionId] = useState<number | null>(null);

  // Export Hub states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Helper to trigger browser downloads of CSV string
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Active Patient Triage Summary
  const handleExportActivePatient = (format: 'PDF' | 'CSV') => {
    if (!activePatient) return;
    
    if (format === 'CSV') {
      const headers = [
        "Patient ID", "Name", "Age", "Gender", "Priority", "Intake Time",
        "Chief Complaint", "Heart Rate (bpm)", "Blood Pressure (mmHg)", 
        "Body Temperature (F)", "Oxygen Saturation (SpO2)", "Clinical Observations", 
        "Prescribed Treatment Plan", "Exported At"
      ];
      
      const escapeCSV = (val: string | number) => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const row = [
        activePatient.id,
        activePatient.name,
        activePatient.age,
        activePatient.gender,
        activePatient.priority,
        activePatient.time,
        activePatient.reason,
        activePatient.vitals.hr,
        activePatient.vitals.bp,
        activePatient.vitals.temp,
        activePatient.vitals.spo2,
        doctorNotes || "No observations recorded yet.",
        prescriptionText || "No prescriptions recorded yet.",
        new Date().toLocaleString()
      ];
      
      const csvContent = "\uFEFF" + [headers.join(","), row.map(escapeCSV).join(",")].join("\n");
      downloadCSV(csvContent, `triage_summary_${activePatient.id}_${activePatient.name.replace(/\s+/g, '_')}.csv`);
    } else {
      generateActivePatientPDF();
    }
  };

  const generateActivePatientPDF = () => {
    if (!activePatient) return;
    const doc = new jsPDF();
    
    // Outer frame border (subtle)
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);
    
    // Header section
    doc.setFillColor(15, 23, 42); // slate-900 (dark banner)
    doc.rect(10, 10, 190, 25, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("SWASTHYA SARATHI CLINICAL COMMAND", 15, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Official Digital Health Record & Patient Triage Summary", 15, 28);
    
    // Centre details (Right side of header banner)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("SUB-CENTRE CLINIC LOG", 155, 20);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 155, 25);
    doc.text(`TIME: ${new Date().toLocaleTimeString()}`, 155, 29);

    // Patient Info Block Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("PATIENT DEMOGRAPHIC & CASE DETAILS", 15, 45);
    
    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 48, 195, 48);
    
    // Grid background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, 52, 180, 32, "F");
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.rect(15, 52, 180, 32, "S");
    
    // Patient details contents
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    
    // Row 1
    doc.setFont("Helvetica", "bold");
    doc.text("Patient Name:", 20, 59);
    doc.setFont("Helvetica", "normal");
    doc.text(activePatient.name, 48, 59);
    
    doc.setFont("Helvetica", "bold");
    doc.text("Patient ID:", 115, 59);
    doc.setFont("Helvetica", "normal");
    doc.text(activePatient.id, 140, 59);
    
    // Row 2
    doc.setFont("Helvetica", "bold");
    doc.text("Age / Gender:", 20, 67);
    doc.setFont("Helvetica", "normal");
    doc.text(`${activePatient.age} Years / ${activePatient.gender}`, 48, 67);
    
    doc.setFont("Helvetica", "bold");
    doc.text("Triage Priority:", 115, 67);
    
    // Coloring triage priority text based on critical state
    doc.setFont("Helvetica", "bold");
    if (activePatient.priority === 'CRITICAL') {
      doc.setTextColor(220, 38, 38); // red-600
    } else if (activePatient.priority === 'WARNING') {
      doc.setTextColor(217, 119, 6); // amber-600
    } else {
      doc.setTextColor(5, 150, 105); // emerald-600
    }
    doc.text(activePatient.priority, 145, 67);
    doc.setTextColor(71, 85, 105); // Restore text color
    
    // Row 3
    doc.setFont("Helvetica", "bold");
    doc.text("Admit Time:", 20, 75);
    doc.setFont("Helvetica", "normal");
    doc.text(activePatient.time, 48, 75);
    
    doc.setFont("Helvetica", "bold");
    doc.text("Chief Complaint:", 20, 81);
    doc.setFont("Helvetica", "normal");
    doc.text(activePatient.reason, 52, 81);

    // Vitals section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("INTAKE VITAL SIGNS & TELEMETRY", 15, 95);
    doc.line(15, 98, 195, 98);
    
    // Vitals Columns (4 blocks)
    const vitalsX = [15, 60, 105, 150];
    const blockW = 40;
    
    // HR Block
    doc.setFillColor(254, 242, 242); // red-50
    doc.rect(vitalsX[0], 102, blockW, 22, "F");
    doc.setDrawColor(254, 226, 226); // red-100
    doc.rect(vitalsX[0], 102, blockW, 22, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68); // red-500
    doc.text("HEART RATE", vitalsX[0] + 4, 107);
    doc.setFontSize(14);
    doc.text(`${activePatient.vitals.hr}`, vitalsX[0] + 4, 116);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("bpm", vitalsX[0] + 24, 116);
    doc.setFontSize(7);
    doc.setTextColor(127, 29, 29);
    doc.text(activePatient.vitals.hr > 100 ? "Tachycardia" : "Normal", vitalsX[0] + 4, 121);
    
    // BP Block
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.rect(vitalsX[1], 102, blockW, 22, "F");
    doc.setDrawColor(224, 231, 255); // indigo-100
    doc.rect(vitalsX[1], 102, blockW, 22, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("BLOOD PRESSURE", vitalsX[1] + 4, 107);
    doc.setFontSize(14);
    doc.text(`${activePatient.vitals.bp}`, vitalsX[1] + 4, 116);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("mmHg", vitalsX[1] + 24, 116);
    doc.setFontSize(7);
    doc.setTextColor(30, 27, 75);
    doc.text(activePatient.vitals.bp.startsWith('14') ? "Stage 1 HTN" : "Normal", vitalsX[1] + 4, 121);

    // Temp Block
    doc.setFillColor(255, 251, 235); // amber-50
    doc.rect(vitalsX[2], 102, blockW, 22, "F");
    doc.setDrawColor(254, 243, 199); // amber-100
    doc.rect(vitalsX[2], 102, blockW, 22, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text("BODY TEMP", vitalsX[2] + 4, 107);
    doc.setFontSize(14);
    doc.text(`${activePatient.vitals.temp}°F`, vitalsX[2] + 4, 116);
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 4);
    doc.text(activePatient.vitals.temp > 100 ? "Pyrexia" : "Normal", vitalsX[2] + 4, 121);

    // SpO2 Block
    doc.setFillColor(240, 253, 250); // teal-50
    doc.rect(vitalsX[3], 102, blockW, 22, "F");
    doc.setDrawColor(204, 251, 241); // teal-100
    doc.rect(vitalsX[3], 102, blockW, 22, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136); // teal-600
    doc.text("OXYGEN LEVEL", vitalsX[3] + 4, 107);
    doc.setFontSize(14);
    doc.text(`${activePatient.vitals.spo2}%`, vitalsX[3] + 4, 116);
    doc.setFontSize(7);
    doc.setTextColor(19, 78, 74);
    doc.text(activePatient.vitals.spo2 < 95 ? "Hypoxia Warning" : "Optimal", vitalsX[3] + 4, 121);

    // Clinical Observations (Doctor notes)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("DIAGNOSTICS & CLINICAL OBSERVATIONS", 15, 137);
    doc.line(15, 140, 195, 140);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700
    
    const notesText = doctorNotes || "No specific observations or diagnostic findings recorded.";
    const notesLines = doc.splitTextToSize(notesText, 178);
    
    let currentY = 145;
    notesLines.forEach((line: string) => {
      if (currentY > 260) { doc.addPage(); currentY = 20; }
      doc.text(line, 16, currentY);
      currentY += 5.5;
    });

    // Treatment / Prescription Plan
    currentY += 5;
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("PRESCRIBED TREATMENT PLAN & PHARMACEUTICALS", 15, currentY);
    doc.line(15, currentY + 3, 195, currentY + 3);
    currentY += 8;
    
    doc.setFont("Courier", "bold"); // clinical monospace look
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // slate-800
    
    const prescText = prescriptionText || "No prescriptions or clinical directives issued.";
    const prescLines = doc.splitTextToSize(prescText, 178);
    
    prescLines.forEach((line: string) => {
      if (currentY > 260) { doc.addPage(); currentY = 20; }
      doc.text(line, 16, currentY);
      currentY += 5;
    });
    
    // Footer Sign-off
    currentY += 15;
    if (currentY > 250) { doc.addPage(); currentY = 30; }
    
    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY, 195, currentY);
    currentY += 10;
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("MED PRACTITIONER SIGN-OFF", 15, currentY);
    doc.text("DISCLAIMER", 120, currentY);
    
    currentY += 5;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Dr. Swasthya Sarathi, MD", 15, currentY);
    doc.text("This triage record is generated on Swasthya Sarathi", 120, currentY);
    
    currentY += 4;
    doc.text("Sub-Centre Clinical In-charge", 15, currentY);
    doc.text("and is intended for standard primary health integration.", 120, currentY);
    
    currentY += 6;
    doc.setFont("Helvetica", "italic");
    doc.text("Electronically Signed & Secured", 15, currentY);
    
    doc.save(`Triage_Record_${activePatient.id}_${activePatient.name.replace(/\s+/g, '_')}.pdf`);
  };

  // 2. Export Patient Reception Queue
  const handleExportQueue = (format: 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      const headers = [
        "Patient ID", "Name", "Age", "Gender", "Priority", "Arrival Time",
        "Chief Complaint", "Heart Rate (bpm)", "Blood Pressure", "Temp (F)", "SpO2 (%)", "Exported At"
      ];
      
      const escapeCSV = (val: string | number) => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const rows = patients.map(p => [
        p.id,
        p.name,
        p.age,
        p.gender,
        p.priority,
        p.time,
        p.reason,
        p.vitals.hr,
        p.vitals.bp,
        p.vitals.temp,
        p.vitals.spo2,
        new Date().toLocaleString()
      ]);
      
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.map(escapeCSV).join(","))].join("\n");
      downloadCSV(csvContent, `reception_queue_log_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      generateQueuePDF();
    }
  };

  const generateQueuePDF = () => {
    const doc = new jsPDF();
    
    // Outer frame
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, 10, 190, 277);
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(10, 10, 190, 25, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("SWASTHYA SARATHI CLINICAL REPORT", 15, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Patient Intake Reception Queue Logs", 15, 28);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("RECEPTION QUEUE", 155, 20);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 155, 25);
    doc.text(`TOTAL PENDING: ${patients.length}`, 155, 29);

    // Queue Details Section Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("PATIENTS CURRENTLY IN QUEUE", 15, 45);
    doc.line(15, 48, 195, 48);
    
    if (patients.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("There are no patients currently in the intake reception queue.", 15, 58);
    } else {
      // Render table
      let tableY = 55;
      
      // Header Row
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, tableY, 180, 8, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      
      doc.text("ID", 17, tableY + 5.5);
      doc.text("NAME / DEMOGRAPHICS", 32, tableY + 5.5);
      doc.text("PRIORITY", 82, tableY + 5.5);
      doc.text("TIME", 102, tableY + 5.5);
      doc.text("CHIEF COMPLAINT", 115, tableY + 5.5);
      doc.text("VITALS (HR/BP/TEMP/O2)", 160, tableY + 5.5);
      
      tableY += 8;
      
      patients.forEach((p, idx) => {
        // Alternate rows
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252); // slate-50
          doc.rect(15, tableY, 180, 10, "F");
        }
        
        doc.setDrawColor(241, 245, 249);
        doc.line(15, tableY + 10, 195, tableY + 10);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        
        doc.text(p.id, 17, tableY + 6.5);
        
        doc.setFont("Helvetica", "bold");
        doc.text(p.name, 32, tableY + 5);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`${p.gender}, ${p.age} yrs`, 32, tableY + 8.5);
        
        doc.setFontSize(8);
        doc.setFont("Helvetica", "bold");
        if (p.priority === 'CRITICAL') {
          doc.setTextColor(220, 38, 38);
        } else if (p.priority === 'WARNING') {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(5, 150, 105);
        }
        doc.text(p.priority, 82, tableY + 6.5);
        
        doc.setTextColor(51, 65, 85);
        doc.setFont("Helvetica", "normal");
        doc.text(p.time, 102, tableY + 6.5);
        
        const reasonText = doc.splitTextToSize(p.reason, 42);
        doc.text(reasonText[0] || "", 115, tableY + 6);
        
        const vitalsStr = `${p.vitals.hr} | ${p.vitals.bp} | ${p.vitals.temp}F | ${p.vitals.spo2}%`;
        doc.setFontSize(7.5);
        doc.setFont("Helvetica", "normal");
        doc.text(vitalsStr, 160, tableY + 6.5);
        
        tableY += 10;
        
        if (tableY > 260) {
          doc.addPage();
          tableY = 20;
        }
      });
    }
    
    // Footer
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Swasthya Sarathi Primary Triage Log", 15, 280);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 145, 280);
    
    doc.save(`Reception_Queue_Log_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // 3. Export Epidemiology Telemetry Report
  const handleExportTelemetry = (format: 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      const headers = [
        "Day", "Respiratory (Cases)", "Cardiac Issues (Cases)", "General Fever (Cases)", "Total Syndromic Intake"
      ];
      
      const rows = weeklyAnalytics.map(d => [
        d.day,
        d.respiratory,
        d.cardiac,
        d.general,
        d.respiratory + d.cardiac + d.general
      ]);
      
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      downloadCSV(csvContent, `epidemiological_telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      generateTelemetryPDF();
    }
  };

  const generateTelemetryPDF = () => {
    const doc = new jsPDF();
    
    // Outer frame
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, 10, 190, 277);
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(10, 10, 190, 25, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("SWASTHYA SARATHI EPIDEMIOLOGY", 15, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Disease & Syndromic Outbreak Telemetry Report", 15, 28);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("IDSP TELEMETRY", 155, 20);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 155, 25);
    doc.text("REPORT LEVEL: SUB-CENTRE", 155, 29);

    // Summary Section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("SYNDROMIC TELEMETRY SUMMARY (7-DAY OUTLOOK)", 15, 45);
    doc.line(15, 48, 195, 48);
    
    const totalResp = weeklyAnalytics.reduce((sum, d) => sum + d.respiratory, 0);
    const totalCard = weeklyAnalytics.reduce((sum, d) => sum + d.cardiac, 0);
    const totalGen = weeklyAnalytics.reduce((sum, d) => sum + d.general, 0);
    const grandTotal = totalResp + totalCard + totalGen;
    
    const boxW = 55;
    const boxY = 53;
    const boxesX = [15, 75, 135];
    
    // Resp Box
    doc.setFillColor(245, 243, 255); // indigo-50
    doc.rect(boxesX[0], boxY, boxW, 20, "F");
    doc.setDrawColor(237, 233, 254);
    doc.rect(boxesX[0], boxY, boxW, 20, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text("RESPIRATORY CASES", boxesX[0] + 4, boxY + 6);
    doc.setFontSize(12);
    doc.text(`${totalResp}`, boxesX[0] + 4, boxY + 15);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("cases total", boxesX[0] + 18, boxY + 15);
    
    // Cardiac Box
    doc.setFillColor(254, 242, 242); // red-50
    doc.rect(boxesX[1], boxY, boxW, 20, "F");
    doc.setDrawColor(254, 226, 226);
    doc.rect(boxesX[1], boxY, boxW, 20, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    doc.text("CARDIAC ANOMALIES", boxesX[1] + 4, boxY + 6);
    doc.setFontSize(12);
    doc.text(`${totalCard}`, boxesX[1] + 4, boxY + 15);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("cases total", boxesX[1] + 18, boxY + 15);

    // General Outbreaks Box
    doc.setFillColor(240, 253, 250); // teal-50
    doc.rect(boxesX[2], boxY, boxW, 20, "F");
    doc.setDrawColor(204, 251, 241);
    doc.rect(boxesX[2], boxY, boxW, 20, "S");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136);
    doc.text("GENERAL FEVERS", boxesX[2] + 4, boxY + 6);
    doc.setFontSize(12);
    doc.text(`${totalGen}`, boxesX[2] + 4, boxY + 15);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("cases total", boxesX[2] + 18, boxY + 15);

    // Table
    let tableY = 82;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("DAY-BY-DAY INCIDENCE DATABASE", 15, tableY);
    doc.line(15, tableY + 3, 195, tableY + 3);
    tableY += 7;
    
    doc.setFillColor(241, 245, 249);
    doc.rect(15, tableY, 180, 8, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    
    doc.text("DAY OF WEEK", 20, tableY + 5.5);
    doc.text("RESPIRATORY", 55, tableY + 5.5);
    doc.text("CARDIAC ISSUES", 90, tableY + 5.5);
    doc.text("GENERAL FEVER", 125, tableY + 5.5);
    doc.text("DAILY AGGREGATE", 160, tableY + 5.5);
    
    tableY += 8;
    
    weeklyAnalytics.forEach((dayData, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, tableY, 180, 9, "F");
      }
      
      doc.setDrawColor(241, 245, 249);
      doc.line(15, tableY + 9, 195, tableY + 9);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      
      const dayFullMap: Record<string, string> = {
        Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
        Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
      };
      
      doc.setFont("Helvetica", "bold");
      doc.text(dayFullMap[dayData.day] || dayData.day, 20, tableY + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.text(`${dayData.respiratory} cases`, 55, tableY + 6);
      doc.text(`${dayData.cardiac} cases`, 90, tableY + 6);
      doc.text(`${dayData.general} cases`, 125, tableY + 6);
      
      doc.setFont("Helvetica", "bold");
      doc.text(`${dayData.respiratory + dayData.cardiac + dayData.general} cases`, 160, tableY + 6);
      
      tableY += 9;
    });
    
    // Total row
    doc.setFillColor(241, 245, 249);
    doc.rect(15, tableY, 180, 9, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    
    doc.text("GRAND TOTAL", 20, tableY + 6);
    doc.text(`${totalResp} cases`, 55, tableY + 6);
    doc.text(`${totalCard} cases`, 90, tableY + 6);
    doc.text(`${totalGen} cases`, 125, tableY + 6);
    doc.text(`${grandTotal} cases`, 160, tableY + 6);
    
    tableY += 15;
    
    // Interpretation notes
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("EPIDEMIOLOGICAL SURVEILLANCE FEEDBACK & INTERPRETATION", 15, tableY);
    doc.line(15, tableY + 2.5, 195, tableY + 2.5);
    tableY += 8;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    
    const commentText = `Weekly data shows respiratory symptoms remain the predominant syndromic pattern (${Math.round((totalResp/grandTotal)*100)}% of total caseload), followed by general fevers. Cardiac events constitute a smaller but highly critical segment (${Math.round((totalCard/grandTotal)*100)}%). This indicates stable, expected seasonal trends for respiratory and fever patterns, with standard baseline cardiac activity. The transmission levels are normal and do not indicate immediate regional epidemiological outbreak thresholds for secondary investigation.`;
    
    const commentLines = doc.splitTextToSize(commentText, 178);
    commentLines.forEach((line: string) => {
      doc.text(line, 16, tableY);
      tableY += 5;
    });
    
    // Footer
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Swasthya Sarathi Epidemiological Outbreak Log (IDSP Compliant)", 15, 280);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 145, 280);
    
    doc.save(`Epidemiological_Telemetry_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Timer for Call Reception
  useEffect(() => {
    if (!isCallActive) return;
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCallActive]);

  const handleCallReception = () => {
    setCallDuration(0);
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      setIsCallActive(true);
    }, 2000); // 2 second mock ringing delay
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
  };

  const addMedicineRequest = () => {
    if (!medicineName || !medicineQty) return;
    setMedicineList([
      ...medicineList,
      { name: medicineName, qty: parseInt(medicineQty, 10), priority: medicinePriority }
    ]);
    setMedicineName('');
    setMedicineQty('');
  };

  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medicineList.length === 0) return;
    setIsSubmittingMedicines(true);
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmittingMedicines(false);
    setMedicineSuccess(true);
    setTimeout(() => {
      setMedicineSuccess(false);
      setIsMedicineModalOpen(false);
      setMedicineList([]);
    }, 2000);
  };

  const handleFileReport = async () => {
    if (!activePatient) return;
    setIsFilingReport(true);
    // Simulate cloud compilation and electronic medical record filing
    await new Promise(resolve => setTimeout(resolve, 1800));
    setIsFilingReport(false);
    setFileSuccess(true);
    
    // Remove patient from list or mark them checked
    setTimeout(() => {
      setFileSuccess(false);
      setPatients(prev => prev.filter(p => p.id !== activePatient.id));
      setActivePatient(null);
      setDoctorNotes('');
      setPrescriptionText('');
    }, 2000);
  };

  const handleClinicReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText) return;
    setIsReportSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsReportSubmitting(false);
    setTransmissionId(Math.floor(1000 + Math.random() * 9000));
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportText('');
    }, 2500);
  };

  // Metrics visualizer mock data
  const weeklyAnalytics = [
    { day: 'Mon', respiratory: 15, cardiac: 3, general: 22 },
    { day: 'Tue', respiratory: 12, cardiac: 5, general: 18 },
    { day: 'Wed', respiratory: 18, cardiac: 4, general: 25 },
    { day: 'Thu', respiratory: 20, cardiac: 2, general: 19 },
    { day: 'Fri', respiratory: 14, cardiac: 6, general: 21 },
    { day: 'Sat', respiratory: 8, cardiac: 1, general: 15 },
    { day: 'Sun', respiratory: 5, cardiac: 2, general: 10 },
  ];

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden text-slate-900">
      
      {/* Top action header */}
      <div className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-800">Clinical Command Dashboard</h2>
          <span className="hidden md:inline px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100">
            Active Session
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Clinical Data
          </button>

          <button 
            onClick={() => setIsMedicineModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Pill className="w-4 h-4" /> Medicine Request
          </button>
          
          {isCallActive ? (
            <button 
              onClick={handleEndCall}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm animate-pulse"
            >
              <PhoneOff className="w-4 h-4 animate-bounce" /> Reception Connected ({formatDuration(callDuration)})
            </button>
          ) : (
            <button 
              onClick={handleCallReception}
              disabled={isCalling}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              {isCalling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Calling...
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" /> Call Reception
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Left sidebar queue & telemetry visuals */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6 shrink-0">
          
          {/* Vitals Telemetry overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-1 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Handled</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-bold text-slate-800">124</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">▲ 12% vs yesterday</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-1 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Queue</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-slate-800">{patients.length}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Est. delay 15 min</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-1 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Triage Alerts</span>
                <Activity className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xl font-bold text-slate-800">
                {patients.filter(p => p.priority === 'CRITICAL').length}
              </p>
              <p className="text-[10px] text-red-600 font-bold mt-1">Critical status active</p>
            </div>
          </div>

          {/* Upcoming Triage Checkups Queue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[350px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" /> Patient Reception Queue
              </h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                {patients.length} Ready
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-slate-600">All Patient Checkups Cleared</p>
                  <p className="text-[10px] text-slate-400 text-center px-4 mt-1">No pending preliminary diagnostics at this centre.</p>
                </div>
              ) : (
                patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setActivePatient(patient)}
                    className={`w-full text-left p-3 border rounded-xl flex justify-between items-center transition-all ${
                      activePatient?.id === patient.id 
                        ? 'bg-indigo-50/50 border-indigo-400 shadow-sm' 
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-800 text-xs">{patient.name}</p>
                        <span className="text-[10px] text-slate-400 font-medium">({patient.gender[0]}, {patient.age})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px] mt-0.5">{patient.reason}</p>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded mb-0.5 ${
                        patient.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        patient.priority === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {patient.priority}
                      </span>
                      <p className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {patient.time}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Patient Flow Telemetry / Graphs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[250px]">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Disease & Syndromic Telemetry
              </h3>
              <p className="text-[11px] text-slate-400">Weekly syndromic classification reports (Sub-Centre level)</p>
            </div>
            
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} 
                    labelStyle={{fontWeight: 'bold', fontSize: '11px'}}
                    itemStyle={{fontSize: '11px'}}
                  />
                  <Line type="monotone" dataKey="respiratory" name="Respiratory" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="cardiac" name="Cardiac Issues" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="general" name="General Fever" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Active Patient Consultation & Notes Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {activePatient ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
              
              {/* Header banner */}
              <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{activePatient.name}</h3>
                      <span className="text-xs text-indigo-300">({activePatient.gender}, {activePatient.age} yrs)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Complaints: {activePatient.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${
                    activePatient.priority === 'CRITICAL' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : activePatient.priority === 'WARNING' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    Priority: {activePatient.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {activePatient.id}</span>
                </div>
              </div>

              {/* Patient Vitals Grid */}
              <div className="grid grid-cols-4 border-b border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
                <div className="p-4 text-center">
                  <div className="flex justify-center items-center gap-1 text-red-500 mb-1">
                    <Heart className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Heart Rate</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">{activePatient.vitals.hr} <span className="text-[10px] font-normal text-slate-500">bpm</span></p>
                  <span className={`text-[9px] font-bold ${activePatient.vitals.hr > 100 ? 'text-red-600' : 'text-slate-400'}`}>
                    {activePatient.vitals.hr > 100 ? 'Tachycardia' : 'Normal'}
                  </span>
                </div>
                
                <div className="p-4 text-center">
                  <div className="flex justify-center items-center gap-1 text-indigo-500 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Blood Press.</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">{activePatient.vitals.bp}</p>
                  <span className={`text-[9px] font-bold ${activePatient.vitals.bp.startsWith('14') ? 'text-amber-600' : 'text-slate-400'}`}>
                    {activePatient.vitals.bp.startsWith('14') ? 'Stage 1 HTN' : 'Normal'}
                  </span>
                </div>

                <div className="p-4 text-center">
                  <div className="flex justify-center items-center gap-1 text-amber-600 mb-1">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Body Temp</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">{activePatient.vitals.temp}°F</p>
                  <span className={`text-[9px] font-bold ${activePatient.vitals.temp > 100 ? 'text-red-600' : 'text-slate-400'}`}>
                    {activePatient.vitals.temp > 100 ? 'Pyrexia' : 'Normal'}
                  </span>
                </div>

                <div className="p-4 text-center">
                  <div className="flex justify-center items-center gap-1 text-emerald-600 mb-1">
                    <Droplet className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">SpO2</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">{activePatient.vitals.spo2}%</p>
                  <span className={`text-[9px] font-bold ${activePatient.vitals.spo2 < 95 ? 'text-red-600' : 'text-slate-400'}`}>
                    {activePatient.vitals.spo2 < 95 ? 'Hypoxia warning' : 'Optimal'}
                  </span>
                </div>
              </div>

              {/* Consultation Input Panels */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[220px]">
                  
                  {/* Doctor Notes Area */}
                  <div className="flex flex-col">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" /> Diagnostics & Clinical Observations
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Type clinical observations, diagnostic findings, physical examination notes..."
                      className="flex-1 w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none font-medium text-slate-700 leading-relaxed placeholder:text-slate-400"
                    />
                  </div>

                  {/* Prescription / Treatment Area */}
                  <div className="flex flex-col">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-indigo-500" /> Prescribed Treatment Plan & Meds
                    </label>
                    <textarea
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder="e.g. Paracetamol 500mg (1-0-1) for 3 days, plenty of oral rehydration fluids, review clinic in 4 days."
                      className="flex-1 w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none font-mono text-slate-700 leading-relaxed placeholder:text-slate-400"
                    />
                  </div>

                </div>

                {/* Submitting Clinical Directives */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Export EMR:</span>
                    <button
                      onClick={() => handleExportActivePatient('PDF')}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                      title="Download Patient Triage EMR as PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-red-500" /> PDF Summary
                    </button>
                    <button
                      onClick={() => handleExportActivePatient('CSV')}
                      className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                      title="Export Patient Triage EMR as CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> CSV Log
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setDoctorNotes("Patient exhibits stable vitals. Confirmed mild viral pharyngitis based on chest examination. Adequate oxygen saturation. Rest advised.");
                        setPrescriptionText("1. Tab Paracetamol 500mg - twice daily as needed for fever\n2. Warm saline gargles 3-4 times a day\n3. Warm steam inhalation at bedtime");
                      }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors active:scale-[0.98]"
                    >
                      Load Standard Clinical template
                    </button>
                    
                    <button
                      onClick={handleFileReport}
                      disabled={isFilingReport || fileSuccess || (!doctorNotes && !prescriptionText)}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      {isFilingReport ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Compiling Health Records...
                        </>
                      ) : fileSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" /> EMR Saved Successfully
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4" /> Save EMR & File Case Record
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center flex-1 text-center min-h-[350px]">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No Active Consultation selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Please select an upcoming preliminary diagnosis card from the queue on the left side to review vitals and file clinical reports.
              </p>
              <button
                onClick={() => {
                  if (patients.length > 0) setActivePatient(patients[0]);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                Start Next Patient
              </button>
            </div>
          )}

          {/* Area Reporting: Send clinic updates to District Health Officer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Central District Reporting Area
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Transmit daily epidemiological logs, clinical stock summaries, or critical health alerts directly to the Integrated Disease Surveillance Programme (IDSP).
            </p>
            <form onSubmit={handleClinicReportSubmit} className="flex gap-2">
              <input
                required
                type="text"
                placeholder="Type daily clinic log, disease outbreaks, or medicine shortages here..."
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={isReportSubmitting || reportSuccess}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.97]"
              >
                {isReportSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : reportSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <>
                    <Send className="w-3 h-3" /> Transmit
                  </>
                )}
              </button>
            </form>
            {reportSuccess && transmissionId && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sent safely! IDSP Transmission ID: SS-IDSP-{transmissionId}
              </p>
            )}
          </div>

        </div>

      </div>

      {/* MODAL: Medicine Request */}
      {isMedicineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Emergency Drug & Consumables Request</h3>
              </div>
              <button onClick={() => setIsMedicineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-500 mb-4">
                Request restocking or immediate redirection of pharmaceutical supplies from nearby Community Health Centres (CHCs) or the regional medical store.
              </p>

              <form onSubmit={handleMedicineSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Item / Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tab Amoxicillin 250mg, IV Fluids"
                      value={medicineName}
                      onChange={e => setMedicineName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={medicineQty}
                      onChange={e => setMedicineQty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMedicinePriority('ROUTINE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        medicinePriority === 'ROUTINE' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      Routine Restock
                    </button>
                    <button
                      type="button"
                      onClick={() => setMedicinePriority('URGENT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        medicinePriority === 'URGENT' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      Urgent Stock-Out Alert
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addMedicineRequest}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to List
                  </button>
                </div>

                {/* Medicine List */}
                <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-3 min-h-[100px] max-h-[140px] overflow-y-auto">
                  {medicineList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-6">No medicines added to the list yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {medicineList.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200/60 text-xs">
                          <span className="font-semibold text-slate-700">{med.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">Qty: {med.qty}</span>
                            <span className={`px-1 rounded text-[9px] font-bold uppercase ${
                              med.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {med.priority}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMedicineList(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Drug Request */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMedicineModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMedicines || medicineSuccess || medicineList.length === 0}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs px-5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {isSubmittingMedicines ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Transmitting Request...
                      </>
                    ) : medicineSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dispatched Successfully
                      </>
                    ) : (
                      <>
                        Transmit Drug Allocation Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Full calling overlay simulation */}
      {isCalling && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 text-white">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <PhoneCall className="w-10 h-10 text-white animate-bounce" />
          </div>
          <h3 className="text-xl font-bold mb-1 tracking-tight">Ringing Sub-Centre Reception</h3>
          <p className="text-xs text-slate-400">Establishing clean voice connection channel...</p>
        </div>
      )}

      {/* MODAL: Clinical Data Export Hub */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Clinical Data Export Hub</h3>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-xs text-slate-500 leading-relaxed">
                Welcome to the Medical Records Export Portal. You can export high-fidelity medical records, intake metrics, and epidemic outbreak diagnostics as official PDF certificates or standardized raw CSV database logs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Active Patient Triage Summary */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-[180px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">Active Consultation</span>
                    <h4 className="font-bold text-xs text-slate-800 leading-snug">
                      {activePatient ? `Summary: ${activePatient.name}` : 'No Active Patient Selected'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      Export clinical notes, vital telemetry measurements, and treatment plans for the currently selected patient.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        handleExportActivePatient('PDF');
                      }}
                      disabled={!activePatient}
                      className="flex-1 flex justify-center items-center gap-1 bg-white hover:bg-slate-100 disabled:opacity-50 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      <Download className="w-3 h-3 text-red-500" /> PDF
                    </button>
                    <button
                      onClick={() => {
                        handleExportActivePatient('CSV');
                      }}
                      disabled={!activePatient}
                      className="flex-1 flex justify-center items-center gap-1 bg-white hover:bg-slate-100 disabled:opacity-50 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> CSV
                    </button>
                  </div>
                </div>

                {/* 2. Full Patient Queue logs */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-[180px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">Reception Logs</span>
                    <h4 className="font-bold text-xs text-slate-800 leading-snug">Patient Intake Queue</h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      Export full diagnostic log reports of the {patients.length} patients waiting in the triage reception queue.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleExportQueue('PDF')}
                      className="flex-1 flex justify-center items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      <Download className="w-3 h-3 text-red-500" /> PDF
                    </button>
                    <button
                      onClick={() => handleExportQueue('CSV')}
                      className="flex-1 flex justify-center items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> CSV
                    </button>
                  </div>
                </div>

                {/* 3. Epidemiological Telemetry Report */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between h-[180px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Outbreak Surveillance</span>
                    <h4 className="font-bold text-xs text-slate-800 leading-snug">IDSP Disease Telemetry</h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      Export structured surveillance database logs containing syndromic cases categorized at the clinic level.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleExportTelemetry('PDF')}
                      className="flex-1 flex justify-center items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      <Download className="w-3 h-3 text-red-500" /> PDF
                    </button>
                    <button
                      onClick={() => handleExportTelemetry('CSV')}
                      className="flex-1 flex justify-center items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[11px] text-amber-800 leading-normal">
                <strong>Data Privacy Notice (MCI & Clinical Protocol):</strong> Exported documents may contain Protected Health Information (PHI) subject to regional healthcare guidelines. Ensure proper clinical clearance prior to local file duplication or physical transmission.
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
