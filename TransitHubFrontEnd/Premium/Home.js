import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

export default function OwnerHome() {
    const navigation = useNavigation();
    const [displayInvites, setDisplayInvites] = useState([]);
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [isOwner, setIsOwner] = useState(true);
    const [accepted, setAccepted] = useState(true);

    useEffect(() => {
        const getType = async () => {
            const type = await AsyncStorage.getItem('userType');
            const id = await AsyncStorage.getItem('premiumUserID');
            const oid = await AsyncStorage.getItem('operatorID');
            console.log("Inner:", type, "PremiumUserID:", id);
            if (type === "owner") {
                setIsOwner(true);
            } else if (type === "operator") {
                setIsOwner(false);
            }
            setUserType(type);
            setPID(id);
        };
        getType();
    }, []);

    useEffect(() => {
        if (!isOwner && userType && pID) {
            fetch(`${config.BASE_URL}/received-Invites`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'premiumUserID': parseInt(pID),
                })
            })
            .then(response => response.json())
            .then(data => {
                const filteredInvites = data.result.filter(invite => invite.status !== "Accepted");
                setDisplayInvites(filteredInvites);
            })
            .catch(error => {
                console.error('Error posting data to Express backend:', error);
            })} setAccepted(true);
    }, [isOwner, userType, pID, accepted]);

    const handleAccept = (ownerID) => {
        Alert.alert( "Confirmation", "Are you sure you want to accept?", [
            { text: "Cancel", style: 'destructive' },{
            text: "Accept", onPress: () => {
            fetch(`${config.BASE_URL}/accept-Invites`, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'ownerID': ownerID,
                    'premiumUserID': parseInt(pID),
            })})             
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error posting data to Express backend:', error);
            });  setAccepted(false);          
    }}])};
                
    const renderInvite = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.ownerID)}>
                <Text style={styles.accept}>Accept</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome To</Text>
            <Image
                style={{
                    ...styles.logo,
                    width: 350,
                    height: 250,
                }}
                source={require('../assets/img/blackText.png')}
            />
            <Text style={styles.label}>What are you going to deliver today?</Text>
            <View style={styles.row}>
                <TouchableOpacity onPress={() => navigation.navigate('Location')}>
                    <Image style={styles.options} source={require('../assets/img/package.png')} />
                </TouchableOpacity>
            </View>
            {!isOwner && (
                <View style={styles.temp}>
                    <Text style={styles.pendingLabel}>Pending Invites</Text>
                    <FlatList
                        data={displayInvites}
                        renderItem={renderInvite}
                        keyExtractor={(item, index) => item.email.toString()}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#FFC93F',
},
welcome: {
    fontSize: 30,
    marginTop: 50,
    marginBottom: 0,
    alignSelf: 'center'
},
label: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center'
},
pendingLabel: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center'
},
logo: {
    marginTop: -60,
    marginBottom: -30,
    alignSelf: 'center'
},
options: {
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
