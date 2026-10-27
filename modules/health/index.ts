import { requireOptionalNativeModule } from 'expo';

// Apple Health, read-only (see ios/HealthModule.swift). Until the app is
// rebuilt with this native code it's unavailable and the Health parts of
// the app stay hidden.

type HealthNative = {
  isAvailable(): boolean;
  requestAccess(): Promise<boolean>;
  bodyMass(days: number): Promise<{ date: string; lb: number }[]>;
  sleep(days: number): Promise<{ night: string; hours: number }[]>;
  dailyAverage(kind: 'hrv' | 'restingHeartRate', days: number): Promise<{ date: string; value: number }[]>;
};

const native = requireOptionalNativeModule<HealthNative>('Health');

export function healthAvailable() {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
}

export async function requestHealthAccess() {
  try {
    return native ? await native.requestAccess() : false;
  } catch {
    return false;
  }
}

async function safe<T>(read: () => Promise<T[]> | undefined): Promise<T[]> {
  try {
    return (await read()) ?? [];
  } catch {
    return [];
  }
}

export const readBodyMass = (days: number) => safe(() => native?.bodyMass(days));
export const readSleep = (days: number) => safe(() => native?.sleep(days));
export const readDailyAverage = (kind: 'hrv' | 'restingHeartRate', days: number) => safe(() => native?.dailyAverage(kind, days));
