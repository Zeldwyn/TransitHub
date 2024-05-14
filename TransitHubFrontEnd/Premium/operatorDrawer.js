import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import OwnerHome from './Home';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Message from './Message';
import Settings from './Settings';
import Help from './help';
import Records from './Records';

function Hatdog() {
  const navigation = useNavigation();
  AsyncStorage.removeItem('email');
  AsyncStorage.removeItem('userType');
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        onPress={() => navigation.navigate('Login')}
        title="LOGOUTTTTTTTTTTTTTTTTT"
      />
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function OperatorDrawer(){
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
      <Drawer.Screen name="Message" component={Message} 
        options={{title: 'Message',drawerIcon: ({focused, size}) => (
        <Ionicons name="chatbox-ellipses-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
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
      <Drawer.Screen name="TEMPORARY LOGOUT" component={Hatdog} 
        options={{title: 'TEMPORARY LOGOUT',drawerIcon: ({focused, size}) => (
        <Feather name="command" size={size} color={focused ? '#8A252C' : 'black'}/>
      ),}} />   
    </Drawer.Navigator>
  );
};