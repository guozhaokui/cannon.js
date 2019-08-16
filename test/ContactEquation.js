import Body from '../src/objects/Body';
import Vec3 from '../src/math/Vec3';
import ContactEquation from '../src/equations/ContactEquation';

export function construct(test) {
    const bodyA = new Body();
    const bodyB = new Body();
    new ContactEquation(bodyA, bodyB);
    test.done();
}

export function getImpactVelocityAlongNormal(test) {
    const bodyA = new Body({
        position: new Vec3(1,0,0),
        velocity: new Vec3(-10,0,0)
    });
    const bodyB = new Body({
        position: new Vec3(-1,0,0),
        velocity: new Vec3(1,0,0)
    });
    const contact = new ContactEquation(bodyA, bodyB);
    contact.ni.set(1,0,0);
    contact.ri.set(-1,0,0);
    contact.rj.set(1,0,0);
    const v = contact.getImpactVelocityAlongNormal();
    test.equal(v, -11);
    test.done();
}
