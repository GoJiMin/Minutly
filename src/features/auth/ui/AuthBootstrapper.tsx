'use client';

import {useAuthCheckQuery} from '@/entities/auth';

export function AuthBootstrapper() {
  useAuthCheckQuery();

  return null;
}
