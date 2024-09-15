import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, SafeAreaView, StatusBar } from 'react-native';
import io from 'socket.io-client';
import config from '../config';

const socket = io(`${config.BASE_URL}`);

export default function MessageOwner() {
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentName, setCurrentName] = useState('');
    const [currentOwner, setCurrentOwner] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [currentConversation, setCurrentConversation] = useState('');
    const [currentOperator, setCurrentOperator] = useState('');
    const [loader, setLoader] = useState(false);
    useEffect(() => {
        const getUserID = async () => {
            const id = await AsyncStorage.getItem('premiumUserID');
            const type = await AsyncStorage.getItem('userType');
            const convo = await AsyncStorage.getItem('ConversationID');
            const op = await AsyncStorage.getItem('OperatorID');
            const tempName = await AsyncStorage.getItem('CurrentName');
    
            console.log("Message Details ID : ", id);
            console.log("UserType: ", type);
            console.log("ConvoID: ", convo);
            console.log("OpID: ", op);
            console.log("Name: ", tempName);
    
            setUserType(type);
            setPID(id);
            setCurrentConversation(convo);
            setCurrentOperator(op);
            setCurrentName(tempName);  
        };
        getUserID();
    }, []);

    useEffect(() => {
        if (pID && currentOperator) {
            fetch(`${config.BASE_URL}/get-ConversationDetails`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    premiumUserID: parseInt(pID),
                    operatorID: currentOperator,
                }),
            })
            .then(response => response.json())
            .then(data => {
                setCurrentOwner(data.ownerID);
                console.log('Current Owner: ', data.ownerID);
            })
            .catch(error => {
                console.error('Error fetching existing messages:', error);
            });
        }
    }, [pID, currentOperator]);

    useEffect(() => {
        socket.on('message', (message) => {
            if (message.conversationID === currentConversation) {
            setMessages(prevMessages => [...prevMessages, message]);
            }
        });
        return () => {
            socket.off('message');
        };
    }, [currentConversation]);

    useEffect(() => {
        fetch(`${config.BASE_URL}/select-Messages`, {
        method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            'conversationID': currentConversation,
            })
        })
        .then(response => response.json())
        .then(data => {
            setMessages(data.results);
        })
        .catch(error => {
            console.error('Error fetching existing messages:', error);
        });
        setLoader(false);
    }, [currentConversation, loader])

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
        setLoader(true);
        setNewMessage(null);
    };

    const renderMessages = ({item,index})=>{
        if(userType == item.userType) {
        return (
            <View style={styles.sender} key={index}>          
            <Text style={{ fontSize: 18, color: "#000", }}> {item.text}</Text>
                <View style={styles.rightArrow}></View>
                <View style={styles.rightArrowOverlap}></View>         
            </View>
        )
        } else {
        return (
            <View style={styles.receiver} key={index}>
                <Text style={{ fontSize: 18, color: "#fff",justifyContent:"center" }} key={index}> {item.text}</Text>
                <View style={styles.leftArrow}></View>
                <View style={styles.leftArrowOverlap}></View>
            </View>
        )  
        }
    };
        
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.chatContainer}>
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'maroon', height: 60}}>
                <Text style={{alignSelf: 'center', fontSize: 24, color: 'white', fontWeight: '600'}}>{currentName}</Text>
            </View>
            <FlatList
                data={messages}
                renderItem={renderMessages}
                keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.sendContainer}> 
            <TextInput
                style={styles.inputMessage}
                value={newMessage}
                placeholder="Type your message..." 
                onChangeText={(text) => setNewMessage(text)}
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
                <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
            </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#FFC93F',
    marginTop: StatusBar.currentHeight
},
sendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
},
inputMessage: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 8,
},
sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'maroon',
    borderRadius: 5,
    marginBottom: 8,
},
sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
},
chatContainer: {
    flex: 1,
    height: "100%"
},
sender: {
    backgroundColor: "#dedede",
    padding:15,
    marginLeft: '45%',
    borderRadius: 3,
    marginTop: 5,
    marginRight: "5%",
    maxWidth: '50%',
    alignSelf: 'flex-end',
    borderRadius: 20,
},
receiver: {
    backgroundColor: "maroon",
    padding:15,
    borderRadius: 3,
    marginTop: 5,
    marginLeft: "5%",
    maxWidth: '50%',
    alignSelf: 'flex-start',
    borderRadius: 20,
},
rightArrow: {
    position: "absolute",
    backgroundColor: "#dedede",
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
    backgroundColor: "maroon",
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
