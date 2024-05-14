import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
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
      <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />
      <CustomButton title="Register" onPress={() => navigation.navigate('RegisterEmail')}/>
      <CustomButton title="Guest" onPress={() => navigation.navigate('GuestDrawer')} />
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
    fontSize: 35, 
    marginTop: 10, 
  },
  button: {
    backgroundColor: '#8A252C',
    padding: 10,
    width: 280,
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
    marginTop: -50,
  },
  logo2: {
    marginTop: -90,
    marginBottom: -70
  }
});

