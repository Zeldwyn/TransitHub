import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StartMenu () {
  const [ip, setIP] = useState('');
  const navigation = useNavigation();

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  useEffect(() => { 
    AsyncStorage.getItem('deviceID')
      .then((storedDeviceID) => {
        if (!storedDeviceID) {
          const newDeviceID = uuid.v4();
          AsyncStorage.setItem('deviceID', newDeviceID);
          console.log('Generated new deviceID:', newDeviceID);
        } else {
          console.log('DeviceID already exists:', storedDeviceID);
        }
      })
      .catch((error) => {
        console.error('Error retrieving deviceID:', error);
      });
  },[])
  return (
    <SafeAreaView style={{backgroundColor: '#E3B130', minHeight: '100%'}}>
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'android' ? 'height' : null}>
        <ScrollView showsVerticalScrollIndicator={false}> 
    <View style={styles.container}>
      <Image
        style={{
          ...styles.logo,
          width: windowWidth * 0.5, 
          height: windowWidth * 0.5, 
        }}
        source={require('./img/blackLogo.png')}
      />
      <Text style={styles.text}>Welcome To</Text>
      <Image
        style={{
          ...styles.logo2,
          width: windowWidth * 0.7, 
          height: windowWidth * 0.7, 
        }}
        source={require('./img/blackText.png')}
      />
      <Text style={styles.mantra}>"Navigate with Transithub, Deliver with Confidence"</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterEmail')}>
          <Text style={styles.buttonText}>Join Now</Text>
        </TouchableOpacity>
      <View style={{flexDirection: 'row'}}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.textTwoButton}>
          <Text style={styles.textTwo}>Login | </Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('GuestDrawer')} style={styles.textTwoButton}>
          <Text style={styles.textTwo}>Guest</Text>
      </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
      </KeyboardAvoidingView>  
    </SafeAreaView>
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
    fontSize: 35, 
    marginTop: 10, 
  },
  mantra: {
    fontSize: 25, 
    margin: 5, 
    justifyContent: 'center',
    textAlign: 'center',
    width: "70%",
  },
  button: {
    backgroundColor: 'maroon',
    borderRadius: 5,
    width: 300,
    height: 40,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 70,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 18,
    textAlign: 'center'
  },
  logo: {
    marginTop: 60,
  },
  logo2: {
    marginTop: -90,
    marginBottom: -70
  },
  textTwo: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textTwoButton: {
    alignSelf: 'center',
    marginTop: 30,
  },
});

