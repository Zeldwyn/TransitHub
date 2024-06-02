import React, { useState } from 'react';
import {View,Image,StyleSheet,TouchableOpacity,Text,TextInput,KeyboardAvoidingView,Platform,ScrollView,SafeAreaView,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidate, setPasswordValidate] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    fetch('http://192.168.1.6:8080/validate-Login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Response from Express backend:', data);
        if (data.isValid == false) {
          setPasswordValidate('Invalid Credentials');
        } else {
          AsyncStorage.setItem('email', email);
          AsyncStorage.setItem('userType', data.userType);
          AsyncStorage.setItem('premiumUserID', data.id.toString());
          setPasswordValidate('');
          if (data.userType === 'owner') navigation.navigate('OwnerDrawer');
          if (data.userType === 'operator') navigation.navigate('OperatorDrawer');
        }
      })
      .catch((error) => {
        console.error('Error posting data to Express backend:', error);
      });
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
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate('OwnerDrawer'); AsyncStorage.setItem('userType', "owner"); }}>
            <Text style={styles.buttonText}>Submit for Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate('OperatorDrawer'); AsyncStorage.setItem('userType', "operator"); }}>
            <Text style={styles.buttonText}>Submit for Operator</Text>
          </TouchableOpacity> */}
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

