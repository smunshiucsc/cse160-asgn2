class Cylinder {
    constructor() {
        this.type = 'Cylinder';
        this.color = [1.0, 0.6, 0.6, 1]; 
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const numSegments = 30; 
        const radius = 0.5; 
        const height = 1.0; 

        for (let i = 0; i < numSegments; i++) {
            const angle1 = (i / numSegments) * 2 * Math.PI;
            const angle2 = ((i + 1) / numSegments) * 2 * Math.PI;

            const x1 = radius * Math.cos(angle1);
            const y1 = radius * Math.sin(angle1);
            const x2 = radius * Math.cos(angle2);
            const y2 = radius * Math.sin(angle2);

            
            drawTriangle3D([x1, y1, 0.0, x1, y1, height, x2, y2, height]); 
            drawTriangle3D([x1, y1, 0.0, x2, y2, height, x2, y2, 0.0]); 
        }

        const angleIncrement = (2 * Math.PI) / numSegments;
        for (let i = 0; i < numSegments; i++) {
            const angle1 = i * angleIncrement;
            const angle2 = (i + 1) * angleIncrement;

            const x1 = radius * Math.cos(angle1);
            const y1 = radius * Math.sin(angle1);
            const x2 = radius * Math.cos(angle2);
            const y2 = radius * Math.sin(angle2);

            drawTriangle3D([0.0, 0.0, 0.0, x1, y1, 0.0, x2, y2, 0.0]);
            drawTriangle3D([0.0, 0.0, height, x1, y1, height, x2, y2, height]);
        }
    }
}
