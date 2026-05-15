import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useUnread } from '../contexts/UnreadContext';

const TabBarIcon = ({
  isFocused,
  routeName,
  onPress,
  showDot,
}: {
  isFocused: boolean;
  routeName: string;
  onPress: () => void;
  showDot: boolean;
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    translateY.value = withSpring(isFocused ? -20 : 0, { damping: 12, stiffness: 150 });
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedCircleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

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
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.activeCircle, animatedCircleStyle]} />
        <View style={{ zIndex: 10, elevation: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons
            name={getIconName() as any}
            size={24}
            color={isFocused ? '#FFFFFF' : '#8E8E93'}
          />
        </View>

        {/* Notification dot — only on tutor tab when not focused and has unread */}
        {showDot && !isFocused && (
          <View style={styles.notificationDot} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { unreadCount } = useUnread();

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

          // Only show dot on the tutor (messages) tab
          const showDot = route.name === 'tutor' && unreadCount > 0;

          return (
            <TabBarIcon
              key={route.key}
              isFocused={isFocused}
              routeName={route.name}
              onPress={onPress}
              showDot={showDot}
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
    backgroundColor: '#285A48',
    borderRadius: 25,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 20,
    elevation: 20,
  },
});