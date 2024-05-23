import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckPasswordValidity } from './functions';
import { Feather } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';

export default function RegisterDetails(){
    const navigation = useNavigation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [suggestions, setSuggestions] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);
    const [checked, setChecked] = React.useState('');

    const handleSubmit = async() => {
        console.log(firstName, lastName, password);
        fetch('http://192.168.1.6:8080/add-PremiumUser', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'firstName': firstName,
            'lastName': lastName,
            'password': password,
            'userType': checked,
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Response from Express backend:', data);
            console.log('yawa');
            navigation.navigate('Login');
          })
          .catch(error => {
            console.error('Error posting data to Express backend:', error);
          });
    };
    const handlePassword = (text) => {
      setPassword(text)
      setSuggestions(CheckPasswordValidity(text));
    };
    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
    return (
      <SafeAreaView style={{backgroundColor: '#E3B130', minHeight: '100%'}}>
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'android' ? 'height' : null}>
          <ScrollView showsVerticalScrollIndicator={false}> 
          <Image
            style={{ alignSelf: 'center', width: 350, height: 350, marginTop: -40}}
            source={require('../assets/img/blackText.png')}
          />

          <Text style={{fontSize: 20, alignSelf: 'center', marginBottom: 20, marginTop: -100}}>Input user details</Text>

          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={(text) => setFirstName(text)}
              placeholder="Enter First Name"          
          />

          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={(text) => setLastName(text)}
              placeholder="Enter Last Name"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <View>
            <TextInput
                style={[styles.input, {flex: 1}]}
                value={password}
                onChangeText={handlePassword}
                placeholder="Enter Password"
                secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
              {showPassword ? <Feather name="eye-off" size={24} color="black" /> : <Feather name="eye" size={24} color="black" />}
            </TouchableOpacity>
          </View>

          <Text style={styles.suggestion}>   
              {suggestions}
          </Text> 

          <Text style={[styles.inputLabel, {marginTop: -15}]}>User Type</Text>
          <View style={styles.radioButtonContainer}>
            <RadioButton
              value="operator"
              status={checked === 'operator' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('operator')}
            />
            <Text style={{fontSize: 16.5}}>Transport Operator</Text>
          </View>
          <View style={styles.radioButtonContainer}>
            <RadioButton
              value="owner"
              status={checked === 'owner' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('owner')}
            />
            <Text style={{fontSize: 16.5}}>Business Owner</Text>
          </View>
          {/*Change to handle submit if for working backend*/}
          
          <TouchableOpacity style={styles.button} onPress={handleSubmit}> 
          {/*<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}> */}
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
  
          </ScrollView>
        </KeyboardAvoidingView>  
      </SafeAreaView>
    );
};

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
  textAlign: 'center',
  marginBottom: 20,
  color: 'black'
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
  marginTop: -10,
  marginBottom: 10,
},
radioButtonContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
},
});