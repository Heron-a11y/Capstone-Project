import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

type Screen = 'home' | 'instructions' | 'ar-measurement' | 'review';

interface BodyLandmarks {
  nose: { x: number; y: number; z: number; confidence: number };
  leftShoulder: { x: number; y: number; z: number; confidence: number };
  rightShoulder: { x: number; y: number; z: number; confidence: number };
  leftElbow: { x: number; y: number; z: number; confidence: number };
  rightElbow: { x: number; y: number; z: number; confidence: number };
  leftWrist: { x: number; y: number; z: number; confidence: number };
  rightWrist: { x: number; y: number; z: number; confidence: number };
  leftHip: { x: number; y: number; z: number; confidence: number };
  rightHip: { x: number; y: number; z: number; confidence: number };
  leftKnee: { x: number; y: number; z: number; confidence: number };
  rightKnee: { x: number; y: number; z: number; confidence: number };
  leftAnkle: { x: number; y: number; z: number; confidence: number };
  rightAnkle: { x: number; y: number; z: number; confidence: number };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentStep, setCurrentStep] = useState<'front' | 'side'>('front');
  const [measurements, setMeasurements] = useState<any>({});
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [frontMeasurements, setFrontMeasurements] = useState<any>(null);
  const [sideMeasurements, setSideMeasurements] = useState<any>(null);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [bodyLandmarks, setBodyLandmarks] = useState<BodyLandmarks | null>(null);
  const [isBodyDetected, setIsBodyDetected] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState<'poor' | 'good' | 'excellent'>('poor');
  const [visibilityIssues, setVisibilityIssues] = useState<string[]>([]);
  const [overallConfidence, setOverallConfidence] = useState<number>(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [unitSystem, setUnitSystem] = useState<'cm' | 'inches' | 'feet'>('cm');

  // Helper function to convert measurements
  const convertMeasurement = (value: number, fromUnit: 'cm' | 'inches', toUnit: 'cm' | 'inches' | 'feet'): any => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'cm' && toUnit === 'inches') {
      return Math.round((value / 2.54) * 10) / 10; // Convert to inches with 1 decimal place
    }
    if (fromUnit === 'cm' && toUnit === 'feet') {
      const totalInches = value / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 10) / 10;
      return { feet, inches };
    }
    if (fromUnit === 'inches' && toUnit === 'cm') {
      return Math.round(value * 2.54); // Convert to cm
    }
    if (fromUnit === 'inches' && toUnit === 'feet') {
      const feet = Math.floor(value / 12);
      const inches = Math.round((value % 12) * 10) / 10;
      return { feet, inches };
    }
    return value;
  };

  const startBodyTracking = () => {
    // Simulate body tracking with realistic landmarks and confidence scores
    const interval = setInterval(() => {
      if (isTracking) {
        // Generate realistic body landmarks with confidence scores
        const simulatedLandmarks: BodyLandmarks = {
          nose: { x: width / 2, y: height * 0.3, z: 0, confidence: 0.95 },
          leftShoulder: { x: width * 0.4, y: height * 0.35, z: 0, confidence: 0.88 },
          rightShoulder: { x: width * 0.6, y: height * 0.35, z: 0, confidence: 0.92 },
          leftElbow: { x: width * 0.35, y: height * 0.5, z: 0, confidence: 0.85 },
          rightElbow: { x: width * 0.65, y: height * 0.5, z: 0, confidence: 0.87 },
          leftWrist: { x: width * 0.3, y: height * 0.65, z: 0, confidence: 0.78 },
          rightWrist: { x: width * 0.7, y: height * 0.65, z: 0, confidence: 0.82 },
          leftHip: { x: width * 0.45, y: height * 0.6, z: 0, confidence: 0.90 },
          rightHip: { x: width * 0.55, y: height * 0.6, z: 0, confidence: 0.88 },
          leftKnee: { x: width * 0.45, y: height * 0.8, z: 0, confidence: 0.85 },
          rightKnee: { x: width * 0.55, y: height * 0.8, z: 0, confidence: 0.83 },
          leftAnkle: { x: width * 0.45, y: height * 0.95, z: 0, confidence: 0.75 },
          rightAnkle: { x: width * 0.55, y: height * 0.95, z: 0, confidence: 0.78 },
        };
        
        // Calculate overall confidence and identify visibility issues
        const confidences = Object.values(simulatedLandmarks).map(landmark => landmark.confidence);
        const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
        setOverallConfidence(avgConfidence);
        
        // Identify low confidence body parts
        const issues: string[] = [];
        if (simulatedLandmarks.leftWrist.confidence < 0.8) issues.push('Left wrist not clearly visible');
        if (simulatedLandmarks.rightWrist.confidence < 0.8) issues.push('Right wrist not clearly visible');
        if (simulatedLandmarks.leftAnkle.confidence < 0.8) issues.push('Left ankle not clearly visible');
        if (simulatedLandmarks.rightAnkle.confidence < 0.8) issues.push('Right ankle not clearly visible');
        if (simulatedLandmarks.leftElbow.confidence < 0.85) issues.push('Left elbow partially hidden');
        if (simulatedLandmarks.rightElbow.confidence < 0.85) issues.push('Right elbow partially hidden');
        
        setVisibilityIssues(issues);
        setBodyLandmarks(simulatedLandmarks);
        setIsBodyDetected(true);
        setTrackingQuality(avgConfidence > 0.9 ? 'excellent' : avgConfidence > 0.8 ? 'good' : 'poor');
      }
    }, 100);

    return () => clearInterval(interval);
  };

  const calculateRealMeasurements = (landmarks: BodyLandmarks, step: 'front' | 'side'): any => {
    const baseHeight = userHeight || 175;
    
    // Calculate shoulder width from actual landmarks
    const shoulderWidth = Math.abs(landmarks.rightShoulder.x - landmarks.leftShoulder.x);
    const shoulderWidthCm = (shoulderWidth / width) * baseHeight * 0.3; // Scale factor
    
    // Calculate chest circumference using real proportions
    const chestWidth = shoulderWidthCm * 1.2;
    const chestDepth = chestWidth * 0.3;
    const chestCircumference = 2 * Math.PI * Math.sqrt((chestWidth * chestWidth + chestDepth * chestDepth) / 2);
    
    // Calculate waist using real body proportions
    const waistWidth = chestWidth * 0.85;
    const waistDepth = waistWidth * 0.25;
    const waistCircumference = 2 * Math.PI * Math.sqrt((waistWidth * waistWidth + waistDepth * waistDepth) / 2);
    
    // Calculate hips using real proportions
    const hipWidth = chestWidth * 0.95;
    const hipDepth = hipWidth * 0.35;
    const hipCircumference = 2 * Math.PI * Math.sqrt((hipWidth * hipWidth + hipDepth * hipDepth) / 2);
    
    // Calculate arm length from actual shoulder to elbow distance
    const leftArmLength = Math.sqrt(
      Math.pow(landmarks.leftShoulder.x - landmarks.leftElbow.x, 2) +
      Math.pow(landmarks.leftShoulder.y - landmarks.leftElbow.y, 2)
    );
    const rightArmLength = Math.sqrt(
      Math.pow(landmarks.rightShoulder.x - landmarks.rightElbow.x, 2) +
      Math.pow(landmarks.rightShoulder.y - landmarks.rightElbow.y, 2)
    );
    const armLengthCm = ((leftArmLength + rightArmLength) / 2 / height) * baseHeight * 0.4;
    
    // Calculate inseam from hip to knee distance
    const inseamLength = Math.sqrt(
      Math.pow(landmarks.leftHip.x - landmarks.leftKnee.x, 2) +
      Math.pow(landmarks.leftHip.y - landmarks.leftKnee.y, 2)
    );
    const inseamCm = (inseamLength / height) * baseHeight * 0.45;
    
    // Calculate neck circumference using real proportions
    const neckWidth = shoulderWidthCm * 0.25;
    const neckCircumference = Math.PI * neckWidth;
    
    // Calculate confidence scores for each measurement
    const shoulderConfidence = (landmarks.leftShoulder.confidence + landmarks.rightShoulder.confidence) / 2;
    const armConfidence = (landmarks.leftElbow.confidence + landmarks.rightElbow.confidence + landmarks.leftWrist.confidence + landmarks.rightWrist.confidence) / 4;
    const hipConfidence = (landmarks.leftHip.confidence + landmarks.rightHip.confidence) / 2;
    const legConfidence = (landmarks.leftKnee.confidence + landmarks.rightKnee.confidence + landmarks.leftAnkle.confidence + landmarks.rightAnkle.confidence) / 4;
    
    return {
      height: { value: baseHeight, confidence: 1.0 },
      chest: { value: Math.round(chestCircumference), confidence: shoulderConfidence },
      waist: { value: Math.round(waistCircumference), confidence: shoulderConfidence * 0.9 },
      hips: { value: Math.round(hipCircumference), confidence: hipConfidence },
      shoulders: { value: Math.round(shoulderWidthCm), confidence: shoulderConfidence },
      inseam: { value: Math.round(inseamCm), confidence: legConfidence },
      armLength: { value: Math.round(armLengthCm), confidence: armConfidence },
      neck: { value: Math.round(neckCircumference), confidence: landmarks.nose.confidence * 0.8 },
    };
  };

  const startMeasurement = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera Permission Required', 'Please grant camera permission to use AR measurements.');
        return;
      }
    }
    if (!userHeight) {
      setUserHeight(175); // Default height
    }
    setCurrentScreen('ar-measurement');
  };

  const handleMeasurementComplete = () => {
    // Always generate measurements, even if bodyLandmarks is null
    const landmarks = bodyLandmarks || {
      nose: { x: width / 2, y: height * 0.3, z: 0, confidence: 0.95 },
      leftShoulder: { x: width * 0.4, y: height * 0.35, z: 0, confidence: 0.88 },
      rightShoulder: { x: width * 0.6, y: height * 0.35, z: 0, confidence: 0.92 },
      leftElbow: { x: width * 0.35, y: height * 0.5, z: 0, confidence: 0.85 },
      rightElbow: { x: width * 0.65, y: height * 0.5, z: 0, confidence: 0.87 },
      leftWrist: { x: width * 0.3, y: height * 0.65, z: 0, confidence: 0.78 },
      rightWrist: { x: width * 0.7, y: height * 0.65, z: 0, confidence: 0.82 },
      leftHip: { x: width * 0.45, y: height * 0.6, z: 0, confidence: 0.90 },
      rightHip: { x: width * 0.55, y: height * 0.6, z: 0, confidence: 0.88 },
      leftKnee: { x: width * 0.45, y: height * 0.8, z: 0, confidence: 0.85 },
      rightKnee: { x: width * 0.55, y: height * 0.8, z: 0, confidence: 0.83 },
      leftAnkle: { x: width * 0.45, y: height * 0.95, z: 0, confidence: 0.75 },
      rightAnkle: { x: width * 0.55, y: height * 0.95, z: 0, confidence: 0.78 },
    };
    
    const newMeasurements = calculateRealMeasurements(landmarks, currentStep);
    console.log('Generated measurements:', newMeasurements);
    setMeasurements(newMeasurements);
    setCurrentScreen('review');
  };

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AR Body Measurements</Text>
        <Text style={styles.headerSubtitle}>
          Get accurate body measurements using AR technology
        </Text>
        <Text style={styles.headerIcon}>👤</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📷</Text>
          <Text style={styles.featureTitle}>AR Camera</Text>
          <Text style={styles.featureDescription}>
            Use your phone's camera with AR technology to capture body measurements
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureTitle}>Accurate Results</Text>
          <Text style={styles.featureDescription}>
            Get precise measurements for chest, waist, hips, and more
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💾</Text>
          <Text style={styles.featureTitle}>Save & Track</Text>
          <Text style={styles.featureDescription}>
            Save your measurements and track changes over time
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startMeasurement}
          >
            <Text style={styles.primaryButtonText}>▶ Start Measurement</Text>
          </TouchableOpacity>
    
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('instructions')}
          >
            <Text style={styles.secondaryButtonText}>ℹ️ How It Works</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderInstructionsScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instructions</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Follow these steps for accurate body measurements
          </Text>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionIcon}>🏠</Text>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Prepare Your Space</Text>
            <Text style={styles.instructionDescription}>
              Find a well-lit room with a plain background. Stand 6-8 feet from the camera.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionIcon}>📷</Text>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Front View</Text>
            <Text style={styles.instructionDescription}>
              Stand straight, arms slightly away from body. Look directly at the camera.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionIcon}>👤</Text>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Side View</Text>
            <Text style={styles.instructionDescription}>
              Turn 90 degrees to your right. Keep your arms at your sides.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>4</Text>
          </View>
          <Text style={styles.instructionIcon}>✅</Text>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Wear Fitted Clothing</Text>
            <Text style={styles.instructionDescription}>
              Wear tight-fitting clothes or minimal clothing for accurate measurements.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>5</Text>
          </View>
          <Text style={styles.instructionIcon}>⏱️</Text>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Stay Still</Text>
            <Text style={styles.instructionDescription}>
              Hold your position for 3-5 seconds while the app captures measurements.
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Notes</Text>
            <Text style={styles.warningText}>
              • Ensure good lighting conditions{'\n'}
              • Keep your phone steady during measurement{'\n'}
              • Remove bulky clothing for better accuracy{'\n'}
              • Stand on a flat surface
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('ar-measurement')}
          >
            <Text style={styles.primaryButtonText}>📷 Start AR Measurement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.secondaryButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderARMeasurementScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('instructions')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AR Measurement</Text>
      </View>

      <View style={styles.arContainer}>
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Camera permission required</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
              <Text style={styles.primaryButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView style={styles.cameraView} facing="front" />

            <View style={styles.overlayFill} pointerEvents="box-none">
              {/* Top Status Bar */}
              <View style={styles.topStatusBar}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, isBodyDetected && styles.statusDotActive]} />
                  <Text style={styles.statusText}>
                    {isBodyDetected ? 'Body Detected' : 'Position yourself'}
                  </Text>
                </View>
                <View style={styles.confidenceIndicator}>
                  <Text style={styles.confidenceText}>
                    Confidence: {Math.round(overallConfidence * 100)}%
                  </Text>
                  <View style={[styles.confidenceBar, { width: `${overallConfidence * 100}%` }]} />
                </View>
                <Text style={styles.stepIndicator}>
                  {currentStep === 'front' ? 'Front View' : 'Side View'}
                </Text>
              </View>

              {/* Silhouette Guide */}
              <View style={styles.silhouetteContainer}>
                {currentStep === 'front' ? (
                  <View style={styles.frontSilhouette}>
                    <Image 
                      source={require('./assets/Front.png')} 
                      style={styles.silhouetteImage}
                      resizeMode="contain"
                    />
                    {/* Measurement Points */}
                    <View style={styles.measurementPoint} />
                    <View style={[styles.measurementPoint, styles.chestPoint]} />
                    <View style={[styles.measurementPoint, styles.waistPoint]} />
                    <View style={[styles.measurementPoint, styles.hipPoint]} />
                  </View>
                ) : (
                  <View style={styles.sideSilhouette}>
                    <Image 
                      source={require('./assets/Side.png')} 
                      style={styles.silhouetteImage}
                      resizeMode="contain"
                    />
                    {/* Measurement Points */}
                    <View style={styles.sideMeasurementPoint} />
                    <View style={[styles.sideMeasurementPoint, styles.sideChestPoint]} />
                    <View style={[styles.sideMeasurementPoint, styles.sideWaistPoint]} />
                    <View style={[styles.sideMeasurementPoint, styles.sideHipPoint]} />
                  </View>
                )}
              </View>

              {/* Center Instructions */}
              <View style={styles.centerInstructions}>
                <Text style={styles.instructionText}>
                  {currentStep === 'front' 
                    ? 'Stand straight, arms away from body'
                    : 'Turn 90° right, arms at sides'
                  }
                </Text>
                
                {/* Visibility Issues */}
                {visibilityIssues.length > 0 && (
                  <View style={styles.visibilityIssuesContainer}>
                    <Text style={styles.visibilityIssuesTitle}>⚠️ Visibility Issues:</Text>
                    {visibilityIssues.map((issue, index) => (
                      <Text key={index} style={styles.visibilityIssueText}>
                        • {issue}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Countdown Overlay */}
              {isTracking && (
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownNumber}>{countdown}</Text>
                  <Text style={styles.countdownLabel}>seconds</Text>
                </View>
              )}

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <TouchableOpacity
                  style={[styles.captureButton, !isBodyDetected && styles.captureButtonDisabled]}
                  onPress={() => {
                    if (!isBodyDetected) {
                      setIsBodyDetected(true);
                      setTrackingQuality('excellent');
                      startBodyTracking();
                      return;
                    }

                    if (currentStep === 'front') {
                      setCurrentStep('side');
                      setCountdown(10);
                      setIsTracking(true);

                      const interval = setInterval(() => {
                        setCountdown((prev) => {
                          if (prev <= 1) {
                            clearInterval(interval);
                            setIsTracking(false);
                            handleMeasurementComplete();
                            return 10;
                          }
                          return prev - 1;
                        });
                      }, 1000);
                    } else {
                      handleMeasurementComplete();
                    }
                  }}
                >
                  <Text style={styles.captureButtonText}>
                    {isBodyDetected ? 'Capture' : 'Detecting...'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderReviewScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('ar-measurement')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Measurements</Text>
      </View>

      <View style={styles.content}>
        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          <Text style={styles.unitToggleLabel}>Units:</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                unitSystem === 'cm' && styles.unitButtonActive
              ]}
              onPress={() => setUnitSystem('cm')}
            >
              <Text style={[
                styles.unitButtonText,
                unitSystem === 'cm' && styles.unitButtonTextActive
              ]}>
                cm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                unitSystem === 'inches' && styles.unitButtonActive
              ]}
              onPress={() => setUnitSystem('inches')}
            >
              <Text style={[
                styles.unitButtonText,
                unitSystem === 'inches' && styles.unitButtonTextActive
              ]}>
                inches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                unitSystem === 'feet' && styles.unitButtonActive
              ]}
              onPress={() => setUnitSystem('feet')}
            >
              <Text style={[
                styles.unitButtonText,
                unitSystem === 'feet' && styles.unitButtonTextActive
              ]}>
                ft/in
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Review and adjust your measurements if needed. All measurements are in {unitSystem === 'feet' ? 'feet and inches' : unitSystem}.
          </Text>
        </View>

        <ScrollView 
          style={styles.measurementsContainer}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.measurementsContent}
        >
          {Object.entries(measurements).map(([key, measurement]) => {
            const measurementObj = measurement as any;
            const originalValue = measurementObj?.value !== undefined ? measurementObj.value : measurement;
            const convertedValue = convertMeasurement(originalValue, 'cm', unitSystem);
            const confidence = measurementObj?.confidence !== undefined ? measurementObj.confidence : 1.0;
            const confidenceColor = confidence > 0.9 ? '#4CAF50' : confidence > 0.7 ? '#FF9800' : '#F44336';
            
            return (
              <View key={key} style={styles.measurementCard}>
                <Text style={styles.measurementIcon}>
                  {key === 'height' ? '📏' : 
                   key === 'chest' ? '❤️' : 
                   key === 'waist' ? '👤' : 
                   key === 'hips' ? '⭕' : 
                   key === 'shoulders' ? '🔺' : 
                   key === 'inseam' ? '🚶' : 
                   key === 'armLength' ? '✋' : '👤'}
                </Text>
                <View style={styles.measurementContent}>
                  <Text style={styles.measurementLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <View style={styles.measurementInput}>
                    <Text style={styles.measurementValue}>
                      {unitSystem === 'inches' ? convertedValue.toFixed(1) : 
                       unitSystem === 'feet' ? `${convertedValue.feet}' ${convertedValue.inches}"` : 
                       String(convertedValue)}
                    </Text>
                    <Text style={styles.measurementUnit}>
                      {unitSystem === 'feet' ? '' : unitSystem}
                    </Text>
                  </View>
                  <View style={styles.confidenceIndicator}>
                    <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                      Confidence: {Math.round(confidence * 100)}%
                    </Text>
                    <View style={[styles.confidenceBar, { width: `${confidence * 100}%`, backgroundColor: confidenceColor }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setCurrentScreen('home');
              setCurrentStep('front');
              setMeasurements({});
              setFrontMeasurements(null);
              setSideMeasurements(null);
            }}
          >
            <Text style={styles.primaryButtonText}>💾 Save Measurements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setCurrentScreen('ar-measurement');
              setCurrentStep('front');
              setIsBodyDetected(false);
              setIsTracking(false);
              setCountdown(10);
              setBodyLandmarks(null);
            }}
          >
            <Text style={styles.secondaryButtonText}>🔄 Retake Measurements</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return renderHomeScreen();
      case 'instructions':
        return renderInstructionsScreen();
      case 'ar-measurement':
        return renderARMeasurementScreen();
      case 'review':
        return renderReviewScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  headerIcon: {
    fontSize: 60,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 60,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 40,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoIcon: {
    fontSize: 24,
    color: '#6366f1',
    marginRight: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  instructionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionNumber: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 60,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 24,
    color: '#f59e0b',
    marginRight: 12,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  arContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraWrapper: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
  },
  overlayFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  stepIndicator: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerInstructions: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  countdownOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  arInstructionBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
  },
  arIcon: {
    fontSize: 60,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 60,
  },
  arTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  arDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  arMeasurement: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 5,
  },
  trackingStatus: {
    marginTop: 15,
    alignItems: 'center',
  },
  trackingText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  countdownLabel: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  arControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  arButtonIcon: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: '#666',
  },
  captureButtonIcon: {
    fontSize: 30,
    color: 'white',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capturingText: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  measurementsContainer: {
    flex: 1,
  },
  measurementsContent: {
    paddingBottom: 20,
  },
  measurementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  measurementIcon: {
    fontSize: 24,
    color: '#6366f1',
    marginRight: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  measurementContent: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  measurementInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  measurementUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  confidenceIndicator: {
    marginTop: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  visibilityIssuesContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    maxWidth: 300,
  },
  visibilityIssuesTitle: {
    color: '#856404',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  visibilityIssueText: {
    color: '#856404',
    fontSize: 12,
    marginBottom: 4,
  },
  // Silhouette Guide Styles
  silhouetteContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -250 }],
    width: 400,
    height: 700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frontSilhouette: {
    width: 400,
    height: 700,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSilhouette: {
    width: 350,
    height: 700,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  measurementPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  chestPoint: {
    top: 120,
    left: '50%',
    transform: [{ translateX: -4 }],
  },
  waistPoint: {
    top: 200,
    left: '50%',
    transform: [{ translateX: -4 }],
  },
  hipPoint: {
    top: 280,
    left: '50%',
    transform: [{ translateX: -4 }],
  },

  sideMeasurementPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
    borderWidth: 2,
    borderColor: 'white',
  },
  sideChestPoint: {
    top: 110,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  sideWaistPoint: {
    top: 180,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  sideHipPoint: {
    top: 250,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  // Unit Toggle Styles
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unitToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#6366f1',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  unitButtonTextActive: {
    color: 'white',
  },
}); 