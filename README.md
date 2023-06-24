## BlackMamba Class

The `BlackMamba` class is a module management and execution framework that allows developers to register modules, load packages, and execute commands dynamically. It provides a flexible and extensible architecture for building applications with modular components.


BlackMamba main features:
1. Modularity: BlackMamba promotes a modular approach to application development. It allows you to break down your code into reusable modules, making it easier to manage and maintain complex projects.
2. Dependency Injection: BlackMamba supports dependency injection, which helps decouple modules and allows for easy swapping of dependencies. This promotes code reusability and testability.
3. Dynamic Module Loading: BlackMamba enables dynamic loading of modules, allowing you to load and register modules at runtime. This provides flexibility in managing module dependencies and reduces the initial loading time of an application.
4. Configuration-based Setup: With BlackMamba, you can configure modules and their dependencies using JSON files or other configuration mechanisms. This simplifies the setup process and allows for easy customization and extension of the application.
5. Error Handling: BlackMamba provides mechanisms for handling module loading and registration errors. It helps identify missing or misconfigured modules, making it easier to troubleshoot issues and improve overall application stability.

### Usage

To use the `BlackMamba` class, you need to create an instance of it by calling the constructor with an optional configuration object:

```javascript
const blackMamba = new BlackMamba({
  rootDirectory: "/path/to/root",
  sourcesDirectory: "/path/to/sources",
  packagesDirectory: "/path/to/packages",
  defaultApp: "defaultApp",
  defaultCmd: "defaultCmd",
  defaultData: { /* default data object */ }
});
```

#### Configuration Options

- `rootDirectory` (optional): The root directory of the application. Defaults to an empty string.
- `sourcesDirectory` (optional): The directory where source files are located. Defaults to "/sources".
- `packagesDirectory` (optional): The directory where package files are located. Defaults to "/packages".
- `defaultApp` (optional): The default application/module to use for fallback execution. If specified, the `executeWithFallback` method will be available.
- `defaultCmd` (optional): The default command to execute when using fallback execution.
- `defaultData` (optional): The default data object to pass when using fallback execution.

### Properties

- `rootDirectory`: Returns the root directory of the application.
- `packagesDirectory`: Returns the packages directory.
- `sourcesDirectory`: Returns the sources directory.

### Methods

- `execute(nextApp, cmd, data)`: Executes a command in the specified application/module. It returns a Promise that resolves to the result of the command execution.
  - `nextApp`: The ID of the next application/module to execute.
  - `cmd`: The command to execute in the application/module.
  - `data` (optional): The data object to pass to the command.

- `executeWithFallback(nextApp, cmd, data)`: Executes a command in the specified application/module with fallback support. If the specified application/module is not found, it falls back to the default application/module, command, and data specified during initialization. It returns a Promise that resolves to the result of the command execution.
  - `nextApp`: The ID of the next application/module to execute.
  - `cmd`: The command to execute in the application/module.
  - `data` (optional): The data object to pass to the command.

- `loadPackage(path)`: Loads a package file from the specified path and returns a Promise that resolves to the parsed JSON content of the package file.
  - `path`: The path to the package file.

- `import(sourcePath)`: Imports a JavaScript source file dynamically and returns a Promise that resolves to the imported source.
  - `sourcePath`: The path to the source file.

- `register(id, build)`: Registers a module or builder with the specified ID. If the module/builder is already registered, it returns the existing one; otherwise, it loads the package, imports the source (if available), and registers the builder or creates a module from the builder. It returns a Promise that resolves to the registered module or builder.
  - `id`: The ID of the module or builder to register.
  - `build` (optional): A boolean value indicating whether to build the module immediately. Defaults to `true`.

- `run(packages)`: Executes a list of packages by calling the `execute` method for each package. It accepts an array of package objects, where each object contains

## BlackMamba Builder

In the BlackMamba framework, a builder is a construct that facilitates the creation and configuration of modules. Builders provide a fluent API to set up and customize modules with specific settings and dependencies.

