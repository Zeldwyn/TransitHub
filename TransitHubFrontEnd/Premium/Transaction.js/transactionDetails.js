import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function TransactionDetails() {
    const navigation = useNavigation();
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [shouldNavigate, setShouldNavigate] = useState(false); 

    useEffect(() => {
        if (shouldNavigate) {
            setShouldNavigate(false);
            navigation.navigate('ChooseDate');
        }
    }, [shouldNavigate, navigation]);

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
            <Text>Additional Info: </Text>
            <TextInput/>
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
});
