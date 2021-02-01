import SolarSystem from './solarSystem.js';

async function init() {
    // setup canvas
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentNode.clientWidth;
    let height = canvas.height = canvas.parentNode.clientHeight;

    const scale = 70;
    const params = {
        g: 39.5,
        dt: 0.008, // 0.008 years is equal to 2.92 days
        softeningConstant: 0.15,
        drawingParams: {
            ctx,
            radius: 4,
            trailLength: 35
        }
    };
    
    let solarSystem = await SolarSystem.init(params);
    
    let animate = () => {
        solarSystem.updatePositionVectors()
            .updateAccelerationVectors()
            .updateVelocityVectors();

        ctx.clearRect(0, 0, width, height);

        const massesLength = solarSystem.masses.length;

        for (let i = 0; i < massesLength; i++) {
            const massI = solarSystem.masses[i];


            const x = width / 2 + massI.Position.x * scale;
            const y = height / 2 + massI.Position.y * scale;

            massI.manifestation.draw(x,y);


            if (massI.name) {
                ctx.font = "14px Arial";
                ctx.fillStyle = 'white';
                ctx.fillText(massI.name, x + massI.radius + 10, y + 4);
            }


            // if (x < params.drawingParams.radius || x > width - params.drawingParams.radius) massI.Velocity.x = -massI.Velocity.x;
        
            // if (y < params.drawingParams.radius || y > height - params.drawingParams.radius) massI.Velocity.y = -massI.Velocity.y;
        
        }
        requestAnimationFrame(animate);
    }

    animate();
}

init();



