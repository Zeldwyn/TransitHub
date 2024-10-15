import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import config from '../config';
import { GOOGLE_MAPS_API_KEY } from '@env';

export default function TrackOperator({ route }) {
    const { operatorID } = route.params;
    const [operatorLocation, setOperatorLocation] = useState(null);
    const [operatorAddress, setOperatorAddress] = useState(null); 
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchOperatorLocation = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/operator-location/${operatorID}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch operator location');
                }

                const data = await response.json();

                const latitude = parseFloat(data.latitude);
                const longitude = parseFloat(data.longitude);

                if (latitude && longitude) {
                    setOperatorLocation({ latitude, longitude });
                    fetchAddressFromCoords(latitude, longitude); 
                } else {
                    throw new Error('Invalid location data');
                }
            } catch (error) {
                console.error('Error fetching operator location:', error);
                Alert.alert('Error', `Unable to fetch operator location: ${error.message}`);
            }
        };

        const fetchAddressFromCoords = async (latitude, longitude) => {
            try {
                const geocodingResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
                );
                const geocodingData = await geocodingResponse.json();
                if (geocodingData.results && geocodingData.results.length > 0) {
                    const address = geocodingData.results[0].formatted_address;
                    setOperatorAddress(address || 'Nearest known location'); 
                } else {
                    setOperatorAddress('Unable to retrieve address, showing nearest location');
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                setOperatorAddress('Unable to retrieve address, showing nearest location');
            }
        };

        fetchOperatorLocation();

        const intervalId = setInterval(fetchOperatorLocation, 10000); 

        return () => clearInterval(intervalId); 
    }, [operatorID]);
    useEffect(() => {
        if (operatorLocation && mapRef.current) {
            mapRef.current.animateCamera({
                center: {
                    latitude: operatorLocation.latitude,
                    longitude: operatorLocation.longitude,
                },
                zoom: 15, 
            });
        }
    }, [operatorLocation]);

    return (
        <View style={styles.container}>
            {operatorLocation ? (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: operatorLocation.latitude,
                        longitude: operatorLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    showsTraffic={true}
                >
                    <Marker coordinate={operatorLocation} title="Operator Location" />
                </MapView>
            ) : (
                <ActivityIndicator size="large" color="#0000ff" />
            )}
            {operatorLocation && operatorAddress && (
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Operator is currently at:</Text>
                    <Text style={styles.addressText}>{operatorAddress}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    infoContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    infoText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 16,
        color: '#555',
    },
});
