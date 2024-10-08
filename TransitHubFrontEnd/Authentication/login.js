import React, { useState } from 'react';
import {View,Image,StyleSheet,TouchableOpacity,Text,TextInput,KeyboardAvoidingView,Platform,ScrollView,SafeAreaView,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidate, setPasswordValidate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}/validate-Login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
  
      const data = await response.json();
      console.log('Response from Express backend:', data);  // Debugging: Check the entire response
  
      if (!data.isValid) {
        setPasswordValidate('Invalid Credentials');
      } else {
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('userType', data.userType);
        await AsyncStorage.setItem('premiumUserID', data.id.toString());
  
        if (data.operatorID) {
          await AsyncStorage.setItem('operatorID', data.operatorID.toString());
        } else {
          await AsyncStorage.removeItem('operatorID'); 
        }
        if (data.userType === 'owner') {
          if (data.ownerID) {
            await AsyncStorage.setItem('ownerID', data.ownerID.toString());
          } else {
            console.warn('OwnerID is undefined in the backend response');  
          }
          navigation.navigate('OwnerDrawer');
        } else if (data.userType === 'operator') {
          navigation.navigate('OperatorDrawer');
        }
  
        setEmail('');
        setPassword('');
        setPasswordValidate('');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };  

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={{backgroundColor: '#E3B130', minHeight: '100%'}}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'android' ? 'height' : null}>
        <ScrollView showsVerticalScrollIndicator={false}> 
        <Image
          style={{ alignSelf: 'center', width: 350, height: 350, }}
          source={require('../assets/img/blackText.png')}
        />
        <Text style={{fontSize: 18, alignSelf: 'center', marginBottom: 20, marginTop: -50}}>Login using Email</Text>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Enter Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>Password</Text>
        <View>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
            value={password}
            placeholder="Enter Password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            {showPassword ? <Feather name="eye-off" size={24} color="black" /> : <Feather name="eye" size={24} color="black" />}
          </TouchableOpacity>
        </View>
        <Text style={styles.suggestion}>{passwordValidate}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterEmail')} style={styles.registerButton}>
            <Text style={styles.registerText}>Don't have an account? Click here to Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>  
    </SafeAreaView>

  );
}
const styles = StyleSheet.create({
inputLabel: {
  fontSize: 18,
  margin: 8,
  alignSelf: 'center'
},
input: {
  height: 40, 
  width: 300, 
  backgroundColor: 'white', 
  alignSelf: 'center', 
  borderColor: 'white', 
  borderRadius: 5, 
  textAlign: 'center'
},
eyeIcon: {
  position: 'absolute',
  top: 10,
  right: 80,
},
button: {
  backgroundColor: 'maroon',
  borderRadius: 5,
  width: 300,
  height: 40,
  alignItems: 'center',
  alignSelf: 'center',
  justifyContent: 'center',
  marginTop: 20,
},
buttonText: {
  color: '#fff',
  fontWeight: 'normal',
  fontSize: 18,
  textAlign: 'center'
},
buttonText: {
  color: 'white',
  fontSize: 16,
},
suggestion: {
  color: 'red',
  fontSize: 12,
  marginBottom: 10,
  marginTop: 10,
  alignSelf: 'center'
},
registerText: {
  color: 'black',
  fontSize: 12,
},
registerButton: {
  alignSelf: 'center',
  marginTop: 60
},
});

