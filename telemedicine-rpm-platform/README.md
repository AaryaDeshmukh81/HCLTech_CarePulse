# CarePulse — Telemedicine & Remote Patient Monitoring

A responsive Angular patient-care dashboard prototype built with Angular 20, TypeScript, HTML, CSS and RxJS.

## Features
- Patient sign-in/profile setup using full name, 10-digit mobile number and date of birth
- Automatically calculated age and editable patient profile
- Patient profile stored in browser localStorage; demo session state stored in sessionStorage
- Appointment booking with 10 selectable healthcare providers and specialties
- Vital monitoring for heart rate, blood pressure, SpO₂ and temperature
- Configurable sample-reading alerts
- Appointment list and simulated teleconsultation screen
- Medication tracker with taken/upcoming status and adherence percentage
- Health reading history and CSV export
- Support request notifications
- Responsive desktop and mobile layout

## Available demo doctors
1. Dr. Rahul Sharma — Cardiologist
2. Dr. Priya Patel — Dermatologist
3. Dr. Amit Verma — Neurologist
4. Dr. Sneha Kulkarni — Gynecologist
5. Dr. Rohan Mehta — Orthopedic
6. Dr. Neha Joshi — Pediatrician
7. Dr. Karan Shah — General Physician
8. Dr. Anjali Desai — Psychiatrist
9. Dr. Vikram Rao — Gastroenterologist
10. Dr. Pooja Nair — Ophthalmologist

## Run in VS Code
1. Install Node.js 20.19+ / 22.12+ / 24+ and VS Code.
2. Extract this ZIP and open the `telemedicine-rpm-platform` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `npm install`.
5. Run `npm start`.
6. Open the localhost URL printed in the terminal (normally `http://localhost:4200`).

Use the Angular development server, not VS Code Live Server.

## Demo sign-in
Enter a full name, a valid 10-digit Indian mobile number and date of birth. Age is calculated automatically. The profile is saved in this browser. This is a demonstration sign-in only; it is not secure authentication and does not verify identity.

## Technology stack
- Angular 20 standalone component
- TypeScript
- HTML5 and CSS3
- RxJS BehaviorSubjects and observables
- Angular Forms
- Browser localStorage and sessionStorage for demo persistence

## Safety and privacy limitations
This is an educational prototype with sample data. It is not connected to real doctors, medical devices, emergency services, payment systems, video/audio infrastructure or an electronic health-record system. Do not enter real patient information or use readings for diagnosis or treatment. A production healthcare platform requires secure server-side authentication, role-based access, encrypted APIs and storage, consent, audit logs, validated device integrations, clinical review and applicable privacy/regulatory compliance.
