import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import config from '../config';

export default function RegisterEmail() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [suggestions, setSuggestions] = useState('');

  const handleSubmit = async() => {
    if (email.trim() === '') {
      setSuggestions('Email cannot be empty!');
      return;
    }
    
    console.log(email);
    fetch(`${config.BASE_URL}/send-OTP`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'email': email,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response from Express backend:', data);
        if (data.isValid === false) {
          setSuggestions('Email is already taken!');
        } else {
          navigation.navigate('OTP');
        } 
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
          <Text style={{fontSize: 18, alignSelf: 'center', marginBottom: 20, marginTop: -50}}>Register using Google Email</Text>
          <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholder="Enter Email"
          />
          <Text style={styles.suggestion}>   
              {suggestions}
          </Text> 
          <TouchableOpacity
            style={[styles.button, email.trim() === '' && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={email.trim() === ''}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            backgroundColor: 'maroon',
            borderRadius: 5,
            width: 300,
            height: 40,
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 10,
          }} onPress={() => navigation.navigate('OTP')} >
            <Text style={styles.buttonText}>Submit Without Backend</Text>
          </TouchableOpacity>    
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    marginTop: -10,
    marginBottom: 10, 
  },
  button: {
    backgroundColor: 'maroon',
    borderRadius: 5,
    width: 300,
    height: 40,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 90,
  },
  buttonDisabled: {
    backgroundColor: '#8a252c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 18,
    textAlign: 'center'
  },
});
