import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="accueil" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="annonces" options={{ title: 'Annonces' }} />
      <Tabs.Screen name="compte" options={{ title: 'Compte' }} />
    </Tabs>
  );
}
