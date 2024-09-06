import React, { useState } from "react";
import { View, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function ChooseDate() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

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
        setModalVisible(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose Date</Text>
            <View style={styles.calendar}>
                <Calendar
                    onDayPress={day => {
                        console.log('Selected Day: ', day.dateString);
                        handleDayPress(day);
                    }}
                    markingType={'period'}
                    markedDates={markedDates}
                    theme={{
                        arrowColor: 'maroon',
                        textDayFontSize: 20,
                        textMonthFontSize: 20,
                    }}
                />
            </View>  
            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Confirm Selected Date:</Text>
                        <Text style={styles.selectDate}>{selectedDate}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.confirmButton} 
                                onPress={() => {
                                    console.log('Confirmed Date:', selectedDate);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                               {/* <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                            <Text style={styles.closeModal}>Close</Text>
                        </TouchableOpacity> */}
                        </View>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 30, 
        marginTop: 150,
    },
    calendar: {
        justifyContent: 'center',
        width: '100%', 
        height: 1000,
        marginTop: -280, 
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        height: '30%',
        width: '70%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalText: {
        fontSize: 18,
        marginTop: 30,
        marginBottom: 20,
        alignSelf: 'center',
    },
    selectDate: {
        fontSize: 18,
        marginBottom: 20,
        alignSelf: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    closeButton: {
        backgroundColor: 'maroon',
        borderRadius: 5,
        padding: 10,
        width: '48%',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: 'green',
        borderRadius: 5,
        padding: 10,
        width: '48%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
