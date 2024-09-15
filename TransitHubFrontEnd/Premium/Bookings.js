import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
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

export default function Bookings() {
    const [selectedMonth, setSelectedMonth] = useState('September');
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [bookings, setBookings] = useState([]);
    const [ownerID, setOwnerID] = useState(null); // Ensure ownerID state

    useEffect(() => {
        const fetchOwnerID = async () => {
            const storedOwnerID = await AsyncStorage.getItem('ownerID');
            if (storedOwnerID) {
                setOwnerID(storedOwnerID);
                fetchBookingsForMonth(storedOwnerID);
            }
        };
    
        fetchOwnerID();
    }, [selectedMonth]); // Fetch bookings when selectedMonth changes

    const fetchBookingsForMonth = async (ownerID) => {
        try {
            const month = monthMapping[selectedMonth];
            const year = new Date().getFullYear(); // Current year or set a specific year if needed
      
            const response = await fetch(`${config.BASE_URL}/bookingsOperator?month=${month}&year=${year}&ownerID=${ownerID}`);
            const data = await response.json();
      
            console.log('API Response:', data); // Debug log to see the response data
      
            if (Array.isArray(data) && data.length > 0) {
                setBookings(data); // Assuming you have a state variable for the bookings list
            } else {
                setBookings([]); // Set to empty array if no bookings
                console.log('No bookings found for this month.');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
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
            {/* Display filtered bookings */}
            {filteredBookings.length > 0 ? (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={item => item.bookingID.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.bookingItem}>
                            <View style={styles.details}>
                                <Text style={styles.name}>{item.operatorFirstName} {item.operatorLastName}</Text>
                                <Text style={styles.date}>{`${item.startDate.split('T')[0]} - ${item.endDate.split('T')[0]}`}</Text>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <View style={styles.noBookingsContainer}>
                    <Text style={styles.noBookingsText}>No bookings found for the selected month.</Text>
                </View>
            )}

            <Modal
                transparent={true}
                visible={isCalendarVisible}
                animationType="slide"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Calendar
                            markingType={'period'}
                            markedDates={markedDates}
                        />
                        <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                            <Text style={styles.closeModal}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
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
        marginBottom: 10,
        elevation: 1,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: 'gray',
    },
    noBookingsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noBookingsText: {
        fontSize: 16,
        color: 'gray',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeModal: {
        marginTop: 10,
        color: 'blue',
    },
});
