import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';

export default function OwnerSettings(){
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phonenumber, setPhoneNumber] = useState('');

    const handlePassword = (text) => {
        setPassword(text)
        setSuggestions(temporaryBullshit(text));
      };
      const toggleShowPassword = () => {
        setShowPassword(!showPassword);
      };

    return (
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

        <Text style={styles.text2}>Password</Text>
        <View style={styles.passwordContainer}>
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
          <Text style={styles.text2}>Phone Number</Text>
        <TextInput
            style={styles.input}
            value={phonenumber}
            onChangeText={(text) => setPhoneNumber(text)}
            placeholder="Enter Phone Number"
        />
        <CustomButton title="Submit" />
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
      marginBottom: 20
    },
    suggestionsText: { 
      color: 'red', 
      fontSize: 12,
    }, 
  });
  