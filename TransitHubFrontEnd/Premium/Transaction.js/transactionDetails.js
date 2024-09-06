import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function TransactionDetails() {
    const [fromCoords, setFromCoords] = useState(null);
    const [toCoords, setToCoords] = useState(null);
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const navigation = useNavigation();

    const [region, setRegion] = useState({
        latitude: 10.3157,
        longitude: 123.8854,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        if (shouldNavigate) {
            setShouldNavigate(false);
            navigation.navigate('ChooseDate');
        }
    }, [shouldNavigate, navigation]);

    const handleGetDirections = async () => {
        try {
            if (!fromCoords || !toCoords) {
                console.error("Both location fields must be filled.");
                return;
            }

            // DEBUGG YAWAAAAAA PISTE ERROR
            console.log("From Coords:", fromCoords);
            console.log("To Coords:", toCoords);

            const fromLat = typeof fromCoords.latitude === 'string' ? parseFloat(fromCoords.latitude) : fromCoords.latitude;
            const fromLng = typeof fromCoords.longitude === 'string' ? parseFloat(fromCoords.longitude) : fromCoords.longitude;
            const toLat = typeof toCoords.latitude === 'string' ? parseFloat(toCoords.latitude) : toCoords.latitude;
            const toLng = typeof toCoords.longitude === 'string' ? parseFloat(toCoords.longitude) : toCoords.longitude;

            setFromCoords({ latitude: fromLat, longitude: fromLng });
            setToCoords({ latitude: toLat, longitude: toLng });
        } catch (error) {
            console.error("Error fetching coordinates:", error);
        }
    };

    return (
        <View style={styles.container}>
             <Text>From: </Text>
            <GooglePlacesAutocomplete
                placeholder='Enter starting location'
                onPress={(data, details = null) => {
                    if (details) {
                        const location = details.geometry.location;
                        console.log("Selected From Location:", location);
                        setFromCoords({
                            latitude: typeof location.lat === 'string' ? parseFloat(location.lat) : location.lat,
                            longitude: typeof location.lng === 'string' ? parseFloat(location.lng) : location.lng,
                        });
                    }
                }}
                fetchDetails={true}
                query={{
                    key: GOOGLE_MAPS_API_KEY,
                    language: 'en',
                }}
                styles={styles.autocomplete}
            />

            <Text>To: </Text>
            <GooglePlacesAutocomplete
                placeholder='Enter destination'
                onPress={(data, details = null) => {
                    if (details) {
                        const location = details.geometry.location;
                        console.log("Selected To Location:", location);
                        setToCoords({
                            latitude: typeof location.lat === 'string' ? parseFloat(location.lat) : location.lat,
                            longitude: typeof location.lng === 'string' ? parseFloat(location.lng) : location.lng,
                        });
                    }
                }}
                fetchDetails={true}
                query={{
                    key: GOOGLE_MAPS_API_KEY,
                    language: 'en',
                }}
                styles={styles.autocomplete}
            />
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
            >
                {fromCoords && (
                    <Marker
                        coordinate={fromCoords}
                        title="From Location"
                        pinColor="blue" 
                    />
                )}
                {toCoords && (
                    <Marker
                        coordinate={toCoords}
                        title="To Location"
                        pinColor="red" 
                    />
                )}

                {fromCoords && toCoords && (
                    <MapViewDirections
                        origin={fromCoords}
                        destination={toCoords}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={5}
                        strokeColor="hotpink"
                        optimizeWaypoints={true}
                        travelMode="DRIVING"
                        waypoints={[]} 
                    />
                )}
            </MapView>
            <TouchableOpacity
                style={styles.button}
                onPress={handleGetDirections}
            >
                <Text style={styles.buttonText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => setShouldNavigate(true)} 
            >
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    autocomplete: {
        container: {
            flex: 0,
            width: '100%',
            marginBottom: 10,
        },
        textInput: {
            height: 40,
            borderColor: '#ccc',
            borderWidth: 1,
            paddingHorizontal: 8,
        },
    },
    button: {
        backgroundColor: 'maroon',
        borderRadius: 5,
        width: '100%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    map: {
        flex: 1,
        width: '100%',
        height: 400,
    },
});
