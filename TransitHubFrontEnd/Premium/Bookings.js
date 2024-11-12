import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; 
import { Calendar } from 'react-native-calendars';
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const monthMapping = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12
};

export default function Bookings({ navigation }) { 
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const [selectedMonth, setSelectedMonth] = useState(currentMonth); 
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [bookings, setBookings] = useState([]);
    const [ownerID, setOwnerID] = useState(null); 
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isStatusModalVisible, setStatusModalVisible] = useState(false);
    const [isCompletedModalVisible, setCompletedModalVisible] = useState(false);

    useEffect(() => {
        const fetchOwnerID = async () => {
            const storedOwnerID = await AsyncStorage.getItem('ownerID');
            if (storedOwnerID) {
                setOwnerID(storedOwnerID);
                fetchBookingsForMonth(storedOwnerID);
            }
        };
    
        fetchOwnerID();
    }, [selectedMonth]); 

    const fetchBookingsForMonth = async (ownerID) => {
        try {
            const month = monthMapping[selectedMonth];
            const year = new Date().getFullYear(); 
      
            const response = await fetch(`${config.BASE_URL}/bookingsOperator?month=${month}&year=${year}&ownerID=${ownerID}`);
            const data = await response.json();
      
            if (Array.isArray(data) && data.length > 0) {
                setBookings(data);
            } else {
                setBookings([]); 
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const openModal = (booking) => {
        setSelectedBooking(booking);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedBooking(null);
    };

    const handleTrackOperator = () => {
        if (selectedBooking) {
            console.log('Selected Booking:', selectedBooking);
            setModalVisible(false);
    
            if (selectedBooking.status === "Pending") {
                setStatusModalVisible(true);
            } else if (selectedBooking.status === "Ongoing") {
                navigation.navigate('TrackOperator', { 
                    operatorID: selectedBooking.operatorID,
                    deliveryId: selectedBooking.deliveryId
                });
            } else if (selectedBooking.status === "Completed") {
                setCompletedModalVisible(true); 
            }
        }
    };
    
    const filteredBookings = bookings.filter(booking => {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
    
        const bookingMonthStart = startDate.getMonth() + 1;
        const bookingMonthEnd = endDate.getMonth() + 1;
        const bookingYearStart = startDate.getFullYear();
        const bookingYearEnd = endDate.getFullYear();
    
        const isWithinMonth = (
            (bookingMonthStart === monthMapping[selectedMonth] && bookingYearStart === new Date().getFullYear()) || 
            (bookingMonthEnd === monthMapping[selectedMonth] && bookingYearEnd === new Date().getFullYear()) ||
            (bookingMonthStart < monthMapping[selectedMonth] && bookingMonthEnd > monthMapping[selectedMonth] && bookingYearStart === new Date().getFullYear())
        );
    
        return isWithinMonth;
    });

    const markedDates = {};
    bookings.forEach((booking) => {
        let currentDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);

        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            markedDates[dateString] = {
                marked: true,
                dotColor: 'blue',
                startingDay: dateString === booking.startDate.split('T')[0],
                endingDay: dateString === booking.endDate.split('T')[0],
                color: 'lightblue',
                textColor: 'black',
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Picker
                    selectedValue={selectedMonth}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                >
                    {Object.keys(monthMapping).map(month => (
                        <Picker.Item key={month} label={month} value={month} />
                    ))}
                </Picker>
                <View style={styles.icons}>
                    <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                        <Ionicons name="calendar-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.searchIcon} onPress={() => setSearchVisible(!isSearchVisible)}>
                        <Ionicons name="search-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {isSearchVisible && (
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search by name..."
                    value={searchText}
                    onChangeText={(text) => setSearchText(text)}
                />
            )}
            
            {filteredBookings.length > 0 ? (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={item => item.bookingID.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => openModal(item)}>
                            <View style={styles.bookingItem}>
                                <View style={styles.details}>
                                    <Text style={styles.name}>{item.operatorFirstName} {item.operatorLastName}</Text>
                                    <Text style={styles.date}>{`${item.startDate.split('T')[0]} - ${item.endDate.split('T')[0]}`}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View style={styles.noBookingsContainer}>
                    <Text style={styles.noBookingsText}>No bookings found for the selected month.</Text>
                </View>
            )}
            {selectedBooking && (
                <Modal
                    transparent={true}
                    visible={isModalVisible}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Operator Details</Text>
                            <Text>Operator Name: {selectedBooking.operatorFirstName} {selectedBooking.operatorLastName}</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={handleTrackOperator} style={styles.trackButton}>
                                    <Text style={styles.buttonText}>Check location</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            <Modal
                transparent={true}
                visible={isStatusModalVisible}
                animationType="slide"
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Booking Status</Text>
                        <Text>This booking is currently pending. Please wait until it is confirmed.</Text>
                        <TouchableOpacity onPress={() => setStatusModalVisible(false)} style={styles.closeButton2}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* New modal for completed bookings */}
            <Modal
                transparent={true}
                visible={isCompletedModalVisible}
                animationType="slide"
                onRequestClose={() => setCompletedModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Booking Status</Text>
                        <Text>This booking is completed.</Text>
                        <TouchableOpacity onPress={() => setCompletedModalVisible(false)} style={styles.closeButton2}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                visible={isCalendarVisible}
                animationType="slide"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Calendar
                            current={new Date().toISOString().split('T')[0]}
                            markedDates={markedDates}
                            onDayPress={(day) => {
                                setCalendarVisible(false);
                            }}
                        />
                        <Button title="Close" onPress={() => setCalendarVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFC93F',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 10,
        borderColor: "maroon",
        borderWidth: 2,
    },
    picker: {
        flex: 1,
        height: 40,
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginLeft: 15,
    },
    searchBar: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    bookingItem: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        flexDirection: 'row',
        borderColor: "maroon",
        borderWidth: 2,
    },
    details: {
        flex: 1,
        borderColor: "maroon",
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: 'gray',
    },
    noBookingsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    noBookingsText: {
        fontSize: 18,
        color: 'gray',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    trackButton: {
        backgroundColor: '#FFC93F',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginRight: 5,
    },
    closeButton: {
        backgroundColor: 'maroon',
        borderRadius: 5,
        padding: 10,
        flex: 1,
    },
    closeButton2: {
        backgroundColor: 'maroon',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    closeModal: {
        marginTop: 20,
        color: '#007BFF',
        textAlign: 'center',
    },
});
