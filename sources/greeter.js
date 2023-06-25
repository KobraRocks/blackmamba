export function factory ( _dependencies ) {
    return ( _factorySettings ) => {
        return Object.freeze({
            greet ( name ) { return `Hello ${name}`; },
        });
    }
}