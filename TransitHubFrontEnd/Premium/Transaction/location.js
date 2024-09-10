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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function Location() {
    const navigation = useNavigation();
    const [fromCoords, setFromCoords] = useState(null);
    const [toCoords, setToCoords] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [packageHeightUnit, setPackageHeightUnit] = useState('');
    const [currentScreen, setCurrentScreen] = useState('map');
    const isButtonDisabled = !fromCoords || !toCoords;
    const [transactionDetails, setTransactionDetails] = useState({
        fromLocation: "",
        toLocation: "",
        packageWeight: "",
        first2km: "",
        succeedingRate: "",
        expectedDistance: "",
        expectedFee: "",
        additionalInfo: "",
        expectedDuration: "" // Add this field for duration
    });

    const calculateDistance = async () => {
        if (fromCoords && toCoords) {
            const origin = `${fromCoords.latitude},${fromCoords.longitude}`;
            const destination = `${toCoords.latitude},${toCoords.longitude}`;
            
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                
                if (result.rows[0].elements[0].status === "OK") {
                    const distanceInMeters = result.rows[0].elements[0].distance.value;
                    const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                    const durationInSeconds = result.rows[0].elements[0].duration.value;
                    const durationInMinutes = Math.ceil(durationInSeconds / 60); // Convert seconds to minutes
                    
                    setTransactionDetails((prevDetails) => ({
                        ...prevDetails,
                        expectedDistance: distanceInKm,
                        expectedDuration: durationInMinutes,
                    }));
                }
            } catch (error) {
                console.error("Error fetching distance and duration:", error);
            }
        }
    };

    useEffect(() => {
        if (fromCoords && toCoords) {
            calculateDistance();
        }
    }, [fromCoords, toCoords]);


    const handleDayPress = (day) => {
        const date = day.dateString;
        setMarkedDates((prevMarkedDates) => {
            const updatedMarkedDates = { ...prevMarkedDates };
            if (updatedMarkedDates[date]) {
                delete updatedMarkedDates[date];
            } else {
                updatedMarkedDates[date] = {
                    selected: true,
                    marked: true,
                    selectedColor: 'maroon',
                };
            }
            return updatedMarkedDates;
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2); 
        return `${month}/${day}/${year}`;
    };
    const getFormattedDateRange = () => {
        const dates = Object.keys(markedDates);
        if (dates.length === 0) return ''; 
        const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
        const firstDate = formatDate(sortedDates[0]);
        const lastDate = formatDate(sortedDates[sortedDates.length - 1]);
        return sortedDates.length === 1 ? firstDate : `${firstDate} - ${lastDate}`;
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
            <Text>Pickup:</Text>
                <GooglePlacesAutocomplete
                    placeholder='Enter pickup location'
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
                    debounce={500}
                />
                
                <Text>Delivery Address:</Text>
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
                    debounce={500}
                />
                {/* Don't remove, for some reason if walaon ni d ma click ang suggested place */}
                <Text
                    style={styles.inputText}
                />
                {/* Dont remove above ^^ */}
                <View style={styles.buttonContainer}>
                    <Image style={{width: 210,height: 100,marginBottom: -20, marginTop: -20}} source={require('../../assets/img/blackText.png')} />
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('details')} >
                        {/* disabled={isButtonDisabled} */}
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
                    {/* <Text style={styles.miniLabel}>Package Details:</Text> */}
                    <Text style={styles.microLabel}>Client Name:</Text>
                     <TextInput style={[styles.input, {textAlign: 'center'}]} />
                    <Text style={styles.microLabel}>Item Description</Text>
                    <TextInput style={styles.input} />        
                    <Text style={styles.microLabel}>Weight</Text>
                    <TextInput style={styles.input} keyboardType='number-pad'/>
                    <Text style={styles.microLabel}>Quantity</Text>
                    <TextInput style={styles.input} keyboardType='number-pad'/>
                    <Text style={styles.microLabel} >Vehicle Fee: </Text>
                    <TextInput style={styles.input} keyboardType='number-pad'/>                 
                </View>
    
                <View style={styles.rightColumn}>
                    <Text style={styles.microLabel} >Notes</Text>
                        <TextInput style={[styles.input, {textAlign: 'left'}]}/>      
                    <Text style={styles.microLabel}>First 2km:</Text>      
                        <TextInput style={styles.input} keyboardType='number-pad'/>
                    <Text style={styles.microLabel}>Succeeding km:</Text>
                        <TextInput style={styles.input} keyboardType='number-pad'/>      
                    <Text style={styles.microLabel}>Distance:</Text>
                        <TextInput value={transactionDetails.expectedDistance + ' km'} style={styles.input} editable={false}/>
                    <Text style={styles.microLabel}>Date:</Text>
                        <TextInput
                            value={getFormattedDateRange()}
                            style={[styles.input, {textAlign: 'left'}]}
                            placeholder="Select a date"
                            editable={false}
                        />
                    <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.icons}>
                        <Ionicons name="calendar-outline" size={22} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
                
            <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10}}>
                <TouchableOpacity style={styles.operatorIcon}>
                    <FontAwesome5 name="user-alt" size={40} color="white" /> 
                </TouchableOpacity>
                <View style={{width: '70%'}}>
                    <Text style={styles.microLabel}>Choose Operator:</Text>
                    <TextInput style={[styles.input, {width:'100%', textAlign: 'left'}]} placeholder='Operator Name' editable={false}/>
                </View>         
            </View>  
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
            <TextInput style={styles.input} value={transactionDetails.clientName} editable={false} />
            
            <Text style={styles.microLabel}>Date:</Text>
            <TextInput style={styles.input} editable={false} />
            
            <Text style={styles.microLabel}>Distance:</Text>
            <TextInput style={styles.input} value={`${transactionDetails.expectedDistance}`} editable={false} />
            
            <Text style={styles.microLabel}>Expected Duration:</Text>
            <TextInput style={styles.input} editable={false} value={transactionDetails.expectedDuration +  'mins'}/>

            <Text style={styles.microLabel}>Expected Fee:</Text>
            <TextInput style={styles.input} editable={false}/>
            <Text style={styles.microLabel}>Additional Notes:</Text>
            <TextInput style={[styles.input, styles.additionalInfo]} value={transactionDetails.additionalInfo} editable={false} />
            
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
    
    const renderChooseOperator = () => {
        
    }

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
                        markingType={'multi-dot'}
                        markedDates={markedDates} 
                        theme={{
                            arrowColor: 'maroon',
                            textDayFontSize: 16,
                            textMonthFontSize: 16,
                        }}
                    />
                    
                    <TouchableOpacity style={styles.button} onPress={() => setCalendarVisible(false)}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </TouchableOpacity>
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
        zIndex: 1,
    },
    textInput: {
        height: 45,
        borderColor: '#ccc',
        zIndex: 1,
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
    zIndex: 1,
},
buttonText: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 15,
    textAlign: 'center',
},
mapControls: {
    zIndex: 1,

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
    zIndex: 0,
flex: 1,
    width: '100%',
    height: '80%',
},
icons: {
    position: 'absolute',
        right: 5,
    top: 358

},
operatorIcon: {
    borderColor: 'white', 
    borderWidth: 1, 
    borderRadius: 5,
    width: 70, 
    height: 70, 
    alignItems: 'center', 
    justifyContent: 'center',
    left: 20,
    top: 5
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
    minHeight: '100%'
},
detailsColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
},
leftColumn: {
    width: '48%',
},
rightColumn: {
    width: '48%',
},
input: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    color: 'black',
    textAlign: 'center'
},
inputText: {
    width: '100%',
    height: 40,
    backgroundColor: '#E3B130',
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
    top: 700,
},
    
});
