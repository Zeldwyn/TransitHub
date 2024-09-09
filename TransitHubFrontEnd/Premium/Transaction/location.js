import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, SafeAreaView, Animated, TextInput, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function Location() {
    const navigation = useNavigation();
    const [fromCoords, setFromCoords] = useState(null);
    const [toCoords, setToCoords] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [packageHeightUnit, setPackageHeightUnit] = useState('');
    const [currentScreen, setCurrentScreen] = useState('map');
    const [transactionDetails, setTransactionDetails] = useState({
        fromLocation: "",
        toLocation: "",
        packageWidth: "",
        packageHeight: "",
        packageWeight: "",
        first2km: "",
        succeedingRate: "",
        expectedDistance: "",
        expectedFee: "",
        additionalInfo: ""
    });

    const calculateDistance = async () => {
        if (fromCoords && toCoords) {
            const origin = `${fromCoords.latitude},${fromCoords.longitude}`;
            const destination = `${toCoords.latitude},${toCoords.longitude}`;
            
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`);
                const result = await response.json();
                
                if (result.rows[0].elements[0].status === "OK") {
                    const distanceInMeters = result.rows[0].elements[0].distance.value;
                    const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                    
                    setTransactionDetails((prevDetails) => ({
                        ...prevDetails,
                        expectedDistance: distanceInKm,
                    }));
                }
            } catch (error) {
                console.error("Error fetching distance:", error);
            }
        }
    };

    useEffect(() => {
        if (fromCoords && toCoords) {
            calculateDistance();
        }
    }, [fromCoords, toCoords]);

    const markedDates = {
        '2024-09-20': {
            marked: true,
            dotColor: 'maroon',
            color: '#c17171',
            textColor: 'black',
        },
    };

    const handleDayPress = (day) => {
        setSelectedDate(formatDate(day.dateString));
        setCalendarVisible(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const [region, setRegion] = useState({
        latitude: 10.3157,
        longitude: 123.8854,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const renderMapScreen = () => (
        <>
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
            <View style={styles.mapControls}>
                <GooglePlacesAutocomplete
                    placeholder='Enter starting location'
                    onPress={(data, details = null) => {
                        if (details) {
                            const location = details.geometry.location;
                            console.log("Selected From Location:", location);
                            setFromCoords({
                                latitude: parseFloat(location.lat),
                                longitude: parseFloat(location.lng),
                            });
                        }
                    }}
                    fetchDetails={true}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'en',
                        bounds: {
                            southwest: { lat: 5.0, lng: 115.0 },
                            northeast: { lat: 21.0, lng: 127.0 },
                        }
                    }}
                    styles={styles.autocomplete}
                />
                <GooglePlacesAutocomplete
                    placeholder='Enter destination'
                    onPress={(data, details = null) => {
                        if (details) {
                            const location = details.geometry.location;
                            console.log("Selected To Location:", location);
                            setToCoords({
                                latitude: parseFloat(location.lat),
                                longitude: parseFloat(location.lng),
                            });
                        }
                    }}
                    fetchDetails={true}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'en',
                        bounds: {
                            southwest: { lat: 5.0, lng: 115.0 },
                            northeast: { lat: 21.0, lng: 127.0 },
                        }
                    }}
                    styles={styles.autocomplete}
                />
                <View style={styles.buttonContainer}>
                    <Image style={{width: 210,height: 100,marginBottom: -20, marginTop: -20}} source={require('../../assets/img/blackText.png')} />
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('details')}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );

    const renderDetailsScreen = () => (
        <ScrollView 
            style={styles.detailContainer} 
            contentContainerStyle={styles.detailContentContainer}
            showsVerticalScrollIndicator={false}
        >
            <Image style={styles.logoImage} source={require('../../assets/img/blackText.png')} />
            <Text style={styles.label}>Input Additional Details</Text>
            <View style={styles.detailsColumn}>
                <View style={styles.leftColumn}>
                    <Text style={styles.miniLabel}>Package Details:</Text>
                    <Text style={styles.microLabel}>Unit*</Text>
                    <TextInput style={styles.input} />
                    <Picker
                        selectedValue={packageHeightUnit}
                        style={styles.picker}
                        onValueChange={(heightunit) => setPackageHeightUnit(heightunit)}>
                        <Picker.Item label="in" value="inch" />
                        <Picker.Item label="cm" value="centimeter" />
                        <Picker.Item label="ft" value="feet" />
                    </Picker>
                    
                    <Text style={styles.microLabel}>Width*</Text>
                    <TextInput style={styles.input} />
                    <Text style={styles.microLabel}>Height*</Text>
                    <TextInput style={styles.input} />
                    <Text style={styles.microLabel}>Weight*</Text>
                    <TextInput style={styles.input} />
                </View>
                
                <View style={styles.rightColumn}>
                    <Text style={styles.miniLabel}>Rate:</Text>
                    <Text style={styles.microLabel}>First 2km:</Text>
                    <TextInput style={styles.input} />
                    <Text style={styles.microLabel}>Succeeding km:</Text>
                    <TextInput style={styles.input} />
                    <Text style={styles.microLabel}>Distance:</Text>
                    <TextInput value={transactionDetails.expectedDistance + ' km'} style={styles.input} />
                    <Text style={styles.microLabel}>Date:</Text>
                    <TextInput
                        value={selectedDate}
                        placeholder="Select a date"
                        style={styles.input}
                        editable={false}
                    />
                    <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.icons}>
                        <Ionicons name="calendar-outline" size={22} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.microLabel}>Client Name:</Text>
            <TextInput style={[styles.input, {textAlign: 'center'}]} />
            <Text style={styles.microLabel}>Additional Notes:</Text>
            <TextInput style={[styles.input, styles.additionalInfo]} multiline numberOfLines={3} />
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('map')}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('final')}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>    
        </ScrollView>
    );

    const renderFinalScreen = () => (
        <View style={[styles.detailContainer, {paddingTop: 40, alignItems: 'center'}]}>
            <Image style={styles.logoImage} source={require('../../assets/img/blackText.png')} />
            <Text style={styles.label}>Summary of Transaction</Text>
            <Text style={styles.microLabel}>Client Name:</Text>
            <TextInput style={styles.input} editable={false} />
            <Text style={styles.microLabel}>Date:</Text>
            <TextInput style={styles.input} editable={false}/>
            <Text style={styles.microLabel}>Distance:</Text>
            <TextInput style={styles.input} editable={false}/>
            <Text style={styles.microLabel}>Expected Duration:</Text>
            <TextInput style={styles.input} editable={false}/>
            <Text style={styles.microLabel}>Expected Fee:</Text>
            <TextInput style={styles.input} editable={false}/>
            <Text style={styles.microLabel} multiline numberOfLines={3}>Additional Notes:</Text>
            <TextInput style={[styles.input, styles.additionalInfo]} editable={false}/>
            <View style={[styles.buttonRow, {top: 720}]}>
                <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('details')}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OwnerDrawer')}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>  
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {currentScreen === 'map' && renderMapScreen()}
            {currentScreen === 'details' && renderDetailsScreen()}
            {currentScreen === 'final' && renderFinalScreen()}

            <Modal
                transparent={true}
                visible={isCalendarVisible}
                animationType="slide"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setCalendarVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                    <Calendar
                        onDayPress={handleDayPress}
                        markingType={'period'}
                        markedDates={markedDates}
                        theme={{
                            arrowColor: 'maroon',
                            textDayFontSize: 16,
                            textMonthFontSize: 16,
                        }}
                    />
                    </View>
                </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
},
autocomplete: {
    container: {
        flex: 0,
        width: '100%',
        marginTop: 5,
    },
    textInput: {
        height: 45,
        borderColor: '#ccc',
    },
},
button: {
    backgroundColor: '#8A252C',
    borderRadius: 5,
    width: '40%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
},
buttonText: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 15,
    textAlign: 'center',
},
mapControls: {
    height: 'auto',
    padding: 10,
    backgroundColor: '#E3B130',
},
buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
logoImage: {
    width: '80%',
    height: 100,
    marginBottom: -20,
},
map: {
    flex: 1,
    width: '100%',
    height: '80%',
},
icons: {
    position: 'absolute',
    top: '50%',
    right: 5,
    top: 310
},
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
},
detailContainer: {
    flex: 1,
    backgroundColor: '#E3B130',
    padding: 20,
    height: '100%'
},
detailContentContainer: {
    alignItems: 'center',
    paddingTop: 20,
    height: '100%'
},
detailsColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
},
leftColumn: {
    width: '45%',
},
rightColumn: {
    width: '45%',
},
picker: {
    width: '100%',
    height: 50,
    marginBottom: 10,
    position: 'absolute',
    top: 50
},
input: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    color: 'black',
},
additionalInfo: {
    height: 60,
    textAlignVertical: 'top',
},
miniLabel: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 5
},
microLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 5,
    marginLeft: 10
},
label: {
    color: 'black',
    fontSize: 22,
    fontWeight: '800',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20
},
buttonRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 700
},

});