import {
  circlePath,
  joinPaths,
  line,
  roundedRect,
  type SignatureGeometry,
} from "./geometry";

/** İnsan izinin yaratıcı bir AI ağıyla çoğalıp yeni bir görüntüye dönüşmesi. */
export function humanAiFlowSignature(): SignatureGeometry {
  return {
    width: 1200,
    height: 560,
    paths: [
      { id: "fingerprint-outer", role: "front", from: 0.02, to: 0.14, d: "M54 363C32 229 88 108 198 87C309 66 386 151 374 269C365 355 322 421 258 466" },
      { id: "fingerprint-two", role: "back", from: 0.07, to: 0.18, d: "M91 374C69 255 112 145 202 126C292 107 345 179 336 270C328 347 293 400 238 438" },
      { id: "fingerprint-three", role: "front", from: 0.12, to: 0.23, d: "M131 378C110 278 141 184 207 167C273 150 310 207 302 276C296 334 267 377 222 411" },
      { id: "fingerprint-core", role: "construction", from: 0.17, to: 0.27, d: "M174 365C158 298 174 224 215 211C254 199 274 236 269 281C264 323 245 351 215 374" },
      { id: "human-vector", role: "construction", from: 0.22, to: 0.34, d: "M215 374C300 334 367 281 450 280" },
      { id: "neural-links-a", role: "front", from: 0.3, to: 0.45, d: joinPaths([line(450, 280, 506, 196), line(450, 280, 516, 356), line(506, 196, 581, 250), line(516, 356, 581, 250), line(581, 250, 644, 164), line(581, 250, 657, 335)]) },
      { id: "neural-links-b", role: "back", from: 0.36, to: 0.51, d: joinPaths([line(506, 196, 563, 108), line(563, 108, 644, 164), line(644, 164, 730, 231), line(657, 335, 730, 231), line(657, 335, 721, 409), line(516, 356, 721, 409)]) },
      { id: "neural-nodes", role: "front", from: 0.43, to: 0.57, d: joinPaths([circlePath(450, 280, 12), circlePath(506, 196, 12), circlePath(516, 356, 12), circlePath(581, 250, 16), circlePath(563, 108, 10), circlePath(644, 164, 12), circlePath(657, 335, 12), circlePath(730, 231, 15), circlePath(721, 409, 10)]) },
      { id: "network-orbit", role: "construction", from: 0.5, to: 0.62, d: "M425 280C425 138 522 64 628 85C746 108 790 247 733 351C679 450 527 468 455 372" },
      { id: "output-frame", role: "front", from: 0.6, to: 0.73, d: roundedRect(816, 126, 326, 296, 10) },
      { id: "output-safe", role: "construction", from: 0.66, to: 0.77, d: roundedRect(842, 151, 274, 246, 3) },
      { id: "flower-petals-a", role: "front", from: 0.72, to: 0.84, d: "M979 275C914 251 901 184 950 179C991 175 1005 224 979 275C1037 232 1095 249 1080 296C1068 334 1016 326 979 275" },
      { id: "flower-petals-b", role: "back", from: 0.77, to: 0.89, d: "M979 275C947 335 880 338 878 289C876 248 927 238 979 275C956 214 988 163 1029 187C1063 207 1038 253 979 275" },
      { id: "flower-core", role: "front", from: 0.84, to: 0.93, d: joinPaths([circlePath(979, 275, 22), circlePath(979, 275, 7)]) },
      { id: "frame-registration", role: "construction", from: 0.87, to: 0.95, d: joinPaths([line(816, 160, 844, 160), line(830, 146, 830, 174), line(1114, 388, 1142, 388), line(1128, 374, 1128, 402)]) },
      { id: "transformation-path", role: "accent", from: 0.91, to: 1, d: "M54 444C233 507 325 364 450 280C573 198 683 244 816 275C880 290 927 291 979 275" },
    ],
    nodes: [
      { x: 54, y: 363, t: 0.04, kind: "filled" }, { x: 198, y: 87, t: 0.11, kind: "hollow" },
      { x: 215, y: 374, t: 0.25, kind: "filled" }, { x: 450, y: 280, t: 0.35, kind: "hollow" },
      { x: 506, y: 196, t: 0.4, kind: "filled" }, { x: 581, y: 250, t: 0.48, kind: "filled" },
      { x: 730, y: 231, t: 0.56, kind: "hollow" }, { x: 816, y: 126, t: 0.64, kind: "filled" },
      { x: 1142, y: 422, t: 0.74, kind: "hollow" }, { x: 979, y: 179, t: 0.8, kind: "filled" },
      { x: 979, y: 275, t: 0.9, kind: "hollow" }, { x: 54, y: 444, t: 0.94, kind: "filled" },
    ],
    handles: [
      { x: 198, y: 87, inX: 138, inY: 72, outX: 258, outY: 102, t: 0.12 },
      { x: 450, y: 280, inX: 404, inY: 310, outX: 496, outY: 250, t: 0.36 },
      { x: 979, y: 275, inX: 929, inY: 275, outX: 1029, outY: 275, t: 0.91 },
    ],
  };
}
