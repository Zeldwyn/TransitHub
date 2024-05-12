import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckPasswordValidity } from '../../Authentication/functions';

export default function OwnerSettings(){
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [validate, setValidate] = useState(''); 
    const valid = false;
    // const storedEmail = AsyncStorage.getItem('email');
    const storedEmail = "hatdog123@gmail.com";
    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
    useEffect(() => {
      fetch(`http://192.168.1.8:8080/user-Details`, {
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
        fetch(`http://192.168.1.8:8080/update-UserDetails`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'email': storedEmail,
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
            editable={false}
            placeholder="Enter First Name"
        />

        <Text style={styles.text2}>Last Name</Text>
        <TextInput
            style={styles.input}
            value={lastName}
            editable={false}
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
      alignItems: 'flex-start',
      marginTop: 40,
      marginLeft: 15,
      
    },
    text2: {
      fontSize: 15, 
      marginLeft: 25,
      fontWeight: 'bold',
      margin: 8,
    },
    button: {
      backgroundColor: '#8A252C',
      padding: 10,
      width: 300,
      height: 40,
      marginLeft: 22,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', 
      width: 335,  
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
      marginLeft:22,
      borderWidth: 1,
      padding: 10,
      textAlign: 'left',
      marginBottom: 20,
      color: 'black',
    },
    suggestionsText: { 
      color: 'red', 
      fontSize: 12,
      marginTop: -10,
      marginBottom: 10
    }, 
  });
  