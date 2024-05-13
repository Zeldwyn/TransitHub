import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './assets/splash_screen'; 
import RegisterEmail from './Authentication/registerEmail';
import StartMenu from './assets/start_menu';
import OTP from './Authentication/OTP';
import RegisterDetails from './Authentication/registerDetails';
import Login from './Authentication/login';
import 'react-native-gesture-handler';
import OwnerDrawer from './Premium/BusinessOwner/ownerDrawer';
import GuestDrawer from './Guest/guestDrawer';
// import PremiumMap from './Premium/premiumMap';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false); 
    }, 2000);   
  }, []);

  return (
    <NavigationContainer>
      {loading ? <SplashScreen /> : <MyStack />}
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator();

const MyStack = () => {       
  return (
    <Stack.Navigator>
      <Stack.Screen name="StartMenu" component={StartMenu} options={{ headerShown: false}} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmail} options={{ headerShown: false}} />
      <Stack.Screen name="RegisterDetails" component={RegisterDetails} options={{ headerShown: false}} />
      <Stack.Screen name="OTP" component={OTP} options={{ headerShown: false}} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false}} />
      <Stack.Screen name="OwnerDrawer" component={OwnerDrawer} options={{ headerShown: false}} />
      <Stack.Screen name="GuestDrawer" component={GuestDrawer} options={{ headerShown: false}} />
      {/* <Stack.Screen name="PremiumMap" component={PremiumMap} options={{ headerShown: false}} /> */}
    </Stack.Navigator> 
  );
}