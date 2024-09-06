import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";

export default function TransactionDetails() {
    const navigation = useNavigation();
    const [date, setDate] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [shouldNavigate, setShouldNavigate] = useState(false); 

    useEffect(() => {
        if (shouldNavigate) {
            setShouldNavigate(false);
            navigation.navigate('ChooseDate');
        }
    }, [shouldNavigate, navigation]);

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
            <Text>From: </Text>
            <TextInput
                value={fromLocation}
                onChangeText={setFromLocation}
            />
            <Text>To: </Text>
            <TextInput
                value={toLocation}
                onChangeText={setToLocation}
            />
            <Text>Duration: </Text>
            <TextInput/>
            <View style={{alignItems: 'center', flexDirection: "row"}}>
                <Text>Date: </Text>
                <TextInput
                    value={date}
                    placeholder="Select a date"
                    style={{width: '50%', textAlign: 'center'}} 
                    editable={false}
                />
                <View style={styles.icons}>
                        <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                            <Ionicons name="calendar-outline" size={24} color="black" />
                        </TouchableOpacity>
                </View>
            </View>
            
            <Text>Additional Info: </Text>
            <TextInput multiline={true} numberOfLines={4}/>
           
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => setShouldNavigate(true)} 
            >
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>  

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
                        onDayPress={day => {
                            console.log('Selected Day: ', day.dateString);
                            handleDayPress(day);
                        }}
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
        </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 3,
},
button: {
    backgroundColor: 'maroon',
    borderRadius: 5,
    width: 300,
    height: 40,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 10,
},
    buttonText: {
    color: '#fff',
    fontSize: 16,
},
icons: {
    flexDirection: 'row',
    alignItems: 'center',
},
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
    width: '75%',
    height: '50%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
},
modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
},
closeModal: {
    marginTop: 0,
    color: '#007BFF',
    fontSize: 16,
},
});
