import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Appointment, HealthAlert, VitalReading } from './models/health.model';
import { HealthDataService } from './services/health-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  activePage = 'Overview';
  isLoggedIn = false;
  profile = { name: '', phone: '', birthDate: '' };
  loginForm = { name: '', phone: '', birthDate: '' };
  profileMessage = '';
  private readonly profileStorageKey = 'carepulse-patient-profile';
  vitals: VitalReading[] = [];
  appointments: Appointment[] = [];
  alerts: HealthAlert[] = [];
  showVitalForm = false;
  showAppointmentForm = false;
  showMedicationForm = false;
  showCall = false;
  medications: { id: number; name: string; dose: string; time: string; taken: boolean }[] = [];
  medicationForm = { name: '', dose: '', time: '08:00' };
  callActive = false;
  callSeconds = 0;
  private callTimer?: ReturnType<typeof setInterval>;
  private subscriptions = new Subscription();

  vitalForm = { type: 'Heart rate' as VitalReading['type'], value: '', unit: 'bpm' };
  doctors = [
    { name: 'Dr. Rahul Sharma', specialty: 'Cardiologist' },
    { name: 'Dr. Priya Patel', specialty: 'Dermatologist' },
    { name: 'Dr. Amit Verma', specialty: 'Neurologist' },
    { name: 'Dr. Sneha Kulkarni', specialty: 'Gynecologist' },
    { name: 'Dr. Rohan Mehta', specialty: 'Orthopedic' },
    { name: 'Dr. Neha Joshi', specialty: 'Pediatrician' },
    { name: 'Dr. Karan Shah', specialty: 'General Physician' },
    { name: 'Dr. Anjali Desai', specialty: 'Psychiatrist' },
    { name: 'Dr. Vikram Rao', specialty: 'Gastroenterologist' },
    { name: 'Dr. Pooja Nair', specialty: 'Ophthalmologist' }
  ];
  appointmentForm = { doctor: 'Dr. Rahul Sharma', specialty: 'Cardiologist', date: '', time: '10:00', mode: 'Video' as 'Video' | 'Phone' };

  constructor(private health: HealthDataService) {}
  ngOnInit(): void {
    this.subscriptions.add(this.health.vitals$.subscribe(v => this.vitals = v));
    this.subscriptions.add(this.health.appointments$.subscribe(a => this.appointments = a));
    this.subscriptions.add(this.health.alerts$.subscribe(a => this.alerts = a));
    this.loadMedications();
    this.loadProfile();
  }
  ngOnDestroy(): void { this.subscriptions.unsubscribe(); this.stopCall(); }

  navigate(page: string): void { this.activePage = page; }
  private loadProfile(): void {
    try {
      const saved = localStorage.getItem(this.profileStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { name?: string; phone?: string; birthDate?: string };
        if (parsed.name && parsed.phone && parsed.birthDate && sessionStorage.getItem('carepulse-session-active') === 'true') {
          this.profile = { name: parsed.name, phone: parsed.phone, birthDate: parsed.birthDate };
          this.loginForm = { ...this.profile };
          this.isLoggedIn = true;
        }
      }
    } catch { this.isLoggedIn = false; }
  }
  get patientAge(): number {
    if (!this.profile.birthDate) return 0;
    const birth = new Date(this.profile.birthDate + 'T00:00:00');
    if (Number.isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) age--;
    return age >= 0 ? age : 0;
  }
  get patientInitials(): string {
    return this.profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('') || 'PT';
  }
  signIn(): void {
    const name = this.loginForm.name.trim();
    const phone = this.loginForm.phone.replace(/\D/g, '');
    const birthDate = this.loginForm.birthDate;
    if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || !birthDate || new Date(birthDate) > new Date()) {
      this.profileMessage = 'Enter a valid name, 10-digit Indian mobile number and birth date.';
      return;
    }
    this.profile = { name, phone, birthDate };
    localStorage.setItem(this.profileStorageKey, JSON.stringify(this.profile));
    sessionStorage.setItem('carepulse-session-active', 'true');
    this.loginForm = { ...this.profile };
    this.profileMessage = '';
    this.isLoggedIn = true;
    this.activePage = 'Overview';
  }
  saveProfile(): void {
    const name = this.profile.name.trim();
    const phone = this.profile.phone.replace(/\D/g, '');
    if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || !this.profile.birthDate || new Date(this.profile.birthDate) > new Date()) {
      this.profileMessage = 'Please check your name, mobile number and birth date.';
      return;
    }
    this.profile = { name, phone, birthDate: this.profile.birthDate };
    localStorage.setItem(this.profileStorageKey, JSON.stringify(this.profile));
    this.profileMessage = 'Profile saved successfully.';
  }
  logout(): void {
    this.isLoggedIn = false;
    sessionStorage.removeItem('carepulse-session-active');
    this.activePage = 'Overview';
    this.loginForm = { ...this.profile };
    this.profileMessage = '';
  }
  getDateDay(date: string): string {
    const datePart = date.split(',')[1]?.trim() ?? '';
    return datePart.split(/\s+/)[1] ?? '03';
  }
  getDateMonth(date: string): string {
    const datePart = date.split(',')[1]?.trim() ?? '';
    return datePart.split(/\s+/)[0] ?? 'NOV';
  }
  createSupportRequest(): void {
    this.health.addAlert({ title: 'Support request created', detail: 'Your demo support request has been recorded.', level: 'info' });
    this.navigate('Alerts');
  }
  private loadMedications(): void {
    const defaults = [
      { id: 1, name: 'Vitamin D3', dose: '1 tablet', time: '08:00', taken: false },
      { id: 2, name: 'Daily multivitamin', dose: '1 tablet', time: '13:00', taken: false },
      { id: 3, name: 'Omega-3', dose: '1 capsule', time: '20:00', taken: true }
    ];
    try { this.medications = JSON.parse(localStorage.getItem('carepulse-medications') || 'null') || defaults; }
    catch { this.medications = defaults; }
  }
  private saveMedications(): void { localStorage.setItem('carepulse-medications', JSON.stringify(this.medications)); }
  toggleMedication(id: number): void {
    this.medications = this.medications.map(m => m.id === id ? { ...m, taken: !m.taken } : m);
    this.saveMedications();
  }
  addMedication(): void {
    if (!this.medicationForm.name.trim() || !this.medicationForm.dose.trim()) return;
    this.medications = [{ id: Date.now(), ...this.medicationForm, taken: false }, ...this.medications];
    this.saveMedications(); this.showMedicationForm = false;
    this.medicationForm = { name: '', dose: '', time: '08:00' };
  }
  removeMedication(id: number): void { this.medications = this.medications.filter(m => m.id !== id); this.saveMedications(); }
  get takenMedicationCount(): number { return this.medications.filter(m => m.taken).length; }
  get medicationProgress(): number { return this.medications.length ? Math.round(this.takenMedicationCount / this.medications.length * 100) : 0; }
  exportHealthReport(): void {
    const rows = [['Measurement', 'Value', 'Unit', 'Recorded at', 'Status'], ...this.vitals.map(v => [v.type, v.value, v.unit, v.recordedAt, v.status])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'carepulse-health-report.csv'; link.click(); URL.revokeObjectURL(url);
  }
  openVitals(): void { this.showVitalForm = true; this.vitalForm = { type: 'Heart rate', value: '', unit: 'bpm' }; }
  updateVitalUnit(): void {
    const units: Record<string, string> = { 'Heart rate': 'bpm', 'Blood pressure': 'mmHg', 'SpO₂': '%', 'Temperature': '°C' };
    this.vitalForm.unit = units[this.vitalForm.type];
  }
  saveVital(): void {
    if (!this.vitalForm.value.trim()) return;
    this.health.addVital(this.vitalForm); this.showVitalForm = false; this.vitalForm.value = '';
  }
  onDoctorChange(): void {
    const selectedDoctor = this.doctors.find(d => d.name === this.appointmentForm.doctor);
    if (selectedDoctor) this.appointmentForm.specialty = selectedDoctor.specialty;
  }

  saveAppointment(): void {
    if (!this.appointmentForm.date || !this.appointmentForm.time) return;
    this.health.addAppointment({ ...this.appointmentForm, date: new Date(this.appointmentForm.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }), time: this.appointmentForm.time });
    this.health.addAlert({ title: 'Appointment request submitted', detail: `Your request with ${this.appointmentForm.doctor} is pending confirmation.`, level: 'info' });
    this.showAppointmentForm = false;
  }
  startCall(): void { this.showCall = true; this.callActive = true; this.callSeconds = 0; this.callTimer = setInterval(() => this.callSeconds++, 1000); }
  stopCall(): void { if (this.callTimer) clearInterval(this.callTimer); this.callTimer = undefined; this.callActive = false; }
  closeCall(): void { this.stopCall(); this.showCall = false; }
  get callTime(): string { return `${Math.floor(this.callSeconds / 60).toString().padStart(2, '0')}:${(this.callSeconds % 60).toString().padStart(2, '0')}`; }
  acknowledge(id: number): void { this.health.acknowledgeAlert(id); }
  resetDemo(): void { this.health.resetDemo(); localStorage.removeItem('carepulse-medications'); this.loadMedications(); }
  get unacknowledgedAlerts(): number { return this.alerts.filter(a => !a.acknowledged).length; }
  get latestVitals(): VitalReading[] {
    const order: VitalReading['type'][] = ['Heart rate', 'Blood pressure', 'SpO₂', 'Temperature'];
    return order.map(type => this.vitals.find(v => v.type === type)).filter((v): v is VitalReading => !!v);
  }
  get vitalIcon(): string {
    return ({ 'Heart rate': '♡', 'Blood pressure': '⌁', 'SpO₂': '◉', 'Temperature': '♨' } as Record<string, string>)[this.vitalForm.type];
  }
}