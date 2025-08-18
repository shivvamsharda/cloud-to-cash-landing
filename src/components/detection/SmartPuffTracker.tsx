import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, VideoOff, Eye, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import createMediaPipeSetup, { MediaPipeSetup } from './MediaPipeSetup';

// Mouth landmark indices for MediaPipe Face Mesh
const MOUTH_LANDMARKS = {
  upperLipTop: [61, 84, 17, 314, 405, 291],
  upperLipBottom: [80, 81, 82, 13, 312, 311, 310],
  lowerLipTop: [78, 95, 88, 178, 87, 14, 317, 402, 318],
  lowerLipBottom: [146, 91, 181, 84, 17, 314, 405, 375],
  leftCorner: 61,
  rightCorner: 291,
  upperLipCenter: 13,
  lowerLipCenter: 14
};

interface PuffAnalysis {
  isPuff: boolean;
  confidence: number;
  reason: string;
  metrics: {
    mouthHeight: number;
    mouthWidth: number;
    aspectRatio: number;
    lipPursing: number;
    cheekPuff: number;
    mouthPucker: number;
    jawOpen: number;
    timestamp: number;
  };
  details: {
    maxAspectRatio: string;
    maxPursing: string;
    maxCheekPuff: string;
    maxMouthPucker: string;
    sequenceScore: number;
  };
}

interface SmartPuffTrackerProps {
  onPuffDetected: () => void;
  isTracking: boolean;
}

