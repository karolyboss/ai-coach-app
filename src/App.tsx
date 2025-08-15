import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { EntitlementsProvider } from './src/modules/entitlements/EntitlementsProvider';

export default function App(){
  return (
    <EntitlementsProvider>
      <RootNavigator />
    </EntitlementsProvider>
  );
}