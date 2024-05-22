import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckPasswordValidity } from '../Authentication/functions';

export default function Settings(){
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [validate, setValidate] = useState(''); 
    // e uncomment ang asyncstorage if legit na transaction then e comment ang gi initialize nga storedEmail for testing
    const storedEmail = AsyncStorage.getItem('email');
    //const storedEmail = "nimeoperator143@gmail.com";
    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
    useEffect(() => {
      fetch(`http://192.168.1.3:8080/user-Details`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'email': storedEmail,
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
    }, []);
    const handlePassword = () => {
      if(CheckPasswordValidity(password) == true )
        handleChange();
    };
    const handleChange = async() => {
        fetch(`http://192.168.1.5:8080/update-UserDetails`, {
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
      <ScrollView>
        <View style={styles.container}>

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
        </View>
      </ScrollView>
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
      backgroundColor: '#0000',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
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
      height: 40,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -20,
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
      borderColor: 'black',
      backgroundColor: 'white',
      margin: 12,
      borderWidth: 1,
      padding: 10,
      textAlign: 'left',
      color: 'black',
      marginBottom:30,
    },
    suggestionsText: { 
      color: 'red', 
      fontSize: 12,
      marginLeft: 25, // Adjust margin to align with text input
      marginBottom: 10,
    }, 
  });
  