import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Button, View } from 'react-native';
import 'react-native-gesture-handler';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import GuestRecords from './guestRecords';
import GuestMap from './guestMap';
import GuestHelp from './guestHelp';
import AsyncStorage from '@react-native-async-storage/async-storage';


function Hatdog() {
    const navigation = useNavigation();
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          onPress={() => navigation.navigate('StartMenu')}
          title="REGISTER OR LOGIN"
        />
      </View>
    );
  }

const Drawer = createDrawerNavigator();

export default function GuestDrawer(){
    React.useEffect(() => { 
        const fetchGuestUser = async () => {
            try {
                const deviceID = await AsyncStorage.getItem('deviceID'); 
                console.log('Device ID:', deviceID); 
    
                const response = await fetch('http://192.168.1.8:8080/add-GuestUser', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'deviceID': deviceID, 
                    }),
                });
                const data = await response.json(); 
                console.log('Response from Express backend:', data); 
            } catch (error) {
                console.error('Error posting data to Express backend:', error); 
            }
        };
        fetchGuestUser(); 
    }, []);
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
                <Drawer.Screen name="Home" component={GuestMap} 
                    options={{title: 'Home',drawerIcon: ({focused, size},) => (
                    <Ionicons name="home-outline" size={size} color={focused ? '#8A252C' : 'black'}/>
                ),}} />
                <Drawer.Screen name="Records" component={GuestRecords} 
                    options={{title: 'Records',drawerIcon: ({focused, size}) => (
                    <Feather name="file-text" size={size} color={focused ? '#8A252C' : 'black'}/>
                ),}} />
                <Drawer.Screen name="Help" component={GuestHelp} 
                    options={{title: 'Help',drawerIcon: ({focused, size}) => (
                    <Feather name="help-circle" size={size} color={focused ? '#8A252C' : 'black'}/>
                ),}} />     
                <Drawer.Screen name="Register or LOGIN" component={Hatdog} 
                    options={{title: 'Register or LOGIN',drawerIcon: ({focused, size}) => (
                    <Feather name="command" size={size} color={focused ? '#8A252C' : 'black'}/>
                ),}} />    
            </Drawer.Navigator>              
    );
};
