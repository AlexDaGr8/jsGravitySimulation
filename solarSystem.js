/**
 * UNITS TO BE USED
 * Distance: Astronomical units
 * Mass: Solar masses
 * Time: Years
 */
import Manifestation from './manifestation.js';

export default class SolarSystem {
    solarMass = 1988500; // 10^24kg
    constructor({ g, dt, softeningConstant, drawingParams }) {
        this.g = g;
        this.dt = dt;
        this.softeningConstant = softeningConstant;
        this.drawingParams = drawingParams;
        this.year = 365.25;
        this.masses = {};
    }

    static init(params) {
        return (async function () {
          let ss = new SolarSystem(params)
          // Do async stuff
          await ss.build()
          // Return instance
          return ss
        }())
    }

    async build() {
        this.masses = await this.getPlanets();
    }
    
    async getPlanets() {
        return new Promise((res, rej) => {
            fetch('./celestialBodies.json')
                .then(response => response.json())
                .then(data => {
                    const sunMass = data.find(d => d.name === 'Sol').mass;
                    const sunRadius = data.find(d => d.name === 'Sol').radius;
                    console.log('sunMass', sunMass);
                    data.forEach(d => {
                        d.mass = d.mass/sunMass;
                        let newRadius = d.radius/sunRadius;
                        d.radius = newRadius === 1 ? newRadius * 20 : newRadius * 400;
                        d.manifestation = new Manifestation(Object.assign(this.drawingParams, { radius: d.radius }));
                        d.Velocity.x *= this.year;
                        d.Velocity.y *= this.year;
                        d.Velocity.z *= this.year;
                    })
                    console.log(data);
                    res(data);
                });
        });
    }

    updatePositionVectors() {
        const massesLen = this.masses.length;
    
        for (let i = 0; i < massesLen; i++) {
            const massI = this.masses[i];
            massI.Position.x += massI.Velocity.x * this.dt;
            massI.Position.y += massI.Velocity.y * this.dt;
            massI.Position.z += massI.Velocity.z * this.dt;
        }
        return this;
    }

    updateVelocityVectors() {
        const massesLen = this.masses.length;
    
        for (let i = 0; i < massesLen; i++) {
            const massI = this.masses[i];
            massI.Velocity.x += massI.Acceleration.x * this.dt;
            massI.Velocity.y += massI.Acceleration.y * this.dt;
            massI.Velocity.z += massI.Acceleration.z * this.dt;
        }
        return this;
    }

    /**
     * f = g * massJ.m / dSq * (dSq + s)^1/2
     * g: 39.5 (gravitational constant)
     * massJ.m: mass of massJ
     * dSq: sum of the squares of the distance between massI and massJ
     * s: softeningConstant
     */
    updateAccelerationVectors() {
        const massesLen = this.masses.length;
  
        for (let i = 0; i < massesLen; i++) {
            let acceleration = {
                x: 0,
                y: 0,
                z: 0
            };

            let massI = this.masses[i];

            for (let j = 0; j < massesLen; j++) {
                if (i !== j) {
                    const massJ = this.masses[j];

                    const d = {
                        x: massJ.Position.x - massI.Position.x,
                        y: massJ.Position.y - massI.Position.y,
                        z: massJ.Position.z - massI.Position.z
                    };

                    const distSq = (d.x * d.x) + (d.y * d.y) + (d.z * d.z);

                    let f = (this.g * massJ.mass) / (distSq * Math.sqrt(distSq + this.softeningConstant));

                    acceleration.x += d.x * f;
                    acceleration.y += d.y * f;
                    acceleration.z += d.z * f;
                }
            }

            massI.Acceleration.x = acceleration.x;
            massI.Acceleration.y = acceleration.y;
            massI.Acceleration.z = acceleration.z;
        }
        return this;
    }
}
