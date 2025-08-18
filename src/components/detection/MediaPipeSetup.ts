import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface MediaPipeSetup {
  initialize: () => Promise<boolean>;
  detectFaceLandmarks: (video: HTMLVideoElement, timestamp: number) => {
    faceLandmarks: any[];
    faceBlendshapes: any[];
  };
  cleanup: () => void;
  isInitialized: boolean;
}

const createMediaPipeSetup = (): MediaPipeSetup => {
  let faceLandmarker: FaceLandmarker | null = null;
  let isInitialized = false;

  const initialize = async (): Promise<boolean> => {
    try {
      console.log('🤖 Initializing MediaPipe Face Mesh...');
      
      // Load MediaPipe vision tasks
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      console.log('✅ MediaPipe vision FilesetResolver loaded');
      
      // Initialize Face Landmarker with face mesh
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false
      });
      
      console.log('✅ Face Landmarker initialized successfully');
      isInitialized = true;
      
      return true;
    } catch (error: any) {
      console.error('❌ MediaPipe initialization failed:', error);
      
      // Fallback to CPU if GPU fails
      if (error.message && (error.message.includes('GPU') || error.message.includes('WebGL'))) {
        console.log('🔄 Retrying with CPU delegate...');
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
          );
          
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: false
          });
          
          console.log('✅ Face Landmarker initialized with CPU fallback');
          isInitialized = true;
          return true;
        } catch (fallbackError) {
          console.error('❌ CPU fallback also failed:', fallbackError);
          throw fallbackError;
        }
      }
      throw error;
    }
  };

  const detectFaceLandmarks = (video: HTMLVideoElement, timestamp: number) => {
    if (!faceLandmarker || !isInitialized) {
      console.error('Face Landmarker not initialized');
      return { faceLandmarks: [], faceBlendshapes: [] };
    }
    
    try {
      const results = faceLandmarker.detectForVideo(video, timestamp);
      // Ensure the results have the expected structure
      return {
        faceLandmarks: results?.faceLandmarks || [],
        faceBlendshapes: results?.faceBlendshapes || []
      };
    } catch (error) {
      console.error('Face landmark detection error:', error);
      return { faceLandmarks: [], faceBlendshapes: [] };
    }
  };

  const cleanup = () => {
    if (faceLandmarker) {
      try {
        faceLandmarker.close();
      } catch (error) {
        console.warn('Error closing face landmarker:', error);
      }
      faceLandmarker = null;
    }
    isInitialized = false;
    console.log('🧹 MediaPipe resources cleaned up');
  };

  // Return public interface
  return {
    initialize,
    detectFaceLandmarks,
    cleanup,
    get isInitialized() { return isInitialized; }
  };
};

export { createMediaPipeSetup };
export default createMediaPipeSetup;