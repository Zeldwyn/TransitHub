import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import OwnerHome from './Home';
import AddOperator from './addOperator';
import Records from './Records';
import Settings from './Settings';
import Help from './help';
import Bookings from './Bookings';

function Logout() {
  const navigation = useNavigation();
  AsyncStorage.removeItem('email');
  AsyncStorage.removeItem('userType');
  AsyncStorage.removeItem('ID');
  
  React.useEffect( () => {
    navigation.navigate('Login')
  })
  return (
    <></>
  );
};


const Drawer = createDrawerNavigator();

export default function OwnerDrawer(){
  return (
    <Drawer.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
        drawerActiveTintColor: 'black',
        drawerLabelStyle: {fontSize: 18, marginLeft: -15},
        headerTitleStyle: {fontSize: 23, lineHeight: 60},
        drawerItemStyle: { marginVertical: 10 },
      }}
    >
      <Drawer.Screen name="Home" component={OwnerHome} 
        options={{title: 'Home',drawerIcon: ({focused, size},) => (
        <Ionicons name="home-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Bookings" component={Bookings} 
        options={{title: 'Bookings',drawerIcon: ({focused, size}) => (
        <Ionicons name="person-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Transport Operator" component={AddOperator} 
        options={{title: 'Transport Operator',drawerIcon: ({focused, size}) => (
        <Ionicons name="person-add-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Records" component={Records} 
        options={{title: 'Records',drawerIcon: ({focused, size}) => (
        <Feather name="file-text" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Help" component={Help} 
        options={{title: 'Help',drawerIcon: ({focused, size}) => (
        <Feather name="help-circle" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Profile Settings" component={Settings} 
        options={{title: 'Profile Settings',drawerIcon: ({focused, size}) => (
        <Ionicons name="person-circle-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} /> 
      <Drawer.Screen name="Logout" component={Logout} 
        options={{title: 'Logout',drawerIcon: ({focused, size}) => (
        <MaterialIcons name="logout" size={size} color={focused ? '#8A252C' : 'black'} />
      ),}} />    
    </Drawer.Navigator>
  );
};
