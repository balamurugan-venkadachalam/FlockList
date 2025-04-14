export interface google {
  accounts: {
    id: {
      initialize: (config: any) => void;
      renderButton: (
        element: HTMLElement,
        options: {
          theme?: string;
          size?: string;
          callback: (response: { credential: string }) => void;
        }
      ) => void;
    };
  };
} 