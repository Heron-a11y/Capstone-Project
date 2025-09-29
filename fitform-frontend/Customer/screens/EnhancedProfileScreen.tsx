import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  date_of_birth: string;
  gender: string;
  profile_image: string | null;
}

export default function EnhancedProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    date_of_birth: '',
    gender: '',
    profile_image: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      if (response.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare profile data, filtering out empty strings and invalid values
      const profileData = {
        name: profile.name?.trim() || '',
        email: profile.email?.trim() || '',
        phone: profile.phone?.trim() || null,
        address: profile.address?.trim() || null,
        city: profile.city?.trim() || null,
        state: profile.state?.trim() || null,
        zip_code: profile.zip_code?.trim() || null,
        country: profile.country?.trim() || null,
        date_of_birth: profile.date_of_birth?.trim() || null,
        gender: profile.gender && ['male', 'female'].includes(profile.gender) ? profile.gender : null,
      };

      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Update local state immediately for UI feedback
        setProfile(prev => ({ ...prev, profile_image: asset.uri }));
        
        // Upload image to server
        try {
          const response = await apiService.uploadProfileImage(asset.uri);
          if (response.success) {
            // Update with server response (includes proper image URL)
            setProfile(prev => ({ 
              ...prev, 
              profile_image: response.data.user.profile_image 
            }));
            // Refresh user data in AuthContext to update header
            await refreshUser();
            Alert.alert('Success', 'Profile image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to upload image');
            // Revert local state on failure
            setProfile(prev => ({ ...prev, profile_image: null }));
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', 'Failed to upload image');
          // Revert local state on failure
          setProfile(prev => ({ ...prev, profile_image: null }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteImage = async () => {
    try {
      await apiService.deleteProfileImage();
      setProfile(prev => ({ ...prev, profile_image: null }));
      Alert.alert('Success', 'Profile image deleted');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.confirm_password,
      });

      if (response.success) {
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        Alert.alert('Error', response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Profile Image Section */}
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
          <Image
            source={
              profile.profile_image
                ? { uri: profile.profile_image }
                : require('../../assets/images/priva-logo.jpg')
            }
            style={styles.profileImage}
          />
          <View style={styles.imageOverlay}>
            <Ionicons name="camera" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.imageText}>Tap to change photo</Text>
        {profile.profile_image && (
          <TouchableOpacity onPress={handleDeleteImage} style={styles.deleteImageButton}>
            <Text style={styles.deleteImageText}>Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.address}
            onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={profile.city}
              onChangeText={(text) => setProfile(prev => ({ ...prev, city: text }))}
              placeholder="City"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={profile.state}
              onChangeText={(text) => setProfile(prev => ({ ...prev, state: text }))}
              placeholder="State"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={styles.input}
              value={profile.zip_code}
              onChangeText={(text) => setProfile(prev => ({ ...prev, zip_code: text }))}
              placeholder="ZIP Code"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={profile.country}
              onChangeText={(text) => setProfile(prev => ({ ...prev, country: text }))}
              placeholder="Country"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={profile.date_of_birth}
              onChangeText={(text) => setProfile(prev => ({ ...prev, date_of_birth: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>
           <View style={[styles.inputGroup, styles.halfWidth]}>
             <Text style={styles.label}>Gender</Text>
             <TextInput
               style={styles.input}
               value={profile.gender}
               onChangeText={(text) => setProfile(prev => ({ ...prev, gender: text.toLowerCase() }))}
               placeholder="Enter male or female"
               autoCapitalize="none"
             />
           </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={() => setShowPasswordModal(true)}
        >
          <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.current_password}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, current_password: text }))}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.new_password}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, new_password: text }))}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirm_password}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirm_password: text }))}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, saving && styles.disabledButton]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  logoutButton: {
    padding: 8,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  deleteImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.error,
    borderRadius: 20,
  },
  deleteImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  changePasswordText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
