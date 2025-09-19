import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GiftedChat, IMessage, User, InputToolbar, Send, Bubble, Time } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { chatApi } from '../api/chat';
import { Message } from '../api/types';
import LoadingSpinner from '../components/LoadingSpinner';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatThreadScreen'>;

const ChatThreadScreen: React.FC<Props> = ({ route, navigation }) => {
  const { chatId, userName } = route.params;
  const { user } = useAuth();
  const { socket, emit, on, off, isConnected } = useSocket(user?.id || null);
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `chat_${chatId}`;

  // Convert API message to Gifted Chat message
  const convertToGiftedMessage = useCallback((apiMessage: Message): IMessage => {
    return {
      _id: apiMessage.id,
      text: apiMessage.content,
      createdAt: new Date(apiMessage.created_at),
      user: {
        _id: apiMessage.sender_id,
        name: apiMessage.sender_id === user?.id ? user.name : userName,
      },
    };
  }, [user?.id, user?.name, userName]);

  // Convert Gifted Chat message to API message
  const convertToApiMessage = useCallback((giftedMessage: IMessage): Message => {
    return {
      id: giftedMessage._id,
      sender_id: giftedMessage.user._id,
      content: giftedMessage.text,
      created_at: giftedMessage.createdAt.toISOString(),
    };
  }, []);

  // Load chat history from API
  const loadChatHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cachedMessages = await AsyncStorage.getItem(storageKey);
      if (cachedMessages) {
        const parsedMessages = JSON.parse(cachedMessages);
        setMessages(parsedMessages.map(convertToGiftedMessage));
      }

      // Fetch from API
      const apiMessages = await chatApi.getChatHistory(user.id, chatId);
      const giftedMessages = apiMessages.map(convertToGiftedMessage);
      
      setMessages(giftedMessages);
      
      // Cache the messages
      await AsyncStorage.setItem(storageKey, JSON.stringify(apiMessages));
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, chatId, convertToGiftedMessage, storageKey]);

  // Save messages to cache
  const saveMessagesToCache = useCallback(async (newMessages: IMessage[]) => {
    try {
      const apiMessages = newMessages.map(convertToApiMessage);
      await AsyncStorage.setItem(storageKey, JSON.stringify(apiMessages));
    } catch (error) {
      console.error('Error saving messages to cache:', error);
    }
  }, [convertToApiMessage, storageKey]);

  // Send message
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user?.id || isSending) return;

    const message = newMessages[0];
    if (!message) return;

    try {
      setIsSending(true);
      
      // Add message optimistically
      setMessages(previousMessages => {
        const updated = GiftedChat.append(previousMessages, newMessages);
        saveMessagesToCache(updated);
        return updated;
      });

      // Send via API
      const response = await chatApi.sendMessage({
        fromUserId: user.id,
        toUserId: chatId,
        content: message.text,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Emit via Socket.IO for real-time delivery
      emit('new_message', {
        id: message._id,
        sender_id: user.id,
        content: message.text,
        created_at: message.createdAt.toISOString(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      // Remove the optimistic message on error
      setMessages(previousMessages => {
        const updated = previousMessages.filter(m => m._id !== message._id);
        saveMessagesToCache(updated);
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  }, [user?.id, chatId, isSending, emit, saveMessagesToCache]);

  // Handle typing indicator
  const onInputTextChanged = useCallback((text: string) => {
    if (!isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    emit('typing', { userId: user?.id, isTyping: true });

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      emit('typing', { userId: user?.id, isTyping: false });
    }, 1000);
  }, [isConnected, emit, user?.id]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Only add message if it's not from current user (to avoid duplicates)
      if (message.sender_id !== user?.id) {
        const giftedMessage = convertToGiftedMessage(message);
        setMessages(previousMessages => {
          const updated = GiftedChat.append(previousMessages, [giftedMessage]);
          saveMessagesToCache(updated);
          return updated;
        });
      }
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessageAck = (data: { messageId: string; status: string }) => {
      console.log('Message acknowledged:', data);
    };

    const handleSeen = (data: { userId: string; messageId: string }) => {
      console.log('Message seen:', data);
    };

    // Set up event listeners
    on('new_message', handleNewMessage);
    on('typing', handleTyping);
    on('message:ack', handleMessageAck);
    on('seen', handleSeen);

    // Cleanup
    return () => {
      off('new_message', handleNewMessage);
      off('typing', handleTyping);
      off('message:ack', handleMessageAck);
      off('seen', handleSeen);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, user?.id, on, off, convertToGiftedMessage, saveMessagesToCache]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Custom render functions for Gifted Chat
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#FFFFFF',
          borderBottomLeftRadius: 4,
        },
        right: {
          backgroundColor: '#8A4B2A',
          borderBottomRightRadius: 4,
        },
      }}
      textStyle={{
        left: {
          color: '#1F2937',
        },
        right: {
          color: '#FFFFFF',
        },
      }}
    />
  );

  const renderTime = (props: any) => (
    <Time
      {...props}
      timeTextStyle={{
        left: {
          color: '#6B7280',
        },
        right: {
          color: '#F3F4F6',
        },
      }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      textInputStyle={styles.textInput}
      onTextChanged={onInputTextChanged}
    />
  );

  const renderSend = (props: any) => (
    <Send
      {...props}
      containerStyle={styles.sendContainer}
      disabled={isSending}
    >
      <View style={[styles.sendButton, isSending && styles.sendButtonDisabled]}>
        <Text style={styles.sendButtonText}>Send</Text>
      </View>
    </Send>
  );

  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{userName} is typing...</Text>
        </View>
      );
    }
    return null;
  };

  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderConnectionStatus()}
      
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user?.id || '',
          name: user?.name || '',
        }}
        renderBubble={renderBubble}
        renderTime={renderTime}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderFooter={renderFooter}
        placeholder="Type a message..."
        alwaysShowSend
        scrollToBottom
        infiniteScroll
        minInputToolbarHeight={60}
        listViewProps={{
          style: styles.messagesList,
        }}
        textInputProps={{
          style: styles.textInput,
          multiline: true,
          maxLength: 1000,
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4CF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  connectionStatus: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  connectionText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesList: {
    backgroundColor: '#EDE4CF',
  },
  inputToolbar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6DFD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    maxHeight: 100,
    minHeight: 40,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#8A4B2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E6DFD4',
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default ChatThreadScreen;
