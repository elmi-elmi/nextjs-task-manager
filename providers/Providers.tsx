'use client';

import { ReactNode } from 'react';
import { persistor, store } from '@/store/store';
import { Provider as ReduxProvider } from 'react-redux';
import ThemeRegistry from '@/components/ThemeRegistry';
import { PersistGate } from 'redux-persist/integration/react';

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </PersistGate>
    </ReduxProvider>
  );
};

export default Providers;
