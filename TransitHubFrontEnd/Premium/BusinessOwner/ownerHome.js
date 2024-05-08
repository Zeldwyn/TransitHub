import React, { useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
export default function OwnerHome(){
    const navigation = useNavigation();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [showNavList, setShowNavList] = useState(false);


    return (        // Dli pa final ang navlist
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <Text style={styles.text}>Welcome To</Text>
            <Image
                style={{
                    ...styles.logo,
                    width: windowWidth * 0.7, 
                    height: windowHeight * 0.2, 
                }}
                source={require('../../assets/img/blackText.png')}
            />
            <Text style={styles.text2}>What are you going to deliver today?</Text>
            <View style={styles.row}>
                <TouchableOpacity onPress={() => navigation.navigate('StartMenu')}>
                    <Image style={styles.options} source={require('../../assets/img/package.png')} />
                </TouchableOpacity>
                <View style={{ width: 20 }} />
                <TouchableOpacity onPress={() => navigation.navigate('StartMenu')}>
                    <Image style={styles.options} source={require('../../assets/img/custom.png')} />
                </TouchableOpacity>
            </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    alignItems: 'center',
    justifyContent: 'flex-start',
},
text: {
    fontSize: 30, 
    marginTop: 50, 
    marginBottom: 30,
},
text2 :{
    fontSize: 18,
    fontWeight: 'bold',
},
logo: {
    marginTop: -50,
},
options:{
    marginTop: 30,
},
row: {
    flexDirection: 'row',
    justifyContent: 'center',
},
});
 
  