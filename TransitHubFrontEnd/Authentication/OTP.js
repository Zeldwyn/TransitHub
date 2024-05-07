import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function OTP(){
    const navigation = useNavigation();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [otp, setOtp] = useState('');
    const handleSubmit = async() => {
        console.log(otp);
        fetch('http://192.168.1.8:8080/verify-OTP', {
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
            navigation.navigate('RegisterDetails');
          })
          .catch(error => {
            console.error('Error posting data to Express backend:', error);
          });
    }
    const handleResendOTP = async() => {
        fetch('http://192.168.1.8:8080/resend-OTP', {
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
      <View style={styles.container}>
        <Image
          style={{
            ...styles.logo,
            width: windowWidth * 0.8,
            height: windowWidth * 0.8,
          }}
          source={require('../assets/img/blackText.png')}
        />

        <Text style={styles.text}>One Time Password</Text>
        <TextInput
            style={styles.input}
            value={otp}
            onChangeText={(text) => setOtp(text)}
            placeholder="Enter OTP"
            keyboardType='number-pad'
            
        />
        <TouchableOpacity onPress={handleResendOTP}>
            <Text style={styles.text2}>Resend OTP</Text>
        </TouchableOpacity>
        {/* <CustomButton title="Submit" onPress={handleSubmit} /> */}
        <CustomButton title="Submit" onPress={() => navigation.navigate('RegisterDetails')} />
        <CustomButton title="Back" onPress={() => navigation.navigate('RegisterEmail')} />
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
});