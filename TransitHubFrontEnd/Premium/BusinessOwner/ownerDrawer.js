import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import OwnerHome from './ownerHome';
import AddOperator from './addOperator';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import OwnerMessage from './ownerMessage';
import OwnerTransaction from './ownerTransaction';
import OwnerSettings from './ownerSettings';
import Help from '../help';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator(){
  return (
    <Drawer.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
        // drawerActiveBackgroundColor: '#E3B130',
        drawerActiveTintColor: '#8A252C',
        drawerLabelStyle: {fontSize: 18, marginLeft: -15},
        // drawerContentStyle: {fontSize: 20},
        headerTitleStyle: {fontSize: 23, lineHeight: 60},
        drawerItemStyle: { marginVertical: 10 },
      }}
    >
      <Drawer.Screen name="Home" component={OwnerHome} 
        options={{title: 'Home',drawerIcon: ({focused, size},) => (
        <Ionicons name="home-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Transport Operator" component={AddOperator} 
        options={{title: 'Transport Operator',drawerIcon: ({focused, size}) => (
        <Ionicons name="person-add-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Message" component={OwnerMessage} 
        options={{title: 'Message',drawerIcon: ({focused, size}) => (
        <Ionicons name="chatbox-ellipses-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Records" component={OwnerTransaction} 
        options={{title: 'Records',drawerIcon: ({focused, size}) => (
        <Feather name="file-text" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Help" component={Help} 
        options={{title: 'Help',drawerIcon: ({focused, size}) => (
        <Feather name="help-circle" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
      <Drawer.Screen name="Settings" component={OwnerSettings} 
        options={{title: 'Settings',drawerIcon: ({focused, size}) => (
        <Ionicons name="settings-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />
    </Drawer.Navigator>
  );
};
