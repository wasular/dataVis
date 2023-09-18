## Data Visulazation Project by Alexander Hoehne

### Description

This Project is a combination of simple 2D Data Visualizations and complex 
3D Data Simulations.
###!!The Project to be suitable was confirmed twice once in the forum and once through the webinar !!



#### How to run

- Due to the nature of loadTable and loadJson, which use fetch in the background, this project needs to run on a webserver. This can be achieved either by using the built-in live view that some IDEs offer, or by running a server like Xampp, NGINX, or Apache in the background.
- Since this project heavily relies on complex WebGL calculations, there are minimum performance requirements for the computer it runs on. So far, this project has been tested with a MacBook Air M1 and an HP Spectre x360 (2017) with 16GB RAM and an 8th Generation i7 processor, so it should also support older devices, although this cannot be guaranteed. Improvements are currently underway to support a wider range of devices.
- This project runs on Chromium-based browsers (Chrome, Edge, Brave, Opera, etc.), but the neural network simulations lag in Firefox. I am currently working to fix this issue.
- An example video demonstrating how the project should look when it's working can be found under report/showCase.mp4.
- Please note that the initial loading might take some time. This is because the project utilizes over 14,000 images and large JSON and CSV files that need to be loaded.

#### Neural Network Simulation

This Simulation consist of the 3 Files:

   - `nn.js` which is the logic for training and processing the Data Sets
   - `NNSimulations.js` which is the file that is used to render and load the Model
   - `utils.js` Numpy Utility Functions recreated in Javascript

#### Convolutional Neural Network Simulation

This Simulation consist of the 3 Files:

- `cnn.js` which is the logic for training and processing the Data Sets
- `CNNSimulations.js` which is the file that is used to render and load the Model
- `utils.js` Numpy Utility Functions recreated in Javascript

#### New York Crime Stats


This Simulation consists of one single File

`NewYorkCrime.js` Calculations and render Logic for the 3D Map are both in this file


#### Report 

A copy of the report can be found in the **report** folder named report.pdf 

For each Question in Coursera there is a accompanying sub folder below reports **q1**,**q2**,**q3**,**q4** in which images can be found to show the project planning and thinking


###!!The Project to be suitable was confirmed twice once in the forum and once through the webinar !!

below the folder report you can find a proof `tutorQuestion.png`  or by watching the recording of the Webinar which this is mentioned around minute 20 and 50

