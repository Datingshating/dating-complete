import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { adminApi } from '../api/adminApi';
import { AdminUser } from '../api/types';
import { theme } from '../styles/theme';

const AdminScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'users'>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.is_admin && token) {
      loadData();
    }
  }, [activeTab, user?.is_admin, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const data = await adminApi.getPendingRegistrations();
        setPendingUsers(data);
      } else {
        const data = await adminApi.getAllUsers();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = async (userId: string, userName: string) => {
    Alert.alert(
      'Approve User',
      `Are you sure you want to approve ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setActionLoading(userId);
            try {
              const response = await adminApi.approveUser({ userId });
              if (response.ok) {
                Alert.alert(
                  'Success', 
                  'User approved successfully! Credentials have been generated and are ready to send via WhatsApp.',
                  [{ text: 'OK' }]
                );
                await loadData(); // Refresh the list
              } else {
                Alert.alert('Error', response.error || 'Failed to approve user');
              }
            } catch (error) {
              console.error('Error approving user:', error);
              Alert.alert('Error', 'Failed to approve user');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // Note: Reject functionality not implemented in backend yet
  // For now, we only support approval

  const renderUserItem = ({ item }: { item: AdminUser }) => {
    const isActionLoading = actionLoading === item.id;
    const age = item.date_of_birth 
      ? new Date().getFullYear() - new Date(item.date_of_birth).getFullYear()
      : null;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userDetails}>
              {item.gender} • {age ? `${age} years` : 'Age unknown'}
            </Text>
            {item.instagram_handle && (
              <Text style={styles.instagramHandle}>@{item.instagram_handle}</Text>
            )}
          </View>
          <View style={styles.userStatus}>
            <Text style={[
              styles.statusBadge,
              { backgroundColor: activeTab === 'pending' ? '#FEF3C7' : '#D1FAE5' }
            ]}>
              {activeTab === 'pending' ? 'Pending' : 'Approved'}
            </Text>
          </View>
        </View>

        {item.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}

        <View style={styles.interestsContainer}>
          {[item.interest_1, item.interest_2, item.interest_3]
            .filter(interest => interest && interest.trim())
            .map((interest, index) => (
              <View key={index} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
        </View>

        {activeTab === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item.id, item.name)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.approveButtonText}>Approve & Generate Credentials</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {activeTab === 'pending' 
          ? 'No pending registrations' 
          : 'No users found'
        }
      </Text>
    </View>
  );

  if (!user?.is_admin) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>
            You don't have admin privileges to access this screen.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'pending' && styles.activeTab
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'pending' && styles.activeTabText
          ]}>
            Pending ({pendingUsers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'users' && styles.activeTab
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'users' && styles.activeTabText
          ]}>
            All Users ({allUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors['brand-accent']} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'pending' ? pendingUsers : allUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors['brand-accent']]}
              tintColor={theme.colors['brand-accent']}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors['page-background'],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors['card-paper'],
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[1],
    ...theme.shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors['brand-accent'],
  },
  tabText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors['secondary-text'],
  },
  activeTabText: {
    color: theme.colors['card-paper'],
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  userCard: {
    backgroundColor: theme.colors['card-paper'],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors['hairline-borders'],
    ...theme.shadows.sm,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors['primary-text'],
    marginBottom: theme.spacing[1],
  },
  userDetails: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors['secondary-text'],
    marginBottom: theme.spacing[0.5],
  },
  instagramHandle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors['teal-accent'],
    fontWeight: '500',
  },
  userStatus: {
    marginLeft: theme.spacing[2],
  },
  statusBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    fontSize: theme.fontSizes.xs,
    fontWeight: '500',
    color: theme.colors['primary-text'],
  },
  bio: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors['secondary-text'],
    lineHeight: 20,
    marginBottom: theme.spacing[3],
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing[3],
  },
  interestChip: {
    backgroundColor: theme.colors['interest-pill-bg'],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing[2],
    marginBottom: theme.spacing[1],
  },
  interestText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors['secondary-text'],
    fontWeight: '500',
  },
  actionButtons: {
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: theme.colors['teal-accent'],
  },
  approveButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing[2],
    fontSize: theme.fontSizes.sm,
    color: theme.colors['secondary-text'],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[16],
  },
  emptyStateText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors['secondary-text'],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
  },
  errorText: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: '600',
    color: theme.colors['error-color'],
    marginBottom: theme.spacing[2],
  },
  errorSubtext: {
    fontSize: theme.fontSizes.base,
    color: theme.colors['secondary-text'],
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminScreen;
