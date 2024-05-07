import React, { useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PremiumHome(){
    const navigation = useNavigation();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [showNavList, setShowNavList] = useState(false);


    return (        // Dli pa final ang navlist
        <TouchableWithoutFeedback onPress={() => setShowNavList(false)}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.hamburger} onPress={() => setShowNavList(!showNavList)}>
              <Image
                source={require('../assets/img/hamburger.png')}
                style={styles.hamburgerIcon}
              />
            </TouchableOpacity>
            {showNavList && (
              <View style={styles.navList}>
                <TouchableOpacity onPress={() => navigation.navigate('TransactionRecords')}>
                  <Text style={styles.navItem}>Records</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
                  <Text style={styles.navItem}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('StartMenu')}>
                  <Text style={styles.navItem}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.text}>Welcome To</Text>
            <Image
                style={{
                    ...styles.logo,
                    width: windowWidth * 0.7, 
                    height: windowHeight * 0.2, 
                }}
                source={require('../assets/img/blackText.png')}
            />
            <Text style={styles.text2}>What are you going to deliver today?</Text>
            <View style={styles.row}>
                <TouchableOpacity onPress={() => navigation.navigate('StartMenu')}>
                    <Image style={styles.options} source={require('../assets/img/package.png')} />
                </TouchableOpacity>
                <View style={{ width: 20 }} />
                <TouchableOpacity onPress={() => navigation.navigate('StartMenu')}>
                    <Image style={styles.options} source={require('../assets/img/custom.png')} />
                </TouchableOpacity>
            </View>
        </View>
      </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    hamburger: {
        position: 'absolute',
        left: 20,
        top: 40,
        zIndex: 1,
    },
    hamburgerIcon: {
        width: 40,
        height: 40,
    },
    navList: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'absolute',
        left: 10,
        top: 40,
        zIndex: 1,
        backgroundColor: '#fff', 
        padding: 20,
        borderWidth: 1, 
        borderRadius: 5, 
        borderColor: '#ccc', 
    },
    navItem: {
        fontSize: 20,
        marginVertical: 5,
    },
    text: {
        fontSize: 28, 
        marginTop: 150, 
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
