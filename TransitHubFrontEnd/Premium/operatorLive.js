import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import haversine from 'haversine';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';

export default function OperatorLive() {
    const [routeVisible, setRouteVisible] = useState(false);
    const [finishButtonEnabled, setFinishButtonEnabled] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState('In Progress');
    const [currentPosition, setCurrentPosition] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [panelHeight] = useState(new Animated.Value(70));
    const [containerOffset] = useState(new Animated.Value(0));
    const [panelExpanded, setPanelExpanded] = useState(false);
    const mapRef = useRef(null); // Create a ref for MapView

    // temporary, ilisa if nanay backend, btw pardo ni
    const deliveryAddress = { latitude: 10.283431, longitude: 123.859688 };    

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    useEffect(() => {
        if (currentPosition && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000); // 1-second animation
        }
    }, [currentPosition]);

    useEffect(() => {
        if (currentPosition) {
            const distanceToDestination = haversine(currentPosition, deliveryAddress, { unit: 'meter' });
            if (distanceToDestination < 50) {
                setFinishButtonEnabled(true);
            }
        }
    }, [currentPosition]);

    const handleStartDelivery = async () => {
        setRouteVisible(true);
        await calculateETA();
    };

    const calculateETA = async () => {
        if (currentPosition && routeVisible) {
            const origins = `${currentPosition.latitude},${currentPosition.longitude}`;
            const destinations = `${deliveryAddress.latitude},${deliveryAddress.longitude}`;

            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`
                );
                const data = await response.json();
                if (data.rows && data.rows[0].elements[0].duration_in_traffic) {
                    setEstimatedTime(data.rows[0].elements[0].duration_in_traffic.text);
                } else {
                    setEstimatedTime('ETA not available');
                }
            } catch (error) {
                console.error('Error fetching ETA:', error);
                setEstimatedTime('Error calculating ETA');
            }
        }
    };

    const handleFinishDelivery = () => {
        setDeliveryStatus('Completed');
        setRouteVisible(false); // Optionally hide route on completion
    };

    const handleCancelDelivery = () => {
        setRouteVisible(false);
        setFinishButtonEnabled(false);
        setDeliveryStatus('In Progress');
        setEstimatedTime(null);
        setCurrentPosition(null);
    };

    const togglePanel = () => {
        const toPanelHeight = panelExpanded ? 70 : 180;
        const toContainerOffset = panelExpanded ? 0 : 0;

        Animated.parallel([
            Animated.timing(panelHeight, {
                toValue: toPanelHeight,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(containerOffset, {
                toValue: toContainerOffset,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start();

        setPanelExpanded(!panelExpanded);
    };

    const defaultCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: containerOffset }] }]}>
            <MapView
                ref={mapRef} // Attach the ref to MapView
                style={styles.map}
                initialRegion={{
                    latitude: currentPosition ? currentPosition.latitude : defaultCoordinates.latitude,
                    longitude: currentPosition ? currentPosition.longitude : defaultCoordinates.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                onUserLocationChange={(event) => {
                    const newPosition = event.nativeEvent.coordinate;
                    setCurrentPosition(newPosition);
                    if (routeVisible) {
                        calculateETA(); // Update ETA as the user moves when the route is visible
                    }
                }}
            >
                {currentPosition && (
                    <Marker coordinate={currentPosition} title="Current Location" />
                )}
                <Marker coordinate={deliveryAddress} title="Delivery Address" />

                {routeVisible && currentPosition && (
                    <MapViewDirections
                        origin={currentPosition}
                        destination={deliveryAddress}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor="blue"
                    />
                )}
            </MapView>

            <Animated.View style={[styles.statusContainer, { height: panelHeight }]}>
                <TouchableOpacity style={styles.expandButton} onPress={togglePanel}>
                    <Text style={styles.expandButtonText}>{panelExpanded ? 'Collapse' : 'Expand'}</Text>
                </TouchableOpacity>
                <View style={styles.statusTextContainer}>
                    <Text style={styles.statusText}>Delivery Status: {deliveryStatus}</Text>
                    {routeVisible && estimatedTime && (
                        <Text style={styles.statusText}>ETA: {estimatedTime}</Text>
                    )}
                </View>
                <View style={styles.buttonsContainer}>
                    {!routeVisible && (
                        <TouchableOpacity style={styles.button} onPress={handleStartDelivery}>
                            <Text style={styles.buttonText}>Start Delivery</Text>
                        </TouchableOpacity>
                    )}
                    {routeVisible && (
                        <>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: finishButtonEnabled ? '#4CAF50' : '#9E9E9E' }]}
                                onPress={handleFinishDelivery}
                                disabled={!finishButtonEnabled}
                            >
                                <Text style={styles.buttonText}>Finish Delivery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleCancelDelivery}>
                                <Text style={styles.buttonText}>Cancel Delivery</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    map: {
        flex: 1,
    },
    statusContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    button: {
        backgroundColor: 'maroon',
        padding: 10,
        borderRadius: 5,
        width: 140,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusTextContainer: {
        marginTop: 10,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    expandButton: {
        padding: 10,
        backgroundColor: 'maroon',
        alignItems: 'center',
        borderRadius: 5,
    },
    expandButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
