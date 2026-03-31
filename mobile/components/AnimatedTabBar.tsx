import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

// A sub-component for the individual tab icons so they animate independently
const TabBarIcon = ({ isFocused, routeName, onPress }: { isFocused: boolean, routeName: string, onPress: () => void }) => {
  // Animation values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    // The "pop up" spring animation
    translateY.value = withSpring(isFocused ? -20 : 0, { damping: 12, stiffness: 150 });
    // Fade in the green background circle
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedCircleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Map route names to Ionicons
  const getIconName = () => {
    switch (routeName) {
      case 'index': return isFocused ? 'home' : 'home-outline';
      case 'search': return isFocused ? 'search' : 'search-outline';
      case 'courses': return isFocused ? 'book' : 'book-outline';
      case 'tutor': return isFocused ? 'chatbubbles' : 'chatbubbles-outline';
      case 'profile': return isFocused ? 'person' : 'person-outline';
      default: return 'ellipse';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} className="items-center justify-center flex-1">
      <Animated.View style={[animatedIconStyle, styles.iconContainer]}>
        {/* The Green Active Circle */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.activeCircle, animatedCircleStyle]} />
        
        {/* The Icon wrapped in a strictly elevated View to prevent it from disappearing */}
        <View style={{ zIndex: 10, elevation: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons 
            name={getIconName() as any} 
            size={24} 
            color={isFocused ? '#FFFFFF' : '#8E8E93'} // White when active, grey when inactive
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// The main Tab Bar container
export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="pt-2 pb-6 bg-brand-background">
      <View className="flex-row items-center justify-around h-16 px-2 mx-4 bg-white shadow-sm rounded-3xl" style={styles.shadow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarIcon 
              key={route.key} 
              isFocused={isFocused} 
              routeName={route.name} 
              onPress={onPress} 
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#091413',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    backgroundColor: '#285A48', // Your Forest Green brand color
    borderRadius: 25,
  }
});