import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  Linking,
  Modal,
  Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { UserPack, WhatsAppLinkResponse } from '../api/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PacksScreen'>;

// Pack type definition
interface Pack {
  id: string;
  name: string;
  price: number;
  matches: number;
  requests: number | string;
  color: string;
  popular: boolean;
  description: string;
}

const PacksScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPack, setCurrentPack] = useState<UserPack | null>(null);
  const [availablePacks, setAvailablePacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<{
    packId: string;
    packName: string;
    price: number;
    qrCodeUrl?: string;
    whatsappUrl?: string;
  } | null>(null);

  // Fetch available packs
  const fetchAvailablePacks = async () => {
    try {
      const packs = await subscriptionsApi.getAvailablePacks();
      setAvailablePacks(packs);
    } catch (error) {
      console.error('Error fetching available packs:', error);
      // Fallback to hardcoded packs if API fails
      setAvailablePacks([
        {
          id: 'starter',
          name: 'Starter',
          price: 99,
          matches: 5,
          requests: 50,
          color: '#10b981',
          popular: false,
          description: 'Perfect for beginners'
        },
        {
          id: 'intermediate',
          name: 'Intermediate', 
          price: 199,
          matches: 8,
          requests: 100,
          color: '#3b82f6',
          popular: true,
          description: 'Most popular choice'
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 399,
          matches: 15,
          requests: 'Unlimited',
          color: '#8b5cf6',
          popular: false,
          description: 'For serious daters'
        }
      ]);
    }
  };

  // Fetch current user pack
  const fetchCurrentPack = async () => {
    if (!user?.id) return;
    
    try {
      const packData = await subscriptionsApi.getUserPack(user.id);
      setCurrentPack(packData);
    } catch (error) {
      console.error('Error fetching current pack:', error);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCurrentPack(), fetchAvailablePacks()]);
    setRefreshing(false);
  };

  // Handle pack purchase
  const handlePackPurchase = async (pack: Pack) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setPurchaseLoading(pack.id);
    
    try {
      // Get WhatsApp payment link
      const whatsappResponse = await subscriptionsApi.getWhatsAppLink();
      
      if (whatsappResponse.url) {
        // Open WhatsApp with payment link
        const canOpen = await Linking.canOpenURL(whatsappResponse.url);
        if (canOpen) {
          await Linking.openURL(whatsappResponse.url);
          Alert.alert(
            'Payment Instructions',
            `Please send ₹${pack.price} via WhatsApp for the ${pack.name} pack. Your pack will be activated after payment confirmation.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', 'Cannot open WhatsApp. Please install WhatsApp and try again.');
        }
      } else {
        // Fallback: Show QR code modal
        setQrData({
          packId: pack.id,
          packName: pack.name,
          price: pack.price,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=your-upi-id@okicici&pn=Snift&am=${pack.price}&cu=INR&tn=${pack.name} Pack Payment`)}`
        });
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  // Handle QR payment
  const handleQRPayment = (pack: Pack) => {
    setQrData({
      packId: pack.id,
      packName: pack.name,
      price: pack.price,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=your-upi-id@okicici&pn=Snift&am=${pack.price}&cu=INR&tn=${pack.name} Pack Payment`)}`
    });
    setShowQRModal(true);
  };

  // Close QR modal
  const closeQRModal = () => {
    setShowQRModal(false);
    setQrData(null);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentPack(), fetchAvailablePacks()]);
      setLoading(false);
    };
    
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading packs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subscription Packs</Text>
          <Text style={styles.headerSubtitle}>
            Choose the perfect plan for your dating journey
          </Text>
        </View>

        {/* Current Pack Status */}
        {currentPack && (
          <View style={styles.currentPackCard}>
            <View style={styles.currentPackHeader}>
              <Text style={styles.currentPackTitle}>Current Pack</Text>
              <View style={[styles.packBadge, { backgroundColor: currentPack.pack_id === 'pro' ? '#8b5cf6' : currentPack.pack_id === 'intermediate' ? '#3b82f6' : '#10b981' }]}>
                <Text style={styles.packBadgeText}>{currentPack.pack_name}</Text>
              </View>
            </View>
            
            <View style={styles.usageStats}>
              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Matches</Text>
                <Text style={styles.usageValue}>
                  {currentPack.matches_remaining} / {currentPack.matches_total}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(currentPack.matches_remaining / currentPack.matches_total) * 100}%`,
                        backgroundColor: currentPack.pack_id === 'pro' ? '#8b5cf6' : currentPack.pack_id === 'intermediate' ? '#3b82f6' : '#10b981'
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Requests</Text>
                <Text style={styles.usageValue}>
                  {currentPack.requests_remaining === -1 ? 'Unlimited' : `${currentPack.requests_remaining} / ${currentPack.requests_total}`}
                </Text>
                {currentPack.requests_remaining !== -1 && (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(currentPack.requests_remaining / currentPack.requests_total) * 100}%`,
                          backgroundColor: currentPack.pack_id === 'pro' ? '#8b5cf6' : currentPack.pack_id === 'intermediate' ? '#3b82f6' : '#10b981'
                        }
                      ]} 
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Available Packs */}
        <View style={styles.packsSection}>
          <Text style={styles.sectionTitle}>Available Packs</Text>
          
          {availablePacks.map((pack) => (
            <View key={pack.id} style={[styles.packCard, pack.popular && styles.popularPackCard]}>
              {pack.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.packHeader}>
                <Text style={[styles.packName, { color: pack.color }]}>{pack.name}</Text>
                <Text style={styles.packDescription}>{pack.description}</Text>
              </View>
              
              <View style={styles.packPrice}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.priceAmount}>{pack.price}</Text>
                <Text style={styles.priceUnit}>one-time</Text>
              </View>
              
              <View style={styles.packFeatures}>
                <View style={styles.featureItem}>
                  <Text style={[styles.featureIcon, { color: pack.color }]}>✓</Text>
                  <Text style={styles.featureText}>
                    <Text style={styles.featureBold}>{pack.matches}</Text> matches
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[styles.featureIcon, { color: pack.color }]}>✓</Text>
                  <Text style={styles.featureText}>
                    <Text style={styles.featureBold}>{pack.requests}</Text> connection requests
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[styles.featureIcon, { color: pack.color }]}>✓</Text>
                  <Text style={styles.featureText}>Premium support</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={[styles.featureIcon, { color: pack.color }]}>✓</Text>
                  <Text style={styles.featureText}>Advanced matching</Text>
                </View>
              </View>
              
              <View style={styles.packActions}>
                <TouchableOpacity
                  style={[styles.purchaseButton, { backgroundColor: pack.color }]}
                  onPress={() => handlePackPurchase(pack)}
                  disabled={purchaseLoading === pack.id}
                >
                  {purchaseLoading === pack.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.purchaseButtonText}>Purchase via WhatsApp</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.qrButton, { borderColor: pack.color }]}
                  onPress={() => handleQRPayment(pack)}
                >
                  <Text style={[styles.qrButtonText, { color: pack.color }]}>Pay via QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>Payment Information</Text>
          <Text style={styles.paymentInfoText}>
            • Payments are processed via WhatsApp or QR code{'\n'}
            • Your pack will be activated after payment confirmation{'\n'}
            • All payments are secure and encrypted{'\n'}
            • Contact support if you need assistance
          </Text>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeQRModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay via QR Code</Text>
              <TouchableOpacity onPress={closeQRModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {qrData && (
              <>
                <View style={styles.qrInfo}>
                  <Text style={styles.qrPackName}>{qrData.packName} Pack</Text>
                  <Text style={styles.qrPrice}>₹{qrData.price}</Text>
                </View>
                
                {qrData.qrCodeUrl && (
                  <View style={styles.qrCodeContainer}>
                    <Image
                      source={{ uri: qrData.qrCodeUrl }}
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                <Text style={styles.qrInstructions}>
                  Scan this QR code with your UPI app to complete the payment
                </Text>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={closeQRModal}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.secondaryText,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    lineHeight: 22,
  },
  currentPackCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  currentPackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  packBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  packBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  usageStats: {
    gap: 16,
  },
  usageItem: {
    gap: 8,
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondaryText,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.hairlineBorders,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  packsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primaryText,
    marginBottom: 16,
  },
  packCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    position: 'relative',
  },
  popularPackCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  packHeader: {
    marginBottom: 16,
  },
  packName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  packDescription: {
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  packPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  priceUnit: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginLeft: 8,
  },
  packFeatures: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.primaryText,
  },
  featureBold: {
    fontWeight: '600',
  },
  packActions: {
    gap: 12,
  },
  purchaseButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentInfo: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryText,
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.hairlineBorders,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.secondaryText,
  },
  qrInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrPackName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primaryText,
    marginBottom: 4,
  },
  qrPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  qrInstructions: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PacksScreen;
