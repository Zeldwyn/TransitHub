import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const SplashScreen = () => {
  // Get the dimensions of the device screen
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      <Image
        style={{
          ...styles.logo,
          width: windowWidth * 0.6, // Adjust the percentage as needed
          height: windowWidth * 0.6, // Adjust the percentage as needed
        }}
        source={require('./img/whiteLogo.png')}
      />
      <Image
        style={{
          ...styles.logo2,
          width: windowWidth * 0.6, // Adjust the percentage as needed
          height: windowWidth * 0.6, // Adjust the percentage as needed
        }}
        source={require('./img/whiteText.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A252C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: -100,
  },
  logo2: {
    marginTop: -100,
  }
});

export default SplashScreen;
