import {toast as sonnerToast} from 'sonner';
import {cva} from 'class-variance-authority';
import {CircleAlert, CircleCheckBig, Info, X} from 'lucide-react';
import {cn} from '../utils';

const toastContainerVariants = cva(
  'flex rounded-lg shadow-lg ring-1 ring-black/5 w-[calc(100vw-2rem)] max-w-md items-center p-4',
  {
    variants: {
      type: {
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-white',
        default: 'bg-white',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
);

const toastTitleVariants = cva('font-medium', {
  variants: {
    type: {
      success: 'text-green-800',
      error: 'text-red-800',
      info: 'text-gray-900',
      default: 'text-gray-900',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  toastId: string | number;
  title: string;
  description?: string;
  type: ToastType;
};

const TOAST_TONE_META: Record<
  ToastType,
  {
    icon: typeof CircleAlert;
    iconClassName: string;
  }
> = {
  error: {
    icon: CircleAlert,
    iconClassName: 'bg-red-500/12 text-red-600',
  },
  info: {
    icon: Info,
    iconClassName: 'bg-gray-400 text-accent',
  },
  success: {
    icon: CircleCheckBig,
    iconClassName: 'bg-emerald-500/12 text-emerald-600',
  },
};

function AlertToast(props: ToastProps) {
  const {toastId, title, type, description} = props;
  const {icon: Icon, iconClassName} = TOAST_TONE_META[type];

  return (
    <div className={toastContainerVariants({type})}>
      <div className={cn('mt-0.5 flex shrink-0 items-center justify-center rounded-3xl h-11 w-11 mr-3', iconClassName)}>
        <Icon size={20} strokeWidth={2.2} />
      </div>

      <div className="flex-1 md:mr-5">
        <p className={toastTitleVariants({type})}>{title}</p>
        {description && <p className="text-gray-500 mt-1 text-sm leading-5 md:text-nowrap">{description}</p>}
      </div>

      <button
        aria-label="토스트 닫기"
        className="text-gray-500 hover:text-black inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none transition-colors"
        onClick={() => sonnerToast.dismiss(toastId)}
        type="button"
      >
        <X size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}

type ToastOptions = Omit<ToastProps, 'toastId' | 'type'>;
const toast = {
  show: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast toastId={id} type="info" {...options} />);
  },

  success: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast toastId={id} type="success" {...options} />);
  },

  error: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast toastId={id} type="error" {...options} />);
  },

  info: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast toastId={id} type="info" {...options} />);
  },
};

export {toast};
