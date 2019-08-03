
/**
 * Defines a physics material.
 * @author schteppe
 */
export default class Material {
    static idCounter = 0;
    name: string;

    id = Material.idCounter++;

    /**
     * Friction for this material. If non-negative, it will be used instead of the friction given by ContactMaterials. If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
     */
    friction = -1;

    /**
     * Restitution for this material. If non-negative, it will be used instead of the restitution given by ContactMaterials. If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
     */
    restitution = -1;

    constructor(options?: any) {
        let name = '';
        options = options || {};

        // Backwards compatibility fix
        if (typeof (options) === 'string') {
            name = options;
            options = {};
        } else if (typeof (options) === 'object') {
            name = '';
        }

        this.name = name;
        this.friction = typeof (options.friction) !== 'undefined' ? options.friction : -1;
        this.restitution = typeof (options.restitution) !== 'undefined' ? options.restitution : -1;
    }
}