A builder encapsulates the logic for constructing and configuring a module, allowing developers to define the module's behavior in a declarative and structured manner. Builders promote modular design and enable easy composition of complex modules by specifying dependencies and settings.

### BlackMamba Module Factory
A BlackMamba Module Factory is split in 3 layers
* the first layer is where dependencies are injected
* the second layer is where factory settings can be applied
  * it is a convinient way to avoid hardcoding values in functions
* the third layer is the final module, a function or an object


```javascript
// myFunctionFactory.js

export function factory ( _dependencies ) {

    return ( _factorySettings ) {

        return () => { /* do something */}

    }

}

// myObjectFactory.js

export function factory ( _dependencies ) {

    return ( _factorySettings ) {
        
        // a mdodule with an api
        return Object.freeze({
            myMethodA () {},
            myMethodB () {}
        });

    }

}

```

It makes it easy to create several instance of a module with different factory settings and even with dependencies with different implementation, while keeping the logic of the module.

```javascript
// the same logic exposed by the module can be applyed 
// to a wide range of data in an application  
export function factory ({ validate, persist }) {

    // how data is validated and persisted becomes a detail

    return ({ successMessage, errorMessage }) => {

        // which data model is passed is not important
        // only the logic is.
        return async ( data ) => {

            if ( validate( data ) )
                try {
                    await persist( data );
                    return { result: successMessage };
                } catch ( persistError ) {
                    return { error: persistError };
                }

            return { error: errorMessage };
           
        }
    }
}
``` 
The provided example demonstrates the advantage of using a BlackMamba module factory. The factory function accepts an object with dependencies `validate` and `persist` and returns a module function.

The module function takes an object with `successMessage` and `errorMessage` as parameters and returns an asynchronous function that performs a specific logic on the provided data.

The advantage of this approach is that the module's logic can be applied to a wide range of data in an application, while the details of how the data is validated and persisted are abstracted away. This promotes reusability and modularity in your application.

Here's an example of how you can use the BlackMamba module factory to create modules for different data validation and persistence scenarios:

```javascript
// Import the BlackMamba module factory
import { factory } from './myModuleFactory';

// Define validation and persistence functions for specific data types
function validateUser(data) {
  // Validation logic for user data
  // ...
}

function persistUser(data) {
  // Persistence logic for user data
  // ...
}

function validateProduct(data) {
  // Validation logic for product data
  // ...
}

function persistProduct(data) {
  // Persistence logic for product data
  // ...
}

// Create module functions using the factory
const userModule = factory({
  validate: validateUser,
  persist: persistUser,
})({
  successMessage: 'User data persisted successfully',
  errorMessage: 'Invalid user data',
});

const productModule = factory({
  validate: validateProduct,
  persist: persistProduct,
})({
  successMessage: 'Product data persisted successfully',
  errorMessage: 'Invalid product data',
});

// Execute the module functions with different data
const userResult = await userModule({ /* user data */ });
console.log(userResult); // Output: { result: 'User data persisted successfully' }

const productResult = await productModule({ /* product data */ });
console.log(productResult); // Output: { error: 'Invalid product data' }
```

In this example, we define validation and persistence functions `validateUser`, `persistUser`, `validateProduct`, and `persistProduct` for user and product data, respectively.

We then create module functions `userModule` and `productModule` using the `factory` function. Each module function is configured with the appropriate validation and persistence functions and success/error messages.

Finally, we execute the module functions with different data, which triggers the logic encapsulated within the modules. The modules validate the data, persist it if valid, and return a result object indicating success or error.

By using the BlackMamba module factory, you can encapsulate reusable logic in modules and easily apply it to different data scenarios by configuring the dependencies and settings of the modules.

### Builder dependencies

Dependencies is an object for which each keys is a method
```javascript
const dependencies = {
    validate ( value ) { /* validation logic here*/ },
    persist ( value ) { /* persistence logic */ }
};
```

### Usage

To create a builder in BlackMamba, you typically follow these steps:

1. Define a factory function that returns a module instance. The factory function can accept dependencies and settings as parameters.

2. Use the `BlackMamba.createBuilder(factory)` static method to create a new builder instance. Pass the factory function as an argument to the method.

3. Use the builder's methods to configure the module. These methods typically provide settings or inject dependencies into the factory function.

4. Call the `build()` method on the builder to construct the module based on the specified configuration. The `build()` method invokes the factory function with the provided dependencies and settings and returns the module instance.

### Example

Here's an example of creating and using a builder in the BlackMamba framework:

```javascript
// Define a module factory function
function factory ({ validate }) {

  return ({ defaultMessage }) {

    return ( name ) => {

        validate( name ) ?
            console.log(`Hi ${name} :)`)
            :
            console.log( defaultMessage );

    };
  };
}

// Create a builder using the factory function
const greetBuilder = BlackMamba.createBuilder( factory );

// Inject dependencies
greetBuilder.inject({ validate: ( name ) => name.length > 0 });

// Apply factorySettings
greetBuilder.applySettings({ defaulMessage: "Name not valid" });

// Build the module
const greet = myModuleBuilder.build();

// Execute the module
greet( "John" ); // Output: "Hi John"
gree(); // Output: "Name not valid"
```
Once the module is built, we can execute the `greet` method on the module, which logs a greeting to the console.

Builders provide a convenient and structured way to create and configure modules within the BlackMamba framework, enabling modular and flexible application development.

# BlackMamba Class

## `register(id: string, build: boolean = true): Promise<any>`

The `register` method is used to register a module or builder with the `BlackMamba` instance. It allows you to dynamically load and initialize modules or builders based on their IDs.

### Parameters:
- `id` (required): A string representing the ID of the module or builder to register.
- `build` (optional): A boolean indicating whether to build the module or just register the builder. Defaults to `true`.

### Returns:
- `Promise<any>`: A promise that resolves to the registered module or builder.

### Example:

```javascript
// Create a new instance of BlackMamba
const blackMamba = new BlackMamba();

// Register a module with ID "myModule"
blackMamba.register("myModule")
  .then((module) => {
    // Module is successfully registered
    console.log(module);
  })
  .catch((error) => {
    // Error occurred while registering the module
    console.error(error);
  });

// Register a builder with ID "myBuilder" without building the module
blackMamba.register("myBuilder", false)
  .then((builder) => {
    // Builder is successfully registered
    console.log(builder);
  })
  .catch((error) => {
    // Error occurred while registering the builder
    console.error(error);
  });
```

In this example, the `register` method is used to register a module with the ID "myModule" and a builder with the ID "myBuilder". The first call to `register` will build the module, while the second call will only register the builder without building the module. The promises returned by the `register` method can be used to handle the successful registration or any errors that may occur during the process.

Certainly! Here's the documentation for the `execute` method of the `BlackMamba` class, including an example:

## `execute(nextApp: string, cmd: string, data?: any): Promise<any>`

The `execute` method is used to execute a specific command (`cmd`) on a registered module (`nextApp`) with optional data (`data`). It allows you to trigger the execution of a specific functionality within a module.

### Parameters:
- `nextApp` (required): A string representing the ID of the module to execute the command on.
- `cmd` (required): A string representing the command to execute on the module.
- `data` (optional): Any additional data to be passed to the command. It can be of any type.

### Returns:
- `Promise<any>`: A promise that resolves to the result of the executed command.

### Example:

```javascript
// Create a new instance of BlackMamba
const blackMamba = new BlackMamba();

// Register a module with ID "myModule"
blackMamba.register("myModule")
  .then(() => {
    // Execute the "doSomething" command on the "myModule" module
    return blackMamba.execute("myModule", "doSomething");
  })
  .then((result) => {
    // Command executed successfully, handle the result
    console.log(result);
  })
  .catch((error) => {
    // Error occurred while executing the command or registering the module
    console.error(error);
  });
```

In this example, the `execute` method is used to execute the "doSomething" command on the registered module with the ID "myModule". The promise returned by the `execute` method can be used to handle the successful execution of the command and obtain the result, or to handle any errors that may occur during the execution or module registration process.

## `executeWithFallback(nextApp: string, cmd: string, data?: any): Promise<any>`

The `executeWithFallback` method is used to execute a specified command on a module in the `BlackMamba` instance. If the specified module does not exist, it falls back to executing the command on a default module.

### Parameters:
- `nextApp` (required): A string representing the ID of the module to execute the command on.
- `cmd` (required): A string representing the command to execute on the module.
- `data` (optional): Any additional data to pass to the module's command.

### Returns:
- `Promise<any>`: A promise that resolves to the result of executing the command on the module.

### Example:

```javascript
// Create a new instance of BlackMamba
const blackMamba = new BlackMamba({
  defaultApp: "defaultModule",
  defaultCmd: "defaultCommand",
  defaultData: { message: "Fallback data" }
});

// Execute a command on a module with fallback
blackMamba.executeWithFallback("myModule", "myCommand", { value: 42 })
  .then((result) => {
    // Command executed successfully on the specified module
    console.log(result);
  })
  .catch((error) => {
    // Error occurred while executing the command
    console.error(error);
  });
```

In this example, the `executeWithFallback` method is used to execute the command "myCommand" on the module with the ID "myModule". If the "myModule" does not exist, it falls back to executing the command "defaultCommand" on the "defaultModule" with the fallback data `{ message: "Fallback data" }`. The promise returned by the `executeWithFallback` method can be used to handle the successful execution of the command and obtain the result, or to handle any errors that may occur during the execution process.

## `loadPackage(path: string): Promise<any>`

The `loadPackage` method is used to load a package from a specified path. It loads a JSON file located at the given path and returns the parsed JSON data as a promise.

### Parameters:
- `path` (required): A string representing the path to the package JSON file.

### Returns:
- `Promise<any>`: A promise that resolves to the parsed JSON data of the loaded package.

### Example:

```javascript
// Create a new instance of BlackMamba
const blackMamba = new BlackMamba();

// Load a package from the "/packages/myPackage" path
blackMamba.loadPackage("/myPackage")
  .then((packageData) => {
    // Package loaded successfully, handle the data
    console.log(packageData);
  })
  .catch((error) => {
    // Error occurred while loading the package or the package path does not exist
    console.error(error);
  });
```

In this example, the `loadPackage` method is used to load a package from the "/myPackage" path. The promise returned by the `loadPackage` method can be used to handle the successful loading of the package and obtain the parsed JSON data, or to handle any errors that may occur during the loading process or if the package path does not exist.

## `run(packages: Array<{ pkg: string, cmd: string, data?: any }>): void`

The `run` method is used to run multiple commands on different modules in the `BlackMamba` instance. It accepts an array of packages, where each package specifies the module ID, the command to run, and optional data to pass to the command.

### Parameters:
- `packages` (optional): An array of objects representing the packages to execute. Each package object has the following properties:
  - `pkg` (required): A string representing the ID of the module to run the command on.
  - `cmd` (required): A string representing the command to run on the module.
  - `data` (optional): Any additional data to pass to the module's command.

### Example:

```javascript
// Create a new instance of BlackMamba
const blackMamba = new BlackMamba();

// Register modules
blackMamba.register("moduleA"
});

blackMamba.register("moduleB");

// Define an array of packages to execute
const packages = [
  { pkg: "moduleA", cmd: "commandA" },
  { pkg: "moduleB", cmd: "commandB", data: "Hello from package" }
];

// Run the packages
blackMamba.run(packages);
```

In this example, the `run` method is used to execute multiple commands on different modules. The `register` method is used to register the `moduleA` and `moduleB` modules with their respective commands. The `run` method accepts an array of packages, where each package specifies the module ID (`pkg`) and the command to run (`cmd`). In the second package, `data` is provided as optional additional data to pass to the `commandB` command. The `run` method iterates over each package and executes the specified command on the corresponding module using the `execute` method.