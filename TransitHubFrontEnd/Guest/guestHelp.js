import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, TextInput } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GuestHelp() {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [feedback, setFeedback] = useState('');
  const [rate, setRate] = useState('');

  const handleFeedbackSubmit = () => {
    console.log(rate,feedback)
    fetch('http://192.168.1.8:8080/add-Feedback', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "feedbackMessage": feedback,
            "rate": rate,
          }),
        })
        .then(response => response.json())
          .then(data => {
            if (data.status === 'Success') {
              console.log('Feedback submitted successfully');
            } else {
              console.log('Failed to submit feedback');
            }
            setRate('');
            setFeedback('');
          })
          .catch(error => {
            console.error('Error:', error);
          });
      };

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <Image
          style={{
            ...styles.logo,
            width: windowWidth * 0.7,
            height: windowHeight * 0.25,
          }}
          source={require('../assets/img/feedback.png')}
        />
      </View>
      <View style={styles.contentContainer}>
      <Text style={styles.text}>Please rate your experience</Text>
      <View style={styles.emoji}>
          <TouchableOpacity onPress={() => setRate(5)}>
            <MaterialCommunityIcons name="emoticon-excited-outline" size={45} color={rate === 5 ? 'maroon' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRate(4)}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={45} color={rate === 4 ? 'maroon' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRate(3)}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={45} color={rate === 3 ? 'maroon' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRate(2)}>
            <MaterialCommunityIcons name="emoticon-cry-outline" size={45} color={rate === 2 ? 'maroon' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRate(1)}>
            <MaterialCommunityIcons name="emoticon-angry-outline" size={45} color={rate === 1 ? 'maroon' : 'black'} />
          </TouchableOpacity>
        </View>
      <Text style={styles.text}>How can we help you?</Text>
      <TextInput
            style={styles.textInput}
            placeholder="Enter your feedback here"
            placeholderTextColor="#888"
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleFeedbackSubmit}>
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  emoji: {
    color: 'maroon',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    padding: 10,
    height: 'auto',
    margin: 14,
    marginTop: 170,
    backgroundColor: '#fff',
    color: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'maroon',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
