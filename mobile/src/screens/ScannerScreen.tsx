import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { uploadLabel, pollScanResult } from '../services/api';
import { LabelScan } from '../types';
import { theme } from '../constants/theme';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [scanning, setScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<LabelScan | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleTakePicture = async () => {
    if (scanning || !cameraRef.current) return;

    try {
      setScanning(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        setShowCamera(false);
        await handleImageScan(photo.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to take picture');
      setScanning(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageScan(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleImageScan = async (imageUri: string) => {
    try {
      setAnalyzing(true);
      setScanResult(null);

      // Upload image
      const scan = await uploadLabel(imageUri);

      // Poll for result
      const completedScan = await pollScanResult(scan.id);

      setScanResult(completedScan);

      if (completedScan.status === 'FAILED') {
        Alert.alert(
          'Scan Failed',
          completedScan.errorMessage || 'Failed to analyze label'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to scan label');
    } finally {
      setScanning(false);
      setAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
    setShowCamera(true);
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to scan labels');
        return;
      }
    }
    setShowCamera(true);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.permissionText}>Loading...</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraControls}>
            <View style={styles.cameraFrame} />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePicture}
                disabled={scanning}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <View style={{ width: 80 }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (analyzing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.analyzingText}>Analyzing label...</Text>
        <Text style={styles.analyzingSubtext}>This may take a few moments</Text>
      </View>
    );
  }

  if (scanResult) {
    return (
      <ScrollView style={styles.resultContainer}>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>Scan Result</Text>

          {scanResult.extractedData && (
            <>
              {scanResult.extractedData.productName && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Product Name:</Text>
                  <Text style={styles.resultValue}>
                    {scanResult.extractedData.productName}
                  </Text>
                </View>
              )}

              {scanResult.extractedData.brandName && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Brand:</Text>
                  <Text style={styles.resultValue}>
                    {scanResult.extractedData.brandName}
                  </Text>
                </View>
              )}

              {scanResult.extractedData.ingredients && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Ingredients:</Text>
                  <Text style={styles.resultValue}>
                    {scanResult.extractedData.ingredients.join(', ')}
                  </Text>
                </View>
              )}

              {scanResult.rawText && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Raw OCR Text:</Text>
                  <Text style={styles.resultValueSmall}>{scanResult.rawText}</Text>
                </View>
              )}
            </>
          )}

          <TouchableOpacity style={styles.newScanButton} onPress={handleNewScan}>
            <Text style={styles.newScanButtonText}>Scan Another Label</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeEmoji}>📷</Text>
        <Text style={styles.welcomeTitle}>Label Scanner</Text>
        <Text style={styles.welcomeText}>
          Scan product labels to get instant health insights
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleOpenCamera}
        >
          <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
          <Text style={styles.secondaryButtonText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl,
  },
  cameraFrame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: '80%',
    height: '30%',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  cancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
  },
  permissionText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  permissionSubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  analyzingText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  analyzingSubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  resultContent: {
    padding: theme.spacing.lg,
  },
  resultTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  resultSection: {
    marginBottom: theme.spacing.lg,
  },
  resultLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  resultValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  resultValueSmall: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  newScanButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  newScanButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  welcomeEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  welcomeTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
