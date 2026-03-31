// mobile/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import AnimatedTabBar from '../../components/AnimatedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      // Injecting our custom Reanimated Magic Tab Bar
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false, // We keep this false so we can build custom headers per screen
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home' 
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search' 
        }} 
      />
      <Tabs.Screen 
        name="courses" 
        options={{ 
          title: 'My Courses' 
        }} 
      />
      <Tabs.Screen 
        name="tutor" 
        options={{ 
          title: 'AI Tutor' 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile' 
        }} 
      />
    </Tabs>
  );
}