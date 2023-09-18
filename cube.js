const canvas = document.getElementById("webglCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL is not available.");
}

// Vertex and Fragment shaders
const vertexShaderSource = `
    attribute vec4 a_position;
    uniform mat4 u_model;
    void main() {
        gl_Position = u_model * a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1, 0, 0, 1); // Cube color: Red
    }
`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Cube vertices
const vertices = [
  // Front face
  -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
  // ... other 5 faces ...
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

function drawCube(x, y, z, size) {
  // Create a simple model matrix to place the cube at (x, y, z) and scale it
  const modelMatrix = [size, 0, 0, x, 0, size, 0, y, 0, 0, size, z, 0, 0, 0, 1];

  const modelMatrixLocation = gl.getUniformLocation(program, "u_model");
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  // ... repeat for other 5 faces ...
}

gl.clearColor(0.9, 0.9, 0.9, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
drawCube(0.2, 0.2, 0.0, 0.5); // Place cube at (0.2, 0.2, 0.0) with a size of 0.5
