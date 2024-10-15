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
import GuestDrawer from './Guest/guestDrawer';
import OwnerDrawer from './Premium/ownerDrawer';
import OperatorDrawer from './Premium/operatorDrawer';
import MapPackage from './Premium/MapPackage';
import MapCustom from './Premium/MapCustom';
import GuestMap from './Guest/guestMap';
import Location from './Premium/Transaction/location';
import OperatorHome from './Premium/OperatorHome';
import OperatorLive from './Premium/operatorLive';
import MessageOwner from './Premium/MessageOwner';
import TrackOperator from './Premium/TrackOperator';

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
      <Stack.Screen name="OperatorDrawer" component={OperatorDrawer} options={{ headerShown: false}} />
      <Stack.Screen name="GuestDrawer" component={GuestDrawer} options={{ headerShown: false}} />
      <Stack.Screen name="MapPackage" component={MapPackage} options={{ headerShown: false}} />
      <Stack.Screen name="MapCustom" component={MapCustom} options={{headerShown: false}} />
      <Stack.Screen name="GuestMap" component={GuestMap} options={{headerShown: false}}/>
      <Stack.Screen name="Location" component={Location} options={{headerShown: false}}/>
      <Stack.Screen name="OperatorHome" component={OperatorHome} options={{headerShown: false}}/>
      <Stack.Screen name="OperatorLive" component={OperatorLive} options={{headerShown: false}}/>
      <Stack.Screen name="MessageOwner" component={MessageOwner} options={{headerShown: false}}/>
      <Stack.Screen name="TrackOperator" component={TrackOperator} options={{headerShown: false}}/>
    </Stack.Navigator> 
  );
}