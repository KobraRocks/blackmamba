export function factory ( _dependencies) {

    return ({ message = "I a module" } = {}) => {
        
        return () => message;

    }

}