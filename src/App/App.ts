import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import DiscoSphere from "../3DObjects/DiscoSphere";

import PerspectiveCameraController from "../Controllers/CameraController/PerspectiveCameraController";
import { PostController } from "../Controllers/PostController/PostController";
import { RendererController } from "../Controllers/RendererController/RendererController";
import { ScreenSizesController } from "../Controllers/ScreenSizesController/ScreenSizesController";

export default class App {
  private _canvas: HTMLCanvasElement;
  constructor() {}

  init() {
    this._canvas = document.querySelector("canvas.webgl")!;
    const scene = new THREE.Scene();
    const textLoader = new THREE.TextureLoader();
    const gradient = textLoader.load("./gradient.jpg");
    const discoSphere = new DiscoSphere(scene);

    scene.background = gradient;

    const sizesController = new ScreenSizesController(this._canvas);
    sizesController.init();

    const cameraController = new PerspectiveCameraController(
      scene,
      sizesController
    );

    cameraController.camera.position.z = 3;
    scene.add(cameraController.camera);

    const controls = new OrbitControls(cameraController.camera, this._canvas);
    controls.enableDamping = true;

    const rendererController = new RendererController(
      this._canvas,
      sizesController
    );

    sizesController.setControllers(cameraController, rendererController);

    const postController = new PostController(sizesController.sizes);

    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      controls.update();
      discoSphere.update(elapsedTime);

      rendererController.renderer.setRenderTarget(postController.postTexture);
      rendererController.renderer.render(scene, cameraController.camera);

      postController.updateUniform();

      rendererController.renderer.setRenderTarget(null);
      rendererController.renderer.render(
        postController.scene,
        postController.camera
      );

      window.requestAnimationFrame(tick);
    };

    tick();
  }
}
