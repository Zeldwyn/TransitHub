import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, SafeAreaView, Animated, TextInput, Modal, TouchableWithoutFeedback, ScrollView, FlatList } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRegion, calculateDistance, computeDateRange, getFormattedDateRange, calculateFee} from './transacFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function Location() {
    const navigation = useNavigation();
    const [fromCoords, setFromCoords] = useState(null);
    const [toCoords, setToCoords] = useState(null);
    
    const [markedDates, setMarkedDates] = useState({});
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [isOperatorVisible, setIsOperatorVisible] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('map');
    const isButtonDisabled = !fromCoords || !toCoords;
    const [clientName, setClientName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [packageWeight, setPackageWeight] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [vehicleFee, setVehicleFee] = useState('');
    const [notes, setNotes] = useState('');
    const [first2km, setFirst2km] = useState('');
    const [succeedingKm, setSucceedingKm] = useState('');
    const [expectedDistance, setExpectedDistance] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expectedDuration, setExpectedDuration] = useState('');
    const [expectedFee, setExpectedFee] = useState('');
    const { region, setRegion } = useRegion();
    const [formattedDateRange, setFormattedDateRange] = useState('');
    const [availableOperators, setAvailableOperators] = useState([]);
    const [pID, setPID] = useState('');
    const [selectedOperatorID, setSelectedOperatorID] = useState(null);
    const [selectedOperatorDetails, setSelectedOperatorDetails] = useState('');

    useEffect(() => {
        const getUserID = async () => {
          const id = await AsyncStorage.getItem('premiumUserID');
          console.log("ID: ", id);
          setPID(id);
        };
        getUserID();
    }, []);

    const handleSubmit = async () => {
        try {
            const transactionData = {
                toCoords: {
                    latitude: toCoords.latitude,
                    longitude: toCoords.longitude,
                },
                fromCoords: {
                    latitude: fromCoords.latitude,
                    longitude: fromCoords.longitude,
                },        
                clientName, itemDescription, packageWeight, itemQuantity,
                vehicleFee, notes, first2km, succeedingKm,
                expectedDistance, startDate,  endDate, expectedDuration, expectedFee,               
            };
            const transactionResponse = await fetch(`${config.BASE_URL}/add-Transaction`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });
    
            const transactionResult = await transactionResponse.json();
            console.log('Response from Express backend (Transaction):', transactionResult);
    
            if (transactionResponse.status === 200 && transactionResult.status === 1) {
                console.log('TransactionID:', transactionResult.transactionID);
    
                const bookingData = {
                    finalFee: expectedFee,
                    transactionID: transactionResult.transactionID,
                    operatorID: selectedOperatorID,
                    premiumUserID: parseInt(pID),
                };
    
                const bookingResponse = await fetch(`${config.BASE_URL}/add-Booking`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                });
    
                const bookingResult = await bookingResponse.json();
                console.log('Response from Express backend (Booking):', bookingResult);
    
                if (bookingResponse.status === 200) {
                    console.log('Booking added successfully');
                    navigation.navigate('OwnerDrawer');
                } else {
                    console.error('Failed to add booking:', bookingResult.err);
                }
            } else {
                console.error('Failed to add transaction:', transactionResult.err);
            }
        } catch (error) {
            console.error('Error posting data to Express backend:', error);
        }
    };
    
    useEffect(() => {
        if (isOperatorVisible === true) {
          fetch(`${config.BASE_URL}/available-Operators`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                premiumUserID: parseInt(pID),
                startDate: startDate,
                endDate: endDate
            }),
          })
          .then(response => {
            if (!response.ok) {
              console.error(`Error: ${response.status} - ${response.statusText}`);
              throw new Error('Network response was not ok in operator');
            }
            return response.json();
          })
          .then(data => {
            console.log(data)
            setAvailableOperators(data);
          })
          .catch(error => {
            console.error('Error fetching data from Express backend:', error);
          });
        }
      }, [isOperatorVisible]);
      
    
    const handleCalculate = async () => {
        await calculateDistance(fromCoords, toCoords, setExpectedDistance, setExpectedDuration, GOOGLE_MAPS_API_KEY);
    };

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
            const { firstDate, lastDate } = computeDateRange(updatedMarkedDates);
            setStartDate(firstDate);
            setEndDate(lastDate);
    
            console.log('start date: ', firstDate);
            console.log('end date: ', lastDate);
    
            return updatedMarkedDates;
        });
    };

    useEffect(() => {
        if (fromCoords && toCoords) {
            handleCalculate();
        }
    }, [fromCoords, toCoords]);

    useEffect(() => {
        const formattedRange = getFormattedDateRange(markedDates);
        setFormattedDateRange(formattedRange);
    }, [markedDates]);
    

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
            {/* <Text>Pickup:</Text> */}
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
                            southwest: { lat: 8.0, lng: 123.0 }, // Southwest corner
                            northeast: { lat: 11.5, lng: 125.0 }, // Northeast corner
                        },
                        strictBounds: true,
                    }}
                    styles={styles.autocomplete}   
                    debounce={500} 
                    enablePoweredByContainer={false}
                />
                
                {/* <Text>Delivery Address:</Text> */}
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
                            southwest: { lat: 8.0, lng: 123.0 }, // Southwest corner
                            northeast: { lat: 11.5, lng: 125.0 }, // Northeast corner
                        },
                    }}
                    styles={styles.autocomplete}  
                    debounce={500}
                    enablePoweredByContainer={false}
                />
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
                    <Text style={styles.microLabel}>Client Name:</Text>
                        <TextInput style={[styles.input, {textAlign: 'left'}]} onChangeText={text => setClientName(text)} value={clientName}/>
                    <Text style={styles.microLabel}>Item Description</Text>
                        <TextInput style={[styles.input, {textAlign: 'left'}]} onChangeText={text => setItemDescription(text)} value={itemDescription}/>        
                    <Text style={styles.microLabel}>Weight</Text>
                        <TextInput style={styles.input} keyboardType='number-pad' onChangeText={text => setPackageWeight(text)} value={packageWeight}/>
                    <Text style={styles.microLabel}>Quantity</Text>
                        <TextInput style={styles.input} keyboardType='number-pad' onChangeText={text => setItemQuantity(text)} value={itemQuantity}/>
                    <Text style={styles.microLabel} >Vehicle Fee: </Text>
                        <TextInput style={styles.input} keyboardType='number-pad' onChangeText={text => setVehicleFee(text)} value={vehicleFee}/>                 
                </View>
    
                <View style={styles.rightColumn}>
                    <Text style={styles.microLabel} >Notes</Text>
                        <TextInput style={[styles.input, {textAlign: 'left'}]} onChangeText={text => setNotes(text)} value={notes}/>      
                    <Text style={styles.microLabel}>First 2km:</Text>      
                        <TextInput style={styles.input} keyboardType='number-pad' onChangeText={text => setFirst2km(text)} value={first2km}/>
                    <Text style={styles.microLabel}>Succeeding km:</Text>
                        <TextInput style={styles.input} keyboardType='number-pad' onChangeText={text => setSucceedingKm(text)} value={succeedingKm}/>      
                    <Text style={styles.microLabel}>Distance:</Text>
                        <TextInput value={expectedDistance + ' km'} style={styles.input} editable={false}/>
                    <Text style={styles.microLabel}>Date:</Text>
                        <TextInput
                            value={formattedDateRange}
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
                <TouchableOpacity style={styles.operatorIcon} onPress={() => {setIsOperatorVisible(true);}}>
                    <FontAwesome5 name="user-alt" size={40} color="white" /> 
                </TouchableOpacity>
                <View style={{width: '70%'}}>
                    <Text style={styles.microLabel}>Choose Operator:</Text>
                    <TextInput style={[styles.input, {width:'100%', textAlign: 'left'}]} placeholder='Operator Name' editable={false} value={selectedOperatorDetails}/>
                </View>         
            </View>  
    
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('map')}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => {
                        const fee = calculateFee(first2km, succeedingKm, expectedDistance, vehicleFee);
                        setExpectedFee(fee);
                        setCurrentScreen('final');      
                    }}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>    
        </ScrollView>
    );
            

    const renderFinalScreen = () => (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.detailContainer}>
                <Image style={styles.logoImage} source={require('../../assets/img/blackText.png')} />
                <Text style={styles.label}>Summary of Transaction</Text>
                
                <Text style={styles.microLabel}>Client Name:</Text>
                <TextInput style={styles.input} value={clientName} editable={false} />
                
                <Text style={styles.microLabel}>Date:</Text>
                <TextInput style={styles.input} editable={false} value={formattedDateRange}/>
                
                <Text style={styles.microLabel}>Distance:</Text>
                <TextInput style={styles.input} value={expectedDistance} editable={false} />
                
                <Text style={styles.microLabel}>Expected Duration:</Text>
                <TextInput style={styles.input} editable={false} value={expectedDuration + ' mins'}/>
                
                <Text style={styles.microLabel}>Expected Fee:</Text>
                <TextInput style={styles.input} editable={false} value={`₱${expectedFee.toString()}`}/>
                
                <Text style={styles.microLabel}>Additional Notes:</Text>
                <TextInput style={[styles.input, styles.additionalInfo]} editable={false} value={notes}/>
            
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('details')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>  
            </View>
        </ScrollView>
    );
    
    const renderChooseOperator = ({ item }) => {
        const isSelected = item.operatorID === selectedOperatorID;

        return (
            <TouchableOpacity style={[
                styles.itemContainer,
                isSelected && { borderBottomColor: 'green' }]}
                onPress={() => {setSelectedOperatorID(item.operatorID); setSelectedOperatorDetails(item.firstName + ' ' + item.lastName);}}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                </View> 
            </TouchableOpacity>
        );
    };

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
            <Modal
                transparent={true}
                visible={isOperatorVisible}
                animationType="slide"
                onRequestClose={() => setIsOperatorVisible(false)}
            >
                <View style={styles.operatorModal}>
                    <Text style={[styles.miniLabel, {marginTop: 0}]}>Available Operators on</Text>
                    <Text style={styles.label}>{formattedDateRange}</Text>
                    <View style={styles.operatorModalContent}>
                        <FlatList
                            data={availableOperators}
                            renderItem={renderChooseOperator}
                            keyExtractor={(item) => item.operatorID.toString()}
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.button} onPress={() => setIsOperatorVisible(false)}>
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setIsOperatorVisible(false)}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>  
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
        activeRow: {
            backgroundColor: '#E3B130', // Change this to the color you want when active
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
        zIndex: 5,
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
        width: '100%',
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
    },
    detailContentContainer: {
        flexGrow: 1, 
        alignItems: 'center',
        paddingTop: 20,
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
        textAlign: 'center',
    },
    inputText: {
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
        marginLeft: 5,
    },
    microLabel: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 5,
        marginLeft: 10,
    },
    label: {
        color: 'black',
        fontSize: 22,
        fontWeight: '800',
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 10,
        marginBottom:20,
    },
    operatorModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        margin: 10,
    },
    operatorModalContent: {
        height: '70%',
        width: '100%',
    },
    email: {
        fontSize: 12.5,
    },
    name: {
        fontSize: 15,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'maroon',
        backgroundColor: '#fff',
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        elevation: 3,
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
});
