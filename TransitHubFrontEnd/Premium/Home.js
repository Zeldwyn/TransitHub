import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, TouchableWithoutFeedback, FlatList, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home(){
    const navigation = useNavigation();
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const [displayInvites, setDisplayInvites] = useState([]);
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [isOwner, setIsOwner] = useState(true);

    useEffect(() => {
        const getType = async() => {
            const type = await AsyncStorage.getItem('userType')
            const id = await AsyncStorage.getItem('premiumUserID')
            console.log("Inner: ", type, "ID: ", id);
            if(type == "owner") 
                setIsOwner(true);
            else if (type == "operator")
                setIsOwner(false)
            setUserType(type);
            setPID(4);         
        }
        getType();
    }, []);

    useEffect(() => {
        fetch(`http://192.168.1.8:8080/received-Invites`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'premiumUserID': 7,
            })
        })
        .then(response => response.json())
        .then(data => {
            const filteredInvites = data.result.filter(invite => invite.status !== "Accepted");
            setDisplayInvites(filteredInvites);
        })
        .catch(error => {
            console.error('Error posting data to Express backend:', error);
        })
    });

    const handleAccept = (ownerID) => {
        Alert.alert(
        "Confirmation","Are you sure you want to accept?",
        [{text: "Cancel", style: 'destructive'}, {text: "Accept", onPress: () => {
            fetch(`http://192.168.1.8:8080/accept-Invites`, {
                method: 'PUT',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'ownerID': ownerID,
                    'premiumUserID': 7,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error posting data to Express backend:', error);
            })
        }}]);         
    }
    const renderInvite = ({ item }) => (
        <ScrollView contentContainerStyle={styles.itemContainer}>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.ownerID)}>
                <Text style={styles.accept}>Accept</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (      
    <View style={styles.container}>
        <Text style={styles.welcome}>Welcome To</Text>
        <Image
            style={{
                ...styles.logo,
                width: windowWidth * 0.7, 
                height: windowHeight * 0.2, 
            }}
            source={require('../assets/img/blackText.png')}
        />
        <Text style={styles.label}>What are you going to deliver today?</Text>
        <View style={styles.row}>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                <Image style={styles.options} source={require('../assets/img/package.png')} />
            </TouchableOpacity>
            <View style={{ width: 20 }} />
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                <Image style={styles.options} source={require('../assets/img/custom.png')} />
            </TouchableOpacity>
        </View>
        {isOwner ||(
            <View style={styles.temp}>
            <Text style={styles.pendingLabel}>Pending Invites</Text>
            <FlatList
            data={displayInvites}
            renderItem={renderInvite}
            keyExtractor={(item, index) => item.email.toString()}
            />
            </View>
        ) }
    </View>
    );
  };
const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  
},
welcome: {
    fontSize: 30, 
    marginTop: 50, 
    marginBottom: 30,
    alignSelf: 'center'
},
label :{
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center'
},
pendingLabel :{
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center'
},
logo: {
    marginTop: -50,
    alignSelf: 'center'
},
options:{
    marginTop: 30,
},
row: {
    flexDirection: 'row',
    justifyContent: 'center',
},
itemContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'maroon',
    backgroundColor: '#fff',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 3,
    height: 70
},
textContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
},
temp: {
    height: 250,
},
email: {
    fontSize: 12.5,
},
name: {
    fontSize: 15,
},
accept: {
    color: '#fff',
    fontWeight: 'bold',
    width: 45,
    textAlign: 'center'
},
acceptBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'maroon',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
},
});
 
  