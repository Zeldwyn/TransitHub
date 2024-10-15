import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import config from "../config";
import { GOOGLE_MAPS_API_KEY } from '@env';

console.log(GOOGLE_MAPS_API_KEY);

export default function OperatorHome() {
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [deliveries, setDeliveries] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [locationCache, setLocationCache] = useState({});
    const navigation = useNavigation();
    const route = useRoute(); // Use route to access parameters

    useEffect(() => {
        const getType = async () => {
            try {
                const type = await AsyncStorage.getItem('userType');
                if (type === "owner") {
                    const ownerID = await AsyncStorage.getItem('premiumUserID');
                    setUserType(type);
                    if (ownerID) {
                        console.log('Owner ID:', ownerID);
                        setPID(ownerID);
                    } else {
                        console.log('Owner ID not found');
                    }
                } else if (type === "operator") {
                    const premiumUserID = await AsyncStorage.getItem('premiumUserID');
                    setUserType(type);
                    if (premiumUserID) {
                        try {
                            const response = await fetch(`${config.BASE_URL}/getOperatorID?premiumUserID=${premiumUserID}`);
                            const data = await response.json();
                            if (response.ok) {
                                const operatorID = data.operatorID; // Assuming this is what you get from the API
                                setPID(operatorID);
                                await AsyncStorage.setItem('operatorID', operatorID.toString()); // Save operatorID to AsyncStorage
                            } else {
                                console.log('Operator ID not found:', data.error);
                            }
                        } catch (error) {
                            console.error('Error fetching operator ID:', error);
                        }
                    } else {
                        console.log('Premium User ID not found');
                    }
                } else {
                    console.log('User type is undefined or invalid');
                }
            } catch (error) {
                console.error("Error retrieving user data:", error);
            }
        };
        getType();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (pID) {
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0]; 
                fetchDeliveries(formattedDate);
            } else {
                console.log('pID is not set, skipping delivery fetch');
            }

            // Fetch deliveries if the refresh parameter is present
            if (route.params?.refresh) {
                fetchDeliveries(new Date().toISOString().split('T')[0]);
            }
        }, [pID, route.params?.refresh])
    );

    useEffect(() => {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        setCurrentDate(formattedDate);
    }, []); 

    const fetchDeliveries = async (date) => {
        try {
            const apiUrl = `${config.BASE_URL}/deliveries?date=${date}&operatorID=${pID}`;
            console.log(`Fetching deliveries from: ${apiUrl}`);
            const response = await fetch(apiUrl);
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                console.log('Deliveries data:', data);
    
                const pendingDeliveries = data.filter(delivery => delivery.status === "Pending");
    
                const updatedDeliveries = await Promise.all(pendingDeliveries.map(async (delivery) => {
                    console.log('Delivery item:', delivery); // Check each item
                    const fromLocation = await getLocationFromCoords(delivery.fromCoords);
                    const toLocation = await getLocationFromCoords(delivery.toCoords);
                    return { ...delivery, fromLocation, toLocation };
                }));
    
                setDeliveries(updatedDeliveries);
            } else {
                throw new Error("Expected JSON but received something else.");
            }
        } catch (error) {
            console.error("Error fetching deliveries:", error);
        }
    };    

    const getLocationFromCoords = async (coords) => {
        if (!coords || locationCache[coords]) {
            return locationCache[coords] || "Unknown location";
        }

        try {
            const [latitude, longitude] = coords.split(",");
            const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const address = data.results[0].formatted_address;
                    setLocationCache(prevCache => ({ ...prevCache, [coords]: address }));
                    return address;
                }
            }
            return "Unknown location";
        } catch (error) {
            console.error("Error fetching location:", error);
            return "Unknown location";
        }
    };

    const handlePress = (id) => {
        setExpandedItemId(expandedItemId === id ? null : id);
    };

    const handleDeliverPress = (deliveryId) => {
        navigation.navigate('OperatorLive', { deliveryId, operatorID: pID });
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.deliveryItem}>
                <TouchableOpacity onPress={() => handlePress(item.id)} style={styles.itemHeader}>
                    <Text style={styles.deliveryText}>{item.clientName}</Text>
                </TouchableOpacity>
                {expandedItemId === item.id && (
                    <View style={styles.details}>
                        <Text style={styles.detailText}>Pickup Location: {item.fromLocation}</Text>
                        <Text style={styles.detailText}>Delivery Location: {item.toLocation}</Text>
                        <Text style={styles.detailText}>Expected Fee: ₱{item.finalFee}</Text>
                        <TouchableOpacity style={styles.startButton} onPress={() => handleDeliverPress(item.id)}>
                            <Text style={styles.startButtonText}>Deliver</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome To</Text>
            <Image
                style={styles.logo}
                source={require('../assets/img/blackText.png')}
            />
            <Text style={styles.date}>{currentDate}</Text>
            <Text style={styles.label}>Deliveries for today</Text>
            {deliveries.length === 0 ? (
                <Text style={styles.noDeliveries}>No deliveries for today</Text>
            ) : (
                <FlatList
                    data={deliveries}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.deliveryList}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFC93F',
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
    noDeliveries: {
        fontSize: 16,
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
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
        shadowRadius: 3,
        padding: 10,
    },
    itemHeader: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    deliveryText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    details: {
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },
    detailText: {
        fontSize: 14,
        marginBottom: 5,
    },
    startButton: {
        backgroundColor: '#007bff',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