const SmartPuffTracker: React.FC<SmartPuffTrackerProps> = ({ 
  onPuffDetected, 
  isTracking 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaPipeRef = useRef<MediaPipeSetup | null>(null);
  const isRunningRef = useRef(false);
  const lastPuffTimeRef = useRef(0);
  
  // Mouth analysis history
  const mouthShapeHistory = useRef<any[]>([]);
  
  const [smartDetectionEnabled, setSmartDetectionEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [mouthMetrics, setMouthMetrics] = useState({
    openness: 0,
    pursing: 0,
    cheekPuff: 0,
    confidence: 0
  });

  // Initialize MediaPipe
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        mediaPipeRef.current = createMediaPipeSetup();
        await mediaPipeRef.current.initialize();
        setMediaPipeReady(true);
        console.log('✅ MediaPipe ready for smart detection');
      } catch (error: any) {
        console.error('❌ MediaPipe initialization failed:', error);
        setError(`AI Detection unavailable: ${error.message}`);
      }
    };

    initializeMediaPipe();
    
    return () => {
      if (mediaPipeRef.current) {
        mediaPipeRef.current.cleanup();
      }
    };
  }, []);

  // Calculate distance between two landmarks
  const calculateDistance = (landmark1: any, landmark2: any) => {
    const dx = landmark1.x - landmark2.x;
    const dy = landmark1.y - landmark2.y;
    const dz = landmark1.z - landmark2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // Analyze mouth movements and patterns
  const analyzeMouthPattern = useCallback((landmarks: any[], blendshapes: any[]): PuffAnalysis => {
    if (!landmarks || landmarks.length === 0) {
      return { 
        isPuff: false, 
        confidence: 0, 
        reason: 'No face detected',
        metrics: {
          mouthHeight: 0, mouthWidth: 0, aspectRatio: 0, lipPursing: 0,
          cheekPuff: 0, mouthPucker: 0, jawOpen: 0, timestamp: performance.now()
        },
        details: {
          maxAspectRatio: '0', maxPursing: '0', maxCheekPuff: '0',
          maxMouthPucker: '0', sequenceScore: 0
        }
      };
    }

    // Get key mouth landmarks
    const upperLip = landmarks[MOUTH_LANDMARKS.upperLipCenter];
    const lowerLip = landmarks[MOUTH_LANDMARKS.lowerLipCenter];
    const leftCorner = landmarks[MOUTH_LANDMARKS.leftCorner];
    const rightCorner = landmarks[MOUTH_LANDMARKS.rightCorner];
    
    // Calculate mouth metrics
    const mouthHeight = calculateDistance(upperLip, lowerLip);
    const mouthWidth = calculateDistance(leftCorner, rightCorner);
    const aspectRatio = mouthHeight / (mouthWidth + 0.001);
    
    // Calculate lip pursing (O-shape detection)
    const lipPursing = 1 - (mouthWidth / 0.15);
    
    // Get blendshape values if available
    let cheekPuff = 0;
    let mouthPucker = 0;
    let jawOpen = 0;
    
    if (blendshapes && blendshapes.length > 0) {
      const shapes = blendshapes[0].categories;
      shapes.forEach((shape: any) => {
        if (shape.categoryName === 'cheekPuff') cheekPuff = shape.score;
        if (shape.categoryName === 'mouthPucker') mouthPucker = shape.score;
        if (shape.categoryName === 'jawOpen') jawOpen = shape.score;
        if (shape.categoryName === 'mouthFunnel') mouthPucker = Math.max(mouthPucker, shape.score);
      });
    }
    
    // Store metrics for history
    const currentMetrics = {
      mouthHeight: mouthHeight * 1000,
      mouthWidth: mouthWidth * 1000,
      aspectRatio,
      lipPursing,
      cheekPuff,
      mouthPucker,
      jawOpen,
      timestamp: performance.now()
    };
    
    // Update history
    mouthShapeHistory.current.push(currentMetrics);
    
    // Keep history size manageable (last 60 frames = ~2 seconds at 30fps)
    if (mouthShapeHistory.current.length > 60) mouthShapeHistory.current.shift();
    
    // Need enough history for pattern analysis
    if (mouthShapeHistory.current.length < 15) {
      return { 
        isPuff: false, 
        confidence: 0, 
        reason: 'Building pattern history...',
        metrics: currentMetrics,
        details: {
          maxAspectRatio: '0', maxPursing: '0', maxCheekPuff: '0',
          maxMouthPucker: '0', sequenceScore: 0
        }
      };
    }
    
    // Analyze patterns over time
    const recentHistory = mouthShapeHistory.current.slice(-30);
    
    // Calculate confidence score
    let confidence = 0;
    
    // Mouth opening score (0-25 points)
    const maxAspectRatio = Math.max(...recentHistory.map(h => h.aspectRatio));
    if (maxAspectRatio > 0.3) confidence += 25;
    else if (maxAspectRatio > 0.2) confidence += 20;
    else if (maxAspectRatio > 0.15) confidence += 15;
    else if (maxAspectRatio > 0.1) confidence += 10;
    
    // Lip pursing score (0-30 points)
    const maxPursing = Math.max(...recentHistory.map(h => h.lipPursing));
    if (maxPursing > 0.6) confidence += 30;
    else if (maxPursing > 0.4) confidence += 25;
    else if (maxPursing > 0.3) confidence += 20;
    else if (maxPursing > 0.2) confidence += 15;
    
    // Cheek/mouth puff score (0-35 points)
    const maxCheekPuff = Math.max(...recentHistory.map(h => h.cheekPuff));
    const maxMouthPucker = Math.max(...recentHistory.map(h => h.mouthPucker));
    if (maxCheekPuff > 0.5 || maxMouthPucker > 0.5) confidence += 35;
    else if (maxCheekPuff > 0.3 || maxMouthPucker > 0.3) confidence += 25;
    else if (maxCheekPuff > 0.15 || maxMouthPucker > 0.15) confidence += 15;
    
    // Temporal sequence bonus (0-10 points)
    const sequenceLength = Math.min(recentHistory.length, 20);
    let sequenceScore = 0;
    
    if (sequenceLength >= 10) {
      const firstThird = recentHistory.slice(0, Math.floor(sequenceLength/3));
      const lastThird = recentHistory.slice(Math.floor(2*sequenceLength/3));
      
      const firstAvgOpen = firstThird.reduce((a, b) => a + b.aspectRatio, 0) / firstThird.length;
      const lastAvgPuff = lastThird.reduce((a, b) => a + b.cheekPuff + b.mouthPucker, 0) / lastThird.length;
      
      if (firstAvgOpen > maxAspectRatio * 0.8) sequenceScore += 5;
      if (lastAvgPuff > 0.1) sequenceScore += 5;
    }
    
    confidence += sequenceScore;
    
    // Apply strict detection threshold (90%)
    const threshold = 90;
    const isPuff = confidence >= threshold;
    
    return {
      isPuff,
      confidence,
      reason: isPuff ? 
        `Puff detected (${confidence.toFixed(1)}% confidence)` :
        `Below threshold (${confidence.toFixed(1)}% < ${threshold}%)`,
      metrics: currentMetrics,
      details: {
        maxAspectRatio: maxAspectRatio.toFixed(3),
        maxPursing: maxPursing.toFixed(3),
        maxCheekPuff: maxCheekPuff.toFixed(3),
        maxMouthPucker: maxMouthPucker.toFixed(3),
        sequenceScore
      }
    };
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isRunningRef.current || !smartDetectionEnabled || !cameraActive) return;
    
    const detect = () => {
      if (!isRunningRef.current || !videoRef.current || !canvasRef.current || !mediaPipeRef.current) {
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.readyState < 2 || video.videoWidth === 0) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const timestamp = performance.now();
        const results = mediaPipeRef.current.detectFaceLandmarks(video, timestamp);
        
        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          setFaceDetected(true);
          
          const landmarks = results.faceLandmarks[0];
          const blendshapes = results.faceBlendshapes;
          
          // Analyze mouth patterns
          const puffAnalysis = analyzeMouthPattern(landmarks, blendshapes);
          
          // Update metrics display
          setMouthMetrics({
            openness: parseFloat((puffAnalysis.metrics.aspectRatio * 100).toFixed(1)),
            pursing: parseFloat((puffAnalysis.metrics.lipPursing * 100).toFixed(1)),
            cheekPuff: parseFloat((puffAnalysis.metrics.cheekPuff * 100).toFixed(1)),
            confidence: parseFloat(puffAnalysis.confidence.toFixed(1))
          });
          
          // Draw face landmarks overlay
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
          ctx.lineWidth = 1;
          
          // Draw mouth landmarks
          [MOUTH_LANDMARKS.leftCorner, MOUTH_LANDMARKS.rightCorner, 
           MOUTH_LANDMARKS.upperLipCenter, MOUTH_LANDMARKS.lowerLipCenter].forEach(idx => {
            const landmark = landmarks[idx];
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.stroke();
          });
          
          // Check for puff detection
          if (puffAnalysis.isPuff && isTracking) {
            const now = Date.now();
            const timeSinceLastPuff = now - lastPuffTimeRef.current;
            
            if (timeSinceLastPuff > 4000) { // 4 second cooldown
              lastPuffTimeRef.current = now;
              onPuffDetected();
              console.log(`🤖 AI detected puff! Confidence: ${puffAnalysis.confidence.toFixed(1)}%`);
              
              // Visual feedback
              ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              ctx.fillStyle = '#00ff00';
              ctx.font = 'bold 20px Arial';
              ctx.fillText('🤖 AI DETECTED PUFF!', 20, 40);
            }
          }
          
        } else {
          setFaceDetected(false);
          setMouthMetrics({ openness: 0, pursing: 0, cheekPuff: 0, confidence: 0 });
          mouthShapeHistory.current = [];
        }
        
      } catch (detectionError) {
        console.error('Detection error:', detectionError);
      }
      
      animationRef.current = requestAnimationFrame(detect);
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    detect();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [smartDetectionEnabled, cameraActive, isTracking, analyzeMouthPattern, onPuffDetected]);

  // Start camera
  const startCamera = async () => {
    if (!mediaPipeReady) {
      setError('AI Detection not ready yet. Please wait...');
      return;
    }

    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.oncanplay = () => {
          videoRef.current?.play().then(() => {
            setCameraActive(true);
            isRunningRef.current = true;
            mouthShapeHistory.current = [];
          });
        };
      }
      
    } catch (err: any) {
      setError(`Camera failed: ${err.message}`);
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    isRunningRef.current = false;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    setFaceDetected(false);
    setMouthMetrics({ openness: 0, pursing: 0, cheekPuff: 0, confidence: 0 });
    lastPuffTimeRef.current = 0;
  };

  // Toggle smart detection
  const toggleSmartDetection = async (enabled: boolean) => {
    setSmartDetectionEnabled(enabled);
    
    if (enabled && !cameraActive) {
      await startCamera();
    } else if (!enabled && cameraActive) {
      stopCamera();
    }
  };

  if (!mediaPipeReady && smartDetectionEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            AI Detection Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Initializing AI detection models...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Smart Puff Detection
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="smart-detection"
              checked={smartDetectionEnabled}
              onCheckedChange={toggleSmartDetection}
              disabled={!mediaPipeReady}
            />
            <Label htmlFor="smart-detection">
              {smartDetectionEnabled ? 'ON' : 'OFF'}
            </Label>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {smartDetectionEnabled && (
          <>
            {/* Camera Preview */}
            <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              
              {/* Status overlays */}
              <div className="absolute top-2 right-2 space-y-1">
                <Badge variant={faceDetected ? "default" : "destructive"}>
                  {faceDetected ? '✅ Face' : '❌ No Face'}
                </Badge>
                {isTracking && (
                  <Badge variant="secondary">
                    🎯 Tracking Active
                  </Badge>
                )}
              </div>
              
              {cameraActive && faceDetected && (
                <div className="absolute bottom-2 left-2 bg-black/80 text-white p-2 rounded text-xs space-y-1">
                  <div>Confidence: {mouthMetrics.confidence}%</div>
                  <div>Opening: {mouthMetrics.openness}%</div>
                  <div>Pursing: {mouthMetrics.pursing}%</div>
                  <div>Cheek Puff: {mouthMetrics.cheekPuff}%</div>
                </div>
              )}
              
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Camera Inactive</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Detection Settings */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  {showAdvanced ? 'Hide' : 'Show'} Detection Settings
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="space-y-2">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">🔒 High Precision Mode</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detection is locked to strict mode (90% threshold) to prevent false positives and ensure accuracy.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-1">Detection Features</Badge>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>✅ Mouth opening (inhale)</div>
                      <div>✅ Lip pursing (O-shape)</div>
                      <div>✅ Cheek puffing (exhale)</div>
                      <div>✅ Temporal sequences</div>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="mb-1">Tips for Better Detection</Badge>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>👄 Face camera directly</div>
                      <div>💡 Ensure good lighting</div>
                      <div>📏 Stay 1-3 feet away</div>
                      <div>🎯 Make clear movements</div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Camera Controls */}
            <div className="flex gap-2">
              {!cameraActive ? (
                <Button 
                  onClick={startCamera} 
                  className="flex-1"
                  disabled={!mediaPipeReady}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button 
                  onClick={stopCamera} 
                  variant="outline" 
                  className="flex-1"
                >
                  <VideoOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        
        {!smartDetectionEnabled && (
          <div className="text-center py-6 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Enable smart detection to automatically track puffs using AI</p>
            <p className="text-sm mt-1">Uses your camera to detect vaping behavior</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartPuffTracker;
