import {z} from 'zod';
import type {MicrophoneDevice} from '../model/types';
import {localStorageClient} from '@/shared/utils';

const preferredMicrophoneSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
});

export type PreferredMicrophone = z.infer<typeof preferredMicrophoneSchema>;

const PREFERRED_MICROPHONE_STORAGE_KEY = 'preferred-microphone:v1';

export function savePreferredMicrophone(microphone: MicrophoneDevice) {
  const result = preferredMicrophoneSchema.safeParse(microphone);

  if (!result.success) return;

  localStorageClient.write(PREFERRED_MICROPHONE_STORAGE_KEY, result.data);
}

export function readPreferredMicrophone() {
  const value = localStorageClient.read(PREFERRED_MICROPHONE_STORAGE_KEY);
  const result = preferredMicrophoneSchema.safeParse(value);

  if (!result.success) {
    localStorageClient.remove(PREFERRED_MICROPHONE_STORAGE_KEY);
    return null;
  }

  return result.data;
}

export function removePreferredMicrophone() {
  localStorageClient.remove(PREFERRED_MICROPHONE_STORAGE_KEY);
}
