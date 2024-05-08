import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';

export default function RegisterEmail() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const handleSubmit = async() => {
    console.log(email);
    fetch('http://192.168.1.8:8080/send-OTP', {
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
        navigation.navigate('OTP');
      })
      .catch(error => {
        console.error('Error posting data to Express backend:', error);
      });
  }
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
        <Text style={styles.text}>Register using Google Email</Text>
        <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Enter Email"
        />
        {/* <CustomButton title='Submit' onPress={handleSubmit}/> */}
        <CustomButton title='Submit' onPress={() => navigation.navigate('OTP')}/>
        </View>
    </KeyboardAvoidingView>
  );
}
const CustomButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.btnTxt}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#E3B130',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    logo: {
        marginTop: -250,
        marginBottom: 30,
    },
    text: {
        fontSize: 20,
        marginTop: -100,
        marginBottom: 20,
    },
    input: {
        height: 40,
        width: 350,
        borderRadius: 5,
        borderColor: 'white',
        backgroundColor: 'white',
        margin: 12,
        borderWidth: 1,
        padding: 10,
        textAlign: 'center',
        marginBottom: 20
    },
    btn: {
        backgroundColor: '#8A252C',
        padding: 10,
        width: 350,
        height: 40,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    btnTxt: {
        color: 'white',
        fontSize: 16,
    },
});


