import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import config from "../config";


export default function OperatorHome() {
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [isOwner, setIsOwner] = useState(true);
    const [currentDate, setCurrentDate] = useState('');
    const [deliveries, setDeliveries] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const getType = async () => {
            const type = await AsyncStorage.getItem('userType');
            const id = await AsyncStorage.getItem('premiumUserID');
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
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        setCurrentDate(formattedDate);

        // Sample data for deliveries
        const sampleDeliveries = [
            { id: '1', item: 'Package 1', time: '10:00 AM', from: 'Location A', to: 'Location B', fee: '$10' },
            { id: '2', item: 'Package 2', time: '12:30 PM', from: 'Location C', to: 'Location D', fee: '$15' },
            { id: '3', item: 'Package 3', time: '3:15 PM', from: 'Location E', to: 'Location F', fee: '$20' }
        ];
        setDeliveries(sampleDeliveries);
    }, []);

    const handlePress = (id) => {
        setExpandedItemId(expandedItemId === id ? null : id);
    };

    const renderItem = ({ item }) => (
        <View style={styles.deliveryItem}>
            <TouchableOpacity onPress={() => handlePress(item.id)}>
                <Text style={styles.deliveryText}>{item.item} - {item.time}</Text>
            </TouchableOpacity>
            {expandedItemId === item.id && (
                <View style={styles.details}>
                    <Text style={styles.detailText}>To: {item.to}</Text>
                    <Text style={styles.detailText}>Fee: {item.fee}</Text>
                    <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('OperatorLive')}>
                        <Text style={styles.startButtonText}>Deliver</Text>
                    </TouchableOpacity>
                </View>
            )}
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
            <Text style={styles.date}>{currentDate}</Text>

            <Text style={styles.label}>Deliveries for today</Text>
            <FlatList
                data={deliveries}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.deliveryList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    welcome: {
        fontSize: 30,
        marginTop: 40,
        marginBottom: 0,
        alignSelf: 'center'
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    date: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 40,
        marginTop: -30,
    },
    logo: {
        marginTop: -50,
        marginBottom: -30,
        alignSelf: 'center'
    },
    deliveryList: {
        paddingHorizontal: 20,
    },
    deliveryItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },
    deliveryText: {
        fontSize: 16,
    },
    details: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    detailText: {
        fontSize: 14,
        marginBottom: 5,
    },
    startButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'maroon',
        borderRadius: 5,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: 16,
    },
});
