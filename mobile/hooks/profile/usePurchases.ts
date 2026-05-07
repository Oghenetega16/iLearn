// mobile/hooks/profile/usePurchases.ts
import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { supabase } from '../../lib/supabase';
import Constants from 'expo-constants';

// NOTE: You will get these from your RevenueCat Dashboard later
const API_KEYS = {
  apple: 'test_OKzUsVQEKFQrmeRlweHXSeEJgqH',
  google: 'test_OKzUsVQEKFQrmeRlweHXSeEJgqH',
};

export function usePurchases() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<any[]>([]); // Relaxed type for mock data
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Detect if we are running inside the Expo Go sandbox
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (isExpoGo) {
      loadMockDataForExpoGo();
    } else {
      initRevenueCat();
    }
  }, []);

  const loadMockDataForExpoGo = () => {
    console.log("Running in Expo Go: Bypassing native RevenueCat initialization.");
    setTimeout(() => {
      setPackages([
        { 
          identifier: 'pro_monthly', 
          product: { title: 'iLearn Pro Monthly', priceString: '$9.99', description: 'Unlock all premium courses and earn unlimited certificates.' } 
        },
        { 
          identifier: 'pro_yearly', 
          product: { title: 'iLearn Pro Annual', priceString: '$89.99', description: 'Save 25% with an annual subscription to all premium content.' } 
        }
      ]);
      setLoading(false);
    }, 800); // Slight delay to simulate network load
  };

  const initRevenueCat = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: API_KEYS.apple });
      } else if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: API_KEYS.google });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Purchases.logIn(user.id);
      }

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setIsPremium(typeof info.entitlements.active['pro'] !== 'undefined');

      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (e: any) {
      console.error('Error initializing RevenueCat', e);
    } finally {
      setLoading(false);
    }
  };

  const purchasePackage = async (pack: any) => {
    if (isExpoGo) {
      // Mock purchase behavior
      setLoading(true);
      setTimeout(() => {
        setIsPremium(true);
        setLoading(false);
        Alert.alert('Mock Success!', `You successfully "purchased" ${pack.product.title} in Dev Mode.`);
      }, 1000);
      return;
    }

    // Real native purchase behavior
    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pack);
      if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
        setIsPremium(true);
        Alert.alert('Success!', 'Welcome to iLearn Pro.');
      }
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Purchase Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (isExpoGo) {
      Alert.alert('Dev Mode', 'Cannot restore purchases in Expo Go.');
      return;
    }

    try {
      setLoading(true);
      const info = await Purchases.restorePurchases();
      if (typeof info.entitlements.active['pro'] !== 'undefined') {
        setIsPremium(true);
        Alert.alert('Restored', 'Your purchases have been restored.');
      } else {
        Alert.alert('No Purchases', 'We could not find any active subscriptions to restore.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { customerInfo, packages, isPremium, loading },
    handlers: { purchasePackage, restorePurchases }
  };
}