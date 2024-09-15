import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckPasswordValidity } from '../Authentication/functions';
import config from '../config';

export default function Settings(){
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [validate, setValidate] = useState(''); 
  const [pID, setPID] = useState('');
  const [storedEmail, setStoredEmail] = useState('');

  useEffect(() => {
    const getUserID = async () => {
      const id = await AsyncStorage.getItem('premiumUserID');
      const mail = await AsyncStorage.getItem('email');
      setPID(id);
      setStoredEmail(mail);
    };
    getUserID();
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    if(pID) {
      fetch(`${config.BASE_URL}/user-Details`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'premiumUserID': parseInt(pID),
      }),
    })
    .then(response => response.json())
        .then(data => {
          console.log('Response from Express backend:', data);
          if(data.success == false) {
            console.log('ERROR MAM SER');
          }
          else {      
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setPassword(data.password);
            setEmail(storedEmail);
          }
        })
        .catch(error => {
          console.error('Error posting data to Express backend:', error);
        });
  }}, [pID, storedEmail]);
  const handlePassword = () => {
    if(CheckPasswordValidity(password) == true )
      handleChange();
  };
  const handleChange = async() => {
      fetch(`${config.BASE_URL}/update-UserDetails`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'email': storedEmail,
        'firstName': firstName,
        'lastName': lastName,
        'password': password,
      }),
    })
    .then(response => response.json())
        .then(data => {
          console.log('Response from Express backend:', data);
          if(data.success == false) {
            console.log('ERROR MAM SER');
          }
          else {      
            console.log('UPDATED SUCCESSFULYL');
            setValidate('Password Updated');
          }
        })
        .catch(error => {
          console.error('Error posting data to Express backend:', error);
        });  
  };
  return (
    <View style={styles.container}>
    <ScrollView>
      <Text style={styles.text2}>First Name</Text>
      <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          placeholder="Enter First Name"
      />

      <Text style={styles.text2}>Last Name</Text>
      <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          placeholder="Enter Last Name"
      />
      <Text style={styles.text2}>Email</Text>
        <TextInput
            style={styles.input}
            value={email}
            editable={false}
            placeholder="Enter Email"
        />
      <Text style={styles.text2}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
            style={[styles.input, {flex: 1}]}
            value={password}
            onChangeText={(text) => {setPassword(text), setValidate(CheckPasswordValidity(text))}}
            placeholder="Enter Password"
            secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
          {showPassword ? <Feather name="eye-off" size={24} color="black" /> : <Feather name="eye" size={24} color="black" />}
        </TouchableOpacity>
      </View>
      <Text style={styles.suggestionsText}>   
          {validate}
      </Text> 
        
      <CustomButton title="Save Changes" onPress={handlePassword} />
      </ScrollView>
      </View>
  );
};   

const CustomButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
container: {
  flex: 1, 
  backgroundColor: '#FFC93F',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 50,
},
text2: {
  fontSize: 15, 
  alignItems: 'center',
  fontWeight: 'bold',
  marginBottom: 8, 
},
button: {
  backgroundColor: '#8A252C',
  padding: 10,
  width: 300,
  height: "auto",
  borderRadius: 5,
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 15,
},
buttonText: {
  color: 'white',
  fontSize: 16,
},
passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', 
  width: 325,  
  marginBottom: 20, // Add margin to separate password input
},
eyeIcon: {
  position: 'absolute',
  top: 20, 
  right: 25, 
},
input: {
  height: 40,
  width: 300,
  borderRadius: 5,
  borderColor: "maroon",
  borderWidth: 2,
  backgroundColor: 'white',
  margin: 12,
  borderWidth: 1,
  padding: 10,
  textAlign: 'center',
  color: 'black',
  marginBottom:30,
},
suggestionsText: { 
  color: 'red',
  fontSize: 12,
  marginBottom: 30,
  marginTop: -20,
  alignSelf: 'center'
}, 
  
});
  