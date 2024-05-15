import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login(){
    const navigation = useNavigation();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validate, setValidate] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async() => {
      console.log('Email nimo: ', email)
      console.log('Password nemo isda: ', password)
      fetch('http://192.168.1.4:8080/validate-Login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'email': email,
          'password': password,
        }),
      })
      .then(response => response.json())
          .then(data => {
            console.log('Response from Express backend:', data);
            if(data.isValid == false) {
              setValidate('Invalid Credentials');
            }
            else {      
              AsyncStorage.setItem('email', email);
              AsyncStorage.setItem('userType', data.userType);
              setValidate(''); 
              if(data.userType === 'Business Owner')
                navigation.navigate('OwnerDrawer');  
              if(data.userType === 'Transport Operator')
                navigation.navigate('OperatorDrawer');
            }
          })
          .catch(error => {
            console.error('Error posting data to Express backend:', error);
          });
    }
    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inner}>
          <Image
            style={{
              ...styles.logo,
              width: windowWidth * 0.8,
              height: windowWidth * 0.8,
            }}
            source={require('../assets/img/blackText.png')}
          />

          <Text style={styles.text}>Login using Email</Text>
          
          <Text style={styles.text2}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Enter Email"
          />

          <Text style={styles.text2}>Password</Text>
          <View style={styles.passwordContainer}>
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
          <Text style={styles.suggestionsText}>   
            {validate}
          </Text> 
          <CustomButton title="Submit" onPress={handleSubmit} />
          <CustomButton title="SubmitHatdog" onPress={() => navigation.navigate('DrawerNavigator')} /> 
          <TouchableOpacity onPress={() => navigation.navigate('RegisterEmail')} style={styles.registerButton}> 
            <Text style={styles.registerText}>   
              Don't have an account? Click here to Register
            </Text> 
          </TouchableOpacity>
          
        </View>
      </KeyboardAvoidingView>
    );
};
//BUHATONON: DAPAT DI MO SAKA ANG PAGE NIG GAWAS SAAA KEYBOARD INPUTTTTTT 
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
    position: 'relative',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
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
    top: 20, 
    right: 25, 
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
    marginTop: -10,
    marginBottom: 10
  }, 
  registerText: { 
    color: 'black', 
    fontSize: 12,
  }, 
  registerButton: {
    position: 'absolute',
    bottom: 20, 
  },
});