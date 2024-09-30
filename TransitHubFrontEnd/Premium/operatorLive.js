import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import haversine from 'haversine';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';
import config from "../config";
console.log(GOOGLE_MAPS_API_KEY);
export default function OperatorLive({ route, navigation }) {
    const { deliveryId, operatorID } = route.params;
    const [routeVisible, setRouteVisible] = useState(false);
    const [finishButtonEnabled, setFinishButtonEnabled] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState('In Progress');
    const [currentPosition, setCurrentPosition] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [distance, setDistance] = useState(null);
    const [note, setNote] = useState(''); // Set note here
    const [clientName, setClientName] = useState('');
    const [panelHeight] = useState(new Animated.Value(80));
    const [panelExpanded, setPanelExpanded] = useState(false);
    const [locationPromptVisible, setLocationPromptVisible] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchDeliveryDetails = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/delivery/${deliveryId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error(`Error fetching delivery details: ${response.status} - ${errorMessage}`);
                    throw new Error('Network response was not ok');
                }
        
                const data = await response.json();
        
                const [fromLat, fromLng] = data.fromCoords.split(', ').map(coord => parseFloat(coord));
                const [toLat, toLng] = data.toCoords.split(', ').map(coord => parseFloat(coord));
        
                setDeliveryAddress({
                    latitude: toLat,
                    longitude: toLng,
                });
                setNote(data.notes || '');
                setClientName(data.clientName || '');
        
                if (toLat && toLng) {
                    startTrackingLocation();
                }
        
            } catch (error) {
                console.error('Error fetching delivery details:', error);
                Alert.alert('Error', 'Unable to fetch delivery details.');
            }
        };

        fetchDeliveryDetails();
    }, [deliveryId, route.params?.refresh]);

    const startTrackingLocation = async () => {
        let locationSubscription;
        (async () => {
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                setLocationPromptVisible(true);
                return;
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Location permission is needed to track delivery.');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                (location) => {
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
    };

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
        if (currentPosition && deliveryAddress) {
            const distanceToDestination = haversine(currentPosition, deliveryAddress, { unit: 'km' });
            setFinishButtonEnabled(distanceToDestination < 0.10); // Enable when below 0.10 km or 100 meter
        }
    }, [currentPosition, deliveryAddress]);

    const handleStartDelivery = async () => {
        setRouteVisible(true);
        setPanelExpanded(true); 
    
        Animated.timing(panelHeight, {
            toValue: 300,
            duration: 300,
            useNativeDriver: false,
        }).start();
    
        await calculateETA();
    };

    const calculateETA = async () => {
        if (currentPosition && deliveryAddress && routeVisible) {
            const origins = `${currentPosition.latitude},${currentPosition.longitude}`;
            const destinations = `${deliveryAddress.latitude},${deliveryAddress.longitude}`;

            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`
                );
                const data = await response.json();

                if (data.status === 'ZERO_RESULTS') {
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

    const handleFinishDelivery = async () => {
        try {
            const response = await fetch(`${config.BASE_URL}/update-Deliverystatus`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deliveryId: deliveryId,
                    status: 'Completed',
                }),
            });
    
            if (!response.ok) {
                const errorMessage = await response.text();
                console.error(`Error updating delivery status: ${response.status} - ${errorMessage}`);
                throw new Error('Failed to update delivery status.');
            }
    
            setDeliveryStatus("Completed");
            setRouteVisible(false);
            Alert.alert('Success', 'Delivery has been marked as completed.');
            
            // Navigate back and pass the refresh parameter
            navigation.navigate('OperatorDrawer', { refresh: true });
    
        } catch (error) {
            console.error('Error finishing delivery:', error);
            Alert.alert('Error', 'Unable to finish delivery.');
        }
    };

    const togglePanel = () => {
        const toPanelHeight = panelExpanded ? 80 : 280; 
    
        Animated.timing(panelHeight, {
            toValue: toPanelHeight,
            duration: 300,
            useNativeDriver: false,
        }).start();
    
        setPanelExpanded(!panelExpanded);
    };

    const handlePromptClose = () => {
        setLocationPromptVisible(false);
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: currentPosition ? currentPosition.latitude : deliveryAddress?.latitude || 0,
                    longitude: currentPosition ? currentPosition.longitude : deliveryAddress?.longitude || 0,
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
                {deliveryAddress && (
                    <Marker coordinate={deliveryAddress} title="Delivery Address" />
                )}

                {routeVisible && currentPosition && deliveryAddress && (
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
        <Text style={styles.expandButtonText}>{panelExpanded ? 'Status' : 'Status'}</Text>
    </TouchableOpacity>
    {panelExpanded && ( // Show only when the panel is expanded
        <>
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
                        <Text style={styles.note}>Client Name: {clientName || 'No client name'}</Text>
                        <Text style={styles.note}>Note: {note || 'No additional note'}</Text>
                    </>
                )}
            </View>
            <View style={styles.buttonsContainer}>
                {/* Show "Start Delivery" button only if routeVisible is false and panel is expanded */}
                {!routeVisible && (
                    <TouchableOpacity style={styles.button} onPress={handleStartDelivery}>
                        <Text style={styles.buttonText}>Start Delivery</Text>
                    </TouchableOpacity>
                )}
                {/* Show "Finish Delivery" button only if routeVisible is true */}
                {routeVisible && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: finishButtonEnabled ? '#800000' : '#ccc' }]}
                        onPress={finishButtonEnabled ? handleFinishDelivery : () => {}}
                        disabled={!finishButtonEnabled}
                    >
                        <Text style={styles.buttonText}>Finish Delivery</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    )}
</Animated.View>

            {locationPromptVisible && (
                <View style={styles.locationPrompt}>
                    <Text style={styles.promptText}>Location services are not enabled. Please enable them in settings.</Text>
                    <TouchableOpacity onPress={handlePromptClose}>
                        <Text style={styles.promptButton}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    statusContainer: {
        backgroundColor: '#FFC93F',
        borderRadius: 20,
        padding: 5,
        margin: 10,
        position: "absolute",
        bottom: 20, 
        left: 0,
        right: 0, 
        alignSelf: "center", 
    },
    expandButton: {
        width:'100%',
        alignSelf: 'center',
        padding: 10,
        backgroundColor: '#FFC93F',
    },
    expandButtonText: {
        
        fontSize: 25,
        textAlign: 'center', 
        color: 'black',
        fontWeight: "bold"
    },
    statusTextContainer: {
        paddingLeft: 20,
        paddingRight: 20,
        marginVertical: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    detailTextBold: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: '#888',
    },
    note: {
        fontSize: 16,
        marginVertical: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'maroon',
        padding: 10,
        marginLeft: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    locationPrompt: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        borderColor: '#ddd',
        borderWidth: 1,
        alignItems: 'center',
    },
    promptText: {
        fontSize: 16,
        marginBottom: 5,
    },
    promptButton: {
        fontSize: 16,
        color: '#007BFF',
    },
});

