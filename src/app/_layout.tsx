import { Drawer } from 'expo-router/drawer'
import { SessionProvider } from '../contexts/AuthContext'
import { Slot } from 'expo-router';

export default function Layout() {

  return (
    <SessionProvider>
      <Slot/>
    </SessionProvider>
  );
};