import React, { useState } from 'react';
import {  Image, StyleSheet, TouchableOpacity, Text, TextInput, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import config from '../config';

export default function OTP(){
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState(''); 
  const [otp, setOtp] = useState('');

  const handleSubmit = async() => {  
    Keyboard.dismiss();
    console.log(otp);
    if (otp.length !== 6) {
      return;
    }
    fetch(`${config.BASE_URL}/verify-OTP`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'otp': otp,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response from Express backend:', data);
        if(data.isValid == false) {
          setSuggestions('Invalid OTP');
        }
        else {
          navigation.navigate('RegisterDetails');  
          setSuggestions(''); 
        }
      })
      .catch(error => {
        console.error('Error posting data to Express backend:', error);
      });
  }
  const handleResendOTP = async() => {
    fetch(`${config.BASE_URL}/resend-OTP`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
          console.log('Response from Express backend:', data);
      })
      .catch(error => {
          console.error('Error posting data to Express backend:', error);
      });
  }
  return (
    <SafeAreaView style={{backgroundColor: '#E3B130', minHeight: '100%'}}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'android' ? 'height' : null}> 
        <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          style={{ alignSelf: 'center', width: 350, height: 350, }}
          source={require('../assets/img/blackText.png')}
        />      
        <Text style={{fontSize: 18, alignSelf: 'center', marginBottom: 20, marginTop: -50}}>One Time Password</Text>
        <TextInput
          style={styles.input}
          value={otp}
          onChangeText={(text) => setOtp(text)}
          placeholder="Enter OTP"
          keyboardType='number-pad'
        />
        <Text style={styles.suggestion}> {suggestions} </Text> 
        <TouchableOpacity onPress={handleResendOTP}>
          <Text style={{alignSelf: 'center', fontSize: 15, marginTop: 30}}>Resend OTP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button,{marginTop: 10}]} onPress={() => navigation.navigate('RegisterDetails')}>
          <Text style={styles.buttonText}>Submit without backend</Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>   
  );
};


const styles = StyleSheet.create({
input: {
  height: 40, 
  width: 300, 
  backgroundColor: 'white', 
  alignSelf: 'center', 
  borderColor: 'white', 
  borderRadius: 5, 
  textAlign: 'center'
},
suggestion: {
  color: 'red',
  fontSize: 12,
  marginBottom: 10,
  marginTop: 10,
  alignSelf: 'center'
},
button: {
  backgroundColor: 'maroon',
  borderRadius: 5,
  width: 300,
  height: 40,
  alignItems: 'center',
  alignSelf: 'center',
  justifyContent: 'center',
  marginTop: 70,
},
buttonText: {
  color: '#fff',
  fontWeight: 'normal',
  fontSize: 18,
  textAlign: 'center'
},

});