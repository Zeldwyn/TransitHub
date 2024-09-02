import React, { useState } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; 
import { Calendar } from 'react-native-calendars';

export default function Bookings() {
    const [selectedMonth, setSelectedMonth] = useState('September');
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredBookings = bookings.filter(
        booking =>
            (new Date(booking.startDate).toLocaleString('default', { month: 'long' }) === selectedMonth || 
             new Date(booking.endDate).toLocaleString('default', { month: 'long' }) === selectedMonth) &&
            booking.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const markedDates = {};
    bookings.forEach((booking) => {
        let currentDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);

        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            markedDates[dateString] = {
                marked: true,
                dotColor: 'blue',
                startingDay: dateString === booking.startDate,
                endingDay: dateString === booking.endDate,
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
                    <Picker.Item label="January" value="January" />
                    <Picker.Item label="February" value="February" />
                    <Picker.Item label="March" value="March" />
                    <Picker.Item label="April" value="April" />
                    <Picker.Item label="May" value="May" />
                    <Picker.Item label="June" value="June" />
                    <Picker.Item label="July" value="July" />
                    <Picker.Item label="August" value="August" />
                    <Picker.Item label="September" value="September" />
                    <Picker.Item label="October" value="October" />
                    <Picker.Item label="November" value="November" />
                    <Picker.Item label="December" value="December" />
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
            {/* Check if filteredBookings is not empty */}
            {filteredBookings.length > 0 ? (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.bookingItem}>
                            <View style={styles.details}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.date}>{`${item.startDate} - ${item.endDate}`}</Text>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <View style={styles.noBookingsContainer}>
                    <Text style={styles.noBookingsText}>No bookings found for the selected month.</Text>
                </View>
            )}

            {/* Calendar Modal */}
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

const bookings = [              //temporary 
    {
        id: '1',
        name: 'Miles Morales',
        startDate: '2024-09-20',
        endDate: '2024-09-23',
    },
    {
        id: '2',
        name: 'Peter Parker',
        startDate: '2024-09-24',
        endDate: '2024-09-26',
    },
    {
        id: '3',
        name: 'Gwen Stacy',
        startDate: '2024-09-27',
        endDate: '2024-09-30',
    },
    {
        id: '4',
        name: 'Pavitr Prabhakar',
        startDate: '2024-10-01',
        endDate: '2024-10-03',
    },
];

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
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff',
    },
    bookingItem: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 16,
        color: '#555',
    },
    noBookingsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noBookingsText: {
        fontSize: 18,
        color: '#555',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    closeModal: {
        marginTop: 20,
        color: '#007BFF',
        fontSize: 16,
    },
});
