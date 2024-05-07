// import { useState } from 'react';
// import {Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// export default function App() {
//   const [email, setEmail] = useState('');
//   const windowWidth = Dimensions.get('window').width;
//   const windowHeight = Dimensions.get('window').height;
//   const handleSubmit = async() => {
//     console.log(email);
//     fetch('http://192.168.1.8:8080/send-OTP', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         'email': email,
//       }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Response from Express backend:', data);
//       })
//       .catch(error => {
//         console.error('Error posting data to Express backend:', error);
//       });
//   }
//   return (
//     <View style={styles.container}>
//       <Image
//         style={{
//           ...styles.logo,
//           width: windowWidth * 0.8,
//           height: windowWidth * 0.8,
//         }}
//         source={require('./assets/img/blackText.png')}
//       />
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={(text) => setEmail(text)}
//         placeholder="Enter Email"
//       />
//       <CustomButton title='Submit' onPress={handleSubmit}/>
//     </View>
//   );
// }
// const CustomButton = ({ title, onPress }) => {
//   return (
//     <TouchableOpacity style={styles.btn} onPress={onPress}>
//       <Text style={styles.btnTxt}>{title}</Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     backgroundColor: '#E3B130',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logo: {
//     marginTop: -250,
//   },
//   input: {
//     height: 40,
//     width: 300,
//     borderRadius: 5,
//     borderColor: 'white',
//     backgroundColor: 'white',
//     margin: 12,
//     borderWidth: 1,
//     padding: 10,
//     textAlign: 'center',
//     marginBottom: 20
//   },
//   btn: {
//     backgroundColor: '#8A252C',
//     padding: 10,
//     width: 300,
//     height: 40,
//     borderRadius: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//   },
//   btnTxt: {
//     color: 'white',
//     fontSize: 16,
//   },
//   input: {
//     height: 40,
//     width: 300,
//     borderRadius: 5,
//     borderColor: 'white',
//     backgroundColor: 'white',
//     margin: 12,
//     borderWidth: 1,
//     padding: 10,
//     textAlign: 'center',
//     marginBottom: 20
//   },
// });

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './assets/splash_screen'; 
import RegisterEmail from './Authentication/registerEmail';
import StartMenu from './assets/start_menu';
import OTP from './Authentication/OTP';
import RegisterDetails from './Authentication/registerDetails';
import Login from './Authentication/login';
import PremiumHome from './Premium/premiumHome';


export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false); 
    }, 2000);     // 2 seconds 
  }, []);

  return (
    <NavigationContainer>
      {loading ? <SplashScreen /> : <MyStack />}
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator();

const MyStack = () => {       // set to true if dli mka back
  return (
    <Stack.Navigator>
      <Stack.Screen name="StartMenu" component={StartMenu} options={{ headerShown: false}} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmail} options={{ headerShown: false}} />
      <Stack.Screen name="RegisterDetails" component={RegisterDetails} options={{ headerShown: false}} />
      <Stack.Screen name="OTP" component={OTP} options={{ headerShown: false}} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false}} />
      <Stack.Screen name="PremiumHome" component={PremiumHome} options={{ headerShown: false}} />
      {/* <Stack.Screen name="GuestMap" component={GuestMap} options={{headerShown: false}}/>
      <Stack.Screen name="TransactionRecords" component={TransactionRecords} options={{headerShown: false}}/>
      <Stack.Screen name="Messages" component={Messages} options={{headerShown: false}}/>   */}
    </Stack.Navigator> 
  );
}