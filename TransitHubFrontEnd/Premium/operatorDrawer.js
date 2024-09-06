import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import OperatorHome from './OperatorHome'; // Import OperatorHome
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Settings from './Settings';
import Help from './help';
import Records from './Records';
import MessageOperator from './MessageOperator';

function Logout() {
  const navigation = useNavigation();
  AsyncStorage.removeItem('email');
  AsyncStorage.removeItem('userType');
  AsyncStorage.removeItem('ID');
  
  React.useEffect(() => {
    navigation.navigate('Login');
  }, [navigation]);
  
  return null;
}

const Drawer = createDrawerNavigator();

export default function OperatorDrawer() {
  return (
    <Drawer.Navigator 
      initialRouteName="OperatorHome"
      screenOptions={{
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#8A252C',
        drawerLabelStyle: {fontSize: 18, marginLeft: -15},
        headerTitleStyle: {fontSize: 23, lineHeight: 60},
        drawerItemStyle: { marginVertical: 10 },
      }}
    >
      <Drawer.Screen 
        name="OperatorHome" 
        component={OperatorHome} 
        options={{ 
          title: 'Home',
          drawerIcon: ({ focused, size }) => (
            <Ionicons name="home-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
          ),
        }} 
      />
      <Drawer.Screen 
        name="Message" 
        component={MessageOperator} 
        options={{ 
          title: 'Message',
          drawerIcon: ({ focused, size }) => (
            <Ionicons name="chatbox-ellipses-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
          ),
        }} 
      />
      <Drawer.Screen 
        name="Records" 
        component={Records} 
        options={{ 
          title: 'Records',
          drawerIcon: ({ focused, size }) => (
            <Feather name="file-text" size={size} color={focused ? '#8A252C' : 'black'}/>
          ),
        }} 
      />
      <Drawer.Screen 
        name="Help" 
        component={Help} 
        options={{ 
          title: 'Help',
          drawerIcon: ({ focused, size }) => (
            <Feather name="help-circle" size={size} color={focused ? '#8A252C' : 'black'}/>
          ),
        }} 
      />
      <Drawer.Screen 
        name="Profile Settings" 
        component={Settings} 
        options={{ 
          title: 'Profile Settings',
          drawerIcon: ({ focused, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
          ),
        }} 
      /> 
      <Drawer.Screen 
        name="Logout" 
        component={Logout} 
        options={{ 
          title: 'Logout',
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="logout" size={size} color={focused ? '#8A252C' : 'black'} />
          ),
        }} 
      /> 
    </Drawer.Navigator>
  );
}
