import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckPasswordValidity } from './functions';
import { Feather } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';

export default function RegisterDetails(){
    const navigation = useNavigation();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [suggestions, setSuggestions] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);
    const [checked, setChecked] = React.useState('');

    const handleSubmit = async() => {
        console.log(firstName, lastName, password);
        fetch('http://192.168.1.8:8080/add-PremiumUser', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'firstName': firstName,
            'lastName': lastName,
            'password': password,
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
      <View style={styles.container}>
        <Image
          style={{
            ...styles.logo,
            width: windowWidth * 0.8,
            height: windowWidth * 0.8,
          }}
          source={require('../assets/img/blackText.png')}
        />

        <Text style={styles.text}>Input user details</Text>

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
        <Text style={styles.suggestionsText}>   
            {suggestions}
        </Text> 
        <Text style={styles.text2}>User Type</Text>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            value="Transport Operator"
            status={checked === 'Transport Operator' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('Transport Operator')}
          />
          <Text>Transport Operator</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            value="Business Owner"
            status={checked === 'Business Owner' ? 'checked' : 'unchecked'}
            onPress={() => setChecked('Business Owner')}
          />
          <Text>Business Owner</Text>
        </View>

        {/* <CustomButton title="Submit" onPress={handleSubmit} /> */}
        <CustomButton title="Submit" onPress={() => {navigation.navigate('Login'); console.log(checked)}} />
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
    backgroundColor: '#E3B130',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20, 
    margin: 20,
    marginTop: -80,
  },
  text2: {
    fontSize: 20, 
    margin: 10,
  },
  button: {
    backgroundColor: '#8A252C',
    padding: 10,
    width: 300,
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  logo: {
    marginTop: -200,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    width: 320,  
  },
  eyeIcon: {
    position: 'absolute',
    top: 20, // Adjust the top position as needed
    right: 25, // Adjust the right position as needed
  },
  input: {
    height: 40,
    width: 300,
    borderRadius: 5,
    borderColor: 'white',
    backgroundColor: 'white',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    textAlign: 'center',
    marginBottom: 20
  },
  suggestionsText: { 
    color: 'red', 
    fontSize: 12,
  }, 
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});