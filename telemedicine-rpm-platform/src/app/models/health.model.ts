export interface VitalReading {
  id: number;
  type: 'Heart rate' | 'Blood pressure' | 'SpO₂' | 'Temperature';
  value: string;
  unit: string;
  recordedAt: string;
  status: 'normal' | 'warning';
}
export interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  mode: 'Video' | 'Phone';
  status: 'Confirmed' | 'Pending';
}
export interface HealthAlert {
  id: number;
  title: string;
  detail: string;
  time: string;
  level: 'warning' | 'info';
  acknowledged: boolean;
}