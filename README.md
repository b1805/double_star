# Double Star

Double Star is an interactive web-based application that simulates light rays bouncing off walls in a customizable room. You can adjust the number of light rays, precision, photon thickness colors, and animation speed. You can also switch to the angle version to shoot the rays one at a time at your chosen angles and colours. Additionally, you can record the simulation and download the video.

## Theory

Double Star created using 20 isosceles triangles ABC with A=30=B, C=120. This figure has 2 unilluminable points. When rays of light are shot from one of these points in all directions, it would never return back either of them but illuminate the rest of the room completely. It is as if you're standing at one of these points with a lamp, an observer can see everything in the room except for you and the other point! This works using the implementation of right triangles, as my supervisor George Tokarsky first theorized in 1995 to create the first-ever un-illuminable room!

## Features

- **Interactive Controls:** Modify the number of light rays, speed, precision, thickness, version and colors.
- **Real-time Animation:** Start and stop the animation at any time.
- **Photon Counter:** Displays the number of active photons in the simulation.
- **Recording Functionality:** Record the animation and download the video.

## Live Demo

https://b1805.github.io/double_star/

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/b1805/double_star
   cd double-star
   ```

2. Open `index.html` in your web browser to run the application.

## Usage

1. **Controls:**
   - Adjust the number of light rays using the respective input field and apply the changes.
   - Select the desired speed from the dropdown menu and apply.
   - Change colors for walls, photon head, photon tail, and magnifier using the color pickers and apply.
  
2. **Animation:**
   - Start the animation by clicking the "Start Animation" button.
   - Stop the animation by clicking the "Stop Animation" button.
   
3. **Recording:**
   - Start recording by clicking the "Start Recording" button.
   - Stop recording by clicking the "Stop Recording" button.
   - Alternatively, start both animation and recording simultaneously using the "Start Animation and Recording" button.
   - Download the recorded video by clicking the "Download" button after stopping the recording.

## Files

- `index.html`
- `whammy.js`
- `classes.js`
- `script.js`
- `style.css`
- `multimag.js`

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/b1805/double_star/blob/main/LICENCE.txt) file for details.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

## Acknowledgements

- [Whammy.js](https://github.com/antimatter15/whammy) - A library for recording videos from canvas.

## Contact

Bhavya Jain - bhavya1805@gmail.com | bjain1@ualberta.ca
