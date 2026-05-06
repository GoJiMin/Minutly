import {create} from 'zustand';
import {RequestError} from '@/shared/api/error';

type State = {
  globalError: RequestError | null;
};

type Action = {
  updateError: (globalError: RequestError) => void;
  resetError: () => void;
};

const globalErrorStore = create<State & Action>(set => ({
  globalError: null,

  updateError: error => set({globalError: error}),
  resetError: () => set({globalError: null}),
}));

export const useGlobalError = () => globalErrorStore(state => state.globalError);
export const useUpdateGlobalError = () => globalErrorStore(state => state.updateError);
export const useResetGlobalError = () => globalErrorStore(state => state.resetError);
