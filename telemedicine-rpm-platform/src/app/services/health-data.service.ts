import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment, HealthAlert, VitalReading } from '../models/health.model';

const initialVitals: VitalReading[] = [
  { id: 1, type: 'Heart rate', value: '76', unit: 'bpm', recordedAt: 'Today, 9:42 AM', status: 'normal' },
  { id: 2, type: 'Blood pressure', value: '120/80', unit: 'mmHg', recordedAt: 'Today, 9:40 AM', status: 'normal' },
  { id: 3, type: 'SpO₂', value: '98', unit: '%', recordedAt: 'Today, 9:38 AM', status: 'normal' },
  { id: 4, type: 'Temperature', value: '36.8', unit: '°C', recordedAt: 'Today, 9:35 AM', status: 'normal' }
];
const initialAppointments: Appointment[] = [
  { id: 1, doctor: 'Dr. Ananya Mehta', specialty: 'General Physician', date: 'Today, Nov 03', time: '2:30 PM', mode: 'Video', status: 'Confirmed' },
  { id: 2, doctor: 'Dr. Rahul Shah', specialty: 'Cardiologist', date: 'Thu, Nov 05', time: '11:00 AM', mode: 'Video', status: 'Confirmed' },
  { id: 3, doctor: 'Dr. Priya Nair', specialty: 'Nutritionist', date: 'Mon, Nov 09', time: '4:15 PM', mode: 'Phone', status: 'Pending' }
];
const initialAlerts: HealthAlert[] = [
  { id: 1, title: 'Daily check-in completed', detail: 'Your morning vitals have been recorded.', time: 'Today · 9:42 AM', level: 'info', acknowledged: false },
  { id: 2, title: 'Stay hydrated', detail: 'A gentle reminder to drink water regularly.', time: 'Yesterday · 4:00 PM', level: 'warning', acknowledged: false }
];

@Injectable({ providedIn: 'root' })
export class HealthDataService {
  private readonly vitalsSubject = new BehaviorSubject<VitalReading[]>(this.load('carepulse-vitals', initialVitals));
  private readonly appointmentsSubject = new BehaviorSubject<Appointment[]>(this.load('carepulse-appointments', initialAppointments));
  private readonly alertsSubject = new BehaviorSubject<HealthAlert[]>(this.load('carepulse-alerts', initialAlerts));
  readonly vitals$ = this.vitalsSubject.asObservable();
  readonly appointments$ = this.appointmentsSubject.asObservable();
  readonly alerts$ = this.alertsSubject.asObservable();

  private load<T>(key: string, fallback: T): T {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback; }
    catch { return fallback; }
  }
  private save<T>(key: string, value: T): void { localStorage.setItem(key, JSON.stringify(value)); }

  addVital(reading: Omit<VitalReading, 'id' | 'recordedAt' | 'status'>): void {
    const numeric = Number(reading.value);
    const warning = reading.type === 'Heart rate' ? numeric < 55 || numeric > 100
      : reading.type === 'SpO₂' ? numeric < 95
      : reading.type === 'Temperature' ? numeric < 36 || numeric > 37.5
      : false;
    const item: VitalReading = { ...reading, id: Date.now(), recordedAt: 'Just now', status: warning ? 'warning' : 'normal' };
    const next = [item, ...this.vitalsSubject.value];
    this.vitalsSubject.next(next); this.save('carepulse-vitals', next);
    if (warning) this.addAlert({ title: `${reading.type} reading needs attention`, detail: `A new reading of ${reading.value} ${reading.unit} is outside this demo's configured range.`, level: 'warning' });
  }
  addAppointment(data: Omit<Appointment, 'id' | 'status'>): void {
    const next = [{ ...data, id: Date.now(), status: 'Pending' as const }, ...this.appointmentsSubject.value];
    this.appointmentsSubject.next(next); this.save('carepulse-appointments', next);
  }
  addAlert(data: Pick<HealthAlert, 'title' | 'detail' | 'level'>): void {
    const next = [{ ...data, id: Date.now(), time: 'Just now', acknowledged: false }, ...this.alertsSubject.value];
    this.alertsSubject.next(next); this.save('carepulse-alerts', next);
  }
  acknowledgeAlert(id: number): void {
    const next = this.alertsSubject.value.map(a => a.id === id ? { ...a, acknowledged: true } : a);
    this.alertsSubject.next(next); this.save('carepulse-alerts', next);
  }
  resetDemo(): void {
    localStorage.removeItem('carepulse-vitals'); localStorage.removeItem('carepulse-appointments'); localStorage.removeItem('carepulse-alerts');
    this.vitalsSubject.next(initialVitals); this.appointmentsSubject.next(initialAppointments); this.alertsSubject.next(initialAlerts);
  }
}