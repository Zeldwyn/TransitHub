import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

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

        // Sample data for deliveries, remove if naa nay backend
        const sampleDeliveries = [
            { id: '1', item: 'Package 1', from: 'Location A', to: 'Location B', fee: '1000' },
            { id: '2', item: 'Package 2', from: 'Location C', to: 'Location D', fee: '1500' },
            { id: '3', item: 'Package 3', from: 'Location E', to: 'Location F', fee: '2000' }
        ];
        setDeliveries(sampleDeliveries);
    }, []);

    const handlePress = (id) => {
        setExpandedItemId(expandedItemId === id ? null : id);
    };

    const renderItem = ({ item }) => (
        <View style={styles.deliveryItem}>
            <TouchableOpacity onPress={() => handlePress(item.id)} style={styles.itemHeader}>
                <Text style={styles.deliveryText}>{item.item}</Text>
            </TouchableOpacity>
            {expandedItemId === item.id && (
                <View style={styles.details}>
                    <Text style={styles.detailText}>Pickup Location: {item.from}</Text>
                    <Text style={styles.detailText}>Delivery Location: {item.to}</Text>
                    <Text style={styles.detailText}>Fee: ₱{item.fee}</Text>
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
                style={styles.logo}
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
        padding: 20,
    },
    welcome: {
        fontSize: 30,
        marginTop: 40,
        marginBottom: 0,
        alignSelf: 'center'
    },
    logo: {
        marginTop: -50,
        width: 350,
        height: 250,
        alignSelf: 'center',
        marginVertical: 20,
    },
    date: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#555',
        marginTop: -50,
        marginBottom: 30,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#222',
        marginBottom: 10,
    },
    deliveryList: {
        flexGrow: 1,
    },
    deliveryItem: {
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    deliveryText: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    details: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    startButton: {
        marginTop: 10,
        paddingVertical: 10,
        backgroundColor: 'maroon',
        borderRadius: 5,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
