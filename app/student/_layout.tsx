import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

function TabIcon({
  name,
  focused,
  badgeCount,
}: {
  name: any;
  focused: boolean;
  badgeCount?: number;
}) {
  return (
    <View style={styles.tabIconWrap}>
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={24}
        color={focused ? Colors.primary : Colors.tabInactive}
      />

      {!!badgeCount && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function StudentLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { unreadCount } = useNotifications();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
          tabBarButtonTestID: 'tab_home',
          tabBarAccessibilityLabel: 'tab_home',
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="calendar" focused={focused} />
          ),
          tabBarButtonTestID: 'tab_events',
          tabBarAccessibilityLabel: 'tab_events',
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid" focused={focused} />
          ),
          tabBarButtonTestID: 'tab_dashboard',
          tabBarAccessibilityLabel: 'tab_dashboard',
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="notifications"
              focused={focused}
              badgeCount={unreadCount}
            />
          ),
          tabBarButtonTestID: 'tab_alerts',
          tabBarAccessibilityLabel: 'tab_alerts',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-circle" focused={focused} />
          ),
          tabBarButtonTestID: 'tab_profile',
          tabBarAccessibilityLabel: 'tab_profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIconWrap: {
    position: 'relative',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});