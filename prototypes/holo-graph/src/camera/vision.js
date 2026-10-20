// Lazily loads MediaPipe so the 3D graph starts fast and works without a camera.
// The WASM runtime is served from our own origin by the vite plugin in vite.config.js.
const WASM_URL = `${import.meta.env.BASE_URL}mediapipe-wasm`
const HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

let filesetPromise
async function load() {
  const vision = await import('@mediapipe/tasks-vision')
  filesetPromise ??= vision.FilesetResolver.forVisionTasks(WASM_URL)
  return { vision, fileset: await filesetPromise }
}

async function create(name, modelAssetPath, options) {
  const { vision, fileset } = await load()
  const make = (delegate) =>
    vision[name].createFromOptions(fileset, {
      baseOptions: { modelAssetPath, delegate },
      runningMode: 'VIDEO',
      ...options,
    })
  try {
    return await make('GPU')
  } catch {
    return make('CPU')
  }
}

export const createHandLandmarker = () => create('HandLandmarker', HAND_MODEL, { numHands: 2 })
export const createFaceLandmarker = () => create('FaceLandmarker', FACE_MODEL, { numFaces: 1 })

// Runs a detector on the shared video at ~30fps until stopped.
export function runOnVideo(video, detect) {
  let raf
  let last = -1
  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!video || video.readyState < 2) return
    const now = performance.now()
    if (now - last < 33) return
    last = now
    detect(now)
  }
  tick()
  return () => cancelAnimationFrame(raf)
}
