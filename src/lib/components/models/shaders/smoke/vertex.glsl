varying vec2 vUv;
uniform sampler2D uPerlinTexture;
uniform float uTime;


vec2 rotate2D(vec2 value, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    mat2 rotation = mat2(c, s, -s, c);
    return rotation * value;
}

void main()

{
    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture(
        uPerlinTexture,
        vec2(0.5, uv.y * 0.2 - uTime * 0.01)
        ).r;
    float angle = twistPerlin * 10.;

    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind offset

    vec2 windOffset = vec2(texture(uPerlinTexture, vec2(.25, uTime *0.01)).r -0.5,
    texture(uPerlinTexture, vec2(.75, uTime *0.01)).r -0.5);
    windOffset *= pow(uv.y, 2.0) * 10.;
    newPosition.xz+= windOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}