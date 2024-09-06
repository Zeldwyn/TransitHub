import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import io from 'socket.io-client';

const socket = io('http://192.168.1.9:8080');

export default function MessageOperator() {
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentName, setCurrentName] = useState('');
    const [currentOperator, setCurrentOperator] = useState('');
    const [currentOwner, setCurrentOwner] = useState('');
    const [currentConversation, setCurrentConversation] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef(null);

    useEffect(() => {
        const getUserID = async () => {
            const id = await AsyncStorage.getItem('premiumUserID');
            const type = await AsyncStorage.getItem('userType');
            console.log("ID: ", id);
            console.log("UserType in Message: ", type);
            setUserType(type);
            setPID(id);
        };
        getUserID();
    }, []);

    useEffect(() => {
        if (pID && userType) {
            fetch(`http://192.168.1.9:8080/get-Messages`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'premiumUserID': parseInt(pID),
                    'userType': userType
                })
            })
            .then(response => response.json())
            .then(data => {
                setMessages(data.results);
            })
            .catch(error => {
                console.error('Error fetching existing messages:', error);
            });
            fetch(`http://192.168.1.9:8080/get-ConversationIDOP`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'premiumUserID': parseInt(pID),
                })
            })
            .then(response => response.json())
            .then(data => {
                setCurrentConversation(data.conversationID);
                setCurrentOperator(data.operatorID);
                setCurrentOwner(data.ownerID);
            })
            .catch(error => {
                console.error('Error fetching existing messages:', error);
            })
        }
    }, [userType, pID]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
            flatListRef.current?.scrollToEnd({ animated: true });
        });
    
        return () => {
            socket.off('message');
        };
    }, [newMessage]);

    const sendMessage = () => {
        if (newMessage.trim() === '') {
            return;
        }
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        const message = {
            conversationID: currentConversation,
            ownerID: currentOwner,
            operatorID: currentOperator,
            userType: userType,
            text: newMessage,
            created_at: formattedDate,
        };
        socket.emit('send_message', message);
        setMessages(prevMessages => [...prevMessages, message]); 
        setNewMessage('');
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const renderMessages = ({ item }) => {
        if (userType === item.userType) {
            return (
                <View style={styles.sender}>
                    <Text style={{ fontSize: 16, color: "#fff", }}> {item.text}</Text>
                    <View style={styles.rightArrow}></View>
                    <View style={styles.rightArrowOverlap}></View>
                </View>
            );
        } else {
            return (
                <View style={styles.receiver}>
                    <Text style={{ fontSize: 16, color: "#000", justifyContent: "center" }}> {item.text}</Text>
                    <View style={styles.leftArrow}></View>
                    <View style={styles.leftArrowOverlap}></View>
                </View>
            );
        }
    };

    return (
        <View style={styles.chatModal}>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessages}
                keyExtractor={(item, index) => index.toString()}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={newMessage}
                    placeholder="Type your message..."
                    onChangeText={(text) => setNewMessage(text)}
                />
                <TouchableOpacity style={styles.searchButton} onPress={sendMessage}>
                    <Text style={styles.searchButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 3,
},
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
},
searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 8,
},
searchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'maroon',
    borderRadius: 5,
    marginBottom: 8,
},
searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
},
itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 3,
},
textContainer: {
    flex: 1,
},
name: {
    fontSize: 18,
    fontWeight: 'bold',
},
message: {
    fontSize: 14,
    color: '#666',
},
chatModal: {
    flex: 1,
},
sender: {
    backgroundColor: "maroon",
    padding: 10,
    marginLeft: '45%',
    borderRadius: 5,
    marginTop: 5,
    marginRight: "5%",
    maxWidth: '50%',
    alignSelf: 'flex-end',
    borderRadius: 20,
},
receiver: {
    backgroundColor: "#dedede",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginLeft: "5%",
    maxWidth: '50%',
    alignSelf: 'flex-start',
    borderRadius: 20,
},
rightArrow: {
    position: "absolute",
    backgroundColor: "maroon",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomLeftRadius: 25,
    right: -10
},
rightArrowOverlap: {
    position: "absolute",
    backgroundColor: "#eeeeee",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomLeftRadius: 18,
    right: -20
},
leftArrow: {
    position: "absolute",
    backgroundColor: "#dedede",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -10
},
leftArrowOverlap: {
    position: "absolute",
    backgroundColor: "#eeeeee",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20
},
});
