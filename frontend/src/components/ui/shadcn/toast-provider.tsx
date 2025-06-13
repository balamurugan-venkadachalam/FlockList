import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
  type ToastProps,
  type ToastActionElement,
} from "./toast";

/**
 * Context for managing toast notifications
 */
type ToastOptions = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
};

type ToastContextType = {
  toast: (options: ToastOptions) => void;
  dismiss: (toastId?: string) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

/**
 * Hook for using toast notifications
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for toast notifications
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<
    Array<ToastProps & { id: string; title?: string; description?: string; action?: ToastActionElement }>
  >([]);

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((toasts) => {
      if (toastId) {
        return toasts.filter((toast) => toast.id !== toastId);
      }
      return [];
    });
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant, action, duration = 5000 }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((toasts) => [
        ...toasts,
        { id, title, description, variant, action, duration },
      ]);
      
      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <RadixToastProvider swipeDirection="right">
        {toasts.map(({ id, title, description, action, variant, duration, ...props }) => (
          <Toast
            key={id}
            variant={variant}
            duration={duration}
            onOpenChange={(open) => {
              if (!open) dismiss(id);
            }}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}
