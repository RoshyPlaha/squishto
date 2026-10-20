# Holo Graph ✨

A proof-of-concept, Wiz-style cloud security graph rendered as a soft, glowing 3D "hologram" you can control with your camera.

The graph comes from mock AWS metadata in `src/data/estate.json`. The camera does not discover infrastructure; it is used to interact with the graph and to make it feel like it is floating in your room.

## Run it

```bash
cd prototypes/holo-graph
npm install
npm run dev      # http://localhost:5173
npm test         # rule-engine tests
npm run build    # static build in dist/
```

The camera only works on `localhost` or over HTTPS. The first time you turn on a camera mode, the browser asks for permission and MediaPipe downloads its hand/face models (a few MB) from Google's model storage. Everything runs locally in the browser, and no video leaves your machine.

## What's in the demo

| Feature | How |
| --- | --- |
| Attack-path detection | `src/engine/rules.js` walks the graph for toxic combinations: *internet-exposed + vulnerable + privileged role → sensitive data*, *leaked key → identity → sensitive data*, and *public bucket with sensitive data*. |
| Issue highlight | Picking an issue lights its path in rose-gold with flowing motes and sparkles, fades everything else into mist, and glides the camera to frame it. |
| Layouts | **Path** (left to right, like Wiz) and **Constellation** (3D force layout). Nodes glide between them. |
| 🪞 Room view | Your front camera behind a translucent graph, with a light pastel wash. |
| 🙂 Head parallax | Face tracking tilts the graph as you move your head, so it feels like it sits behind the screen. |
| ✋ Hand magic | Hand tracking. ☝️ point and hold on a node to open it · 🤏 pinch and drag to spin · 🤏🤏 pinch with both hands and pull apart to zoom · 👋 swipe an open hand to step through issues · 🖐️ hold an open palm to reset. |

Mouse and keyboard always work too: drag to orbit, scroll to zoom, click nodes, use ← / → to step through issues, and Esc to reset.

## Structure

```
src/
  data/estate.json      mock AWS estate (nodes + edges)
  engine/               graph helpers, rules (toxic combinations), layouts
  scene/                three.js / react-three-fiber scene: nodes, edges, rigs, hand cursor
  camera/               getUserMedia + MediaPipe hand/face tracking and gesture maths
  ui/                   frosted-glass panels, toggles, camera preview
```

To try your own estate, edit `estate.json`. Node `type` is one of `internet`, `endpoint`, `ec2`, `lambda`, `technology`, `vulnerability`, `secret`, `iam_role`, `iam_user` or `s3`. Edge `rel` is one of `exposes`, `routes_to`, `runs`, `has_finding`, `assumes`, `grants` or `can_access`. The rules pick up new paths automatically.

## Tech

Vite · React 19 · three.js via @react-three/fiber and drei · @mediapipe/tasks-vision. Vite serves MediaPipe's WASM runtime from the app itself (see `vite.config.js`), so it always matches the installed package.
