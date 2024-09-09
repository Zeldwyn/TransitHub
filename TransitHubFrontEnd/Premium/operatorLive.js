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
    const [distance, setDistance] = useState(null);
    const [note, setNote] = useState('');
    const [panelHeight] = useState(new Animated.Value(75));
    const [panelExpanded, setPanelExpanded] = useState(false);
    const [locationPromptVisible, setLocationPromptVisible] = useState(false);
    const mapRef = useRef(null);

    const deliveryAddress = { latitude: 10.283431, longitude: 123.859688 };

    useEffect(() => {
        let locationSubscription;
        (async () => {
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                setLocationPromptVisible(true);
                return;
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                (location) => {
                    console.log('Location update:', location);
                    setCurrentPosition({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (currentPosition && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        }
    }, [currentPosition]);

    useEffect(() => {
        if (currentPosition) {
            const distanceToDestination = haversine(currentPosition, deliveryAddress, { unit: 'meter' });
            setFinishButtonEnabled(distanceToDestination < 50);
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
    
                if (data.status === 'ZERO_RESULTS') {
                    console.warn('No route found between the origin and destination.');
                    setEstimatedTime('No route available');
                    setDistance('N/A');
                    return;
                }
    
                const duration = data?.rows?.[0]?.elements?.[0]?.duration_in_traffic?.value;
    
                if (duration) {
                    const minutes = Math.floor(duration / 60);
                    const hours = Math.floor(minutes / 60);
                    setEstimatedTime(hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`);
                } else {
                    setEstimatedTime('ETA not available');
                }
    
                const distanceInMeters = haversine(currentPosition, deliveryAddress, { unit: 'meter' });
                setDistance((distanceInMeters / 1000).toFixed(2));
    
            } catch (error) {
                console.error('Error fetching ETA:', error);
                setEstimatedTime('Error calculating ETA');
            }
        }
    };    

    const handleFinishDelivery = () => {
        setDeliveryStatus("Delivered");
        setRouteVisible(false);
    };

    const handleCancelDelivery = () => {
        setRouteVisible(false);
        setFinishButtonEnabled(false);
        setEstimatedTime(null);
        setDeliveryStatus("Cancelled");
        setDistance(null);
        setCurrentPosition(null);
    };

    const togglePanel = () => {
        const toPanelHeight = panelExpanded ? 75 : 300;

        Animated.timing(panelHeight, {
            toValue: toPanelHeight,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setPanelExpanded(!panelExpanded);
    };

    const defaultCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194
    };

    const handlePromptClose = () => {
        setLocationPromptVisible(false);
        // Optionally redirect the user to the device settings
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: currentPosition ? currentPosition.latitude : defaultCoordinates.latitude,
                    longitude: currentPosition ? currentPosition.longitude : defaultCoordinates.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsTraffic={true}
                onUserLocationChange={(event) => {
                    const newPosition = event.nativeEvent.coordinate;
                    setCurrentPosition(newPosition);
                    if (routeVisible) {
                        calculateETA();
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
                        strokeWidth={5}
                        strokeColor="green"
                    />
                )}
            </MapView>

            <Animated.View style={[styles.statusContainer, { height: panelHeight }]}>
                <TouchableOpacity style={styles.expandButton} onPress={togglePanel}>
                    <Text style={styles.expandButtonText}>{panelExpanded ? 'Collapse' : 'Expand'}</Text>
                </TouchableOpacity>
                <View style={styles.statusTextContainer}>
                    {routeVisible && (
                        <>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailTextBold}>{distance || 'Calculating...'}</Text>
                                <Text style={styles.detailTextBold}>{estimatedTime || 'Calculating...'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>DISTANCE</Text>
                                <Text style={styles.detailLabel}>ESTIMATED DELIVERY TIME</Text>
                            </View>
                            <Text style={styles.Note}>Note: {note || 'No additional note'}</Text>
                        </>
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

                            <TouchableOpacity style={styles.button} onPress={handleCancelDelivery}>
                                <Text style={styles.buttonText}>Cancel Delivery</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Animated.View>

            {locationPromptVisible && (
                <View style={styles.promptContainer}>
                    <Text style={styles.promptText}>Please enable location services to proceed with delivery tracking.</Text>
                    <TouchableOpacity style={styles.promptButton} onPress={handlePromptClose}>
                        <Text style={styles.promptButtonText}>OK</Text>
                    </TouchableOpacity>
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
        ...StyleSheet.absoluteFillObject,
    },
    statusContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    expandButton: {
        alignItems: 'center',
        marginBottom: 10,
    },
    expandButtonText: {
        fontSize: 16,
        color: '#800000',
    },
    statusTextContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    detailRow: {
        marginTop:25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    detailTextBold: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    detailLabel: {
        color: '#888888',
        fontSize: 14,
    },
    Note: {
        marginTop: 10,
        color: '#555555',
        fontSize: 12,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#800000',
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    promptContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    promptText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    promptButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    promptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

