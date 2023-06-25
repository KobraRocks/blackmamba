import { assert } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import BlackMamba from "./blackmamba.js";


const blackmamba = new BlackMamba({
    rootDirectory: Deno.cwd(),
});

Deno.test("Root directory", () => {

    assert( blackmamba.rootDirectory === Deno.cwd() );

});

Deno.test("Packages directory", () => {

    assert( blackmamba.packagesDirectory === "./packages" );

});

Deno.test("Sources directory", () => {

    assert( blackmamba.sourcesDirectory === "./sources" );

});


Deno.test("load a json package in root directory /packages", async () => {

    const pkg = await blackmamba.loadPackage( "test" );

    assert( pkg.name === "test");

});

Deno.test("load a json package in a subfolder like /packages/subfolder", async () => {

    const pkg = await blackmamba.loadPackage( "/subfolder/test" );

    assert( pkg.name === "test");

});

Deno.test("Import a source js file", async () => {
    
    const source = await blackmamba.import( "/my-source.js" );

    assert( source.hello === "world");
});

Deno.test("Import a wrong source js file", async () => {
    
    try {
        await blackmamba.import( "/my----source.js" );
    } catch ( error ) {
        assert( error instanceof Error );
    }

});

Deno.test("has not module hello", () => {
    
    assert( blackmamba.hasNotModule( "hello" ) );
});

Deno.test("register a package and build it", async () => {
    const module = await blackmamba.register( "test" );

    assert( module() === "I a module");
});

Deno.test("register a package and keep the builder", async () => {
    const message = "I came from a builder";
    const Builder = await blackmamba.register( "builder", false );
    const module = Builder.applySettings({ message }).build();

    assert( module() === message );
});


Deno.test("get module Test", () => {
    
    assert( blackmamba.getModule( "test" ) );
});

Deno.test("try to register no package -> empty package name param", async () => {
    try {
         await blackmamba.register();
    } catch ( error ) {
        assert( error instanceof Error );
    }
});

Deno.test("execute a command from a package", async () => {
    await blackmamba.register("greeter");
    const result = await blackmamba.execute("greeter", "greet", "John");

    assert( result === "Hello John" );
});

Deno.test("Execute with fallback", async () => {

    const bm = new BlackMamba({
        rootDirectory: Deno.cwd(),
        defaultApp: "greeter",
        defaultCmd: "greet",
        defaultData: "Nobody",
    });

    const result = await bm.executeWithFallback("shouter", "shouter", "Hey You!!!");

    assert( result === "Hello Nobody");

});

Deno.test("run packages", async () => {

    const bm = new BlackMamba({
        rootDirectory: Deno.cwd(),
    });
    try{
        await bm.run([{pkg: "greeter", cmd:"greet", data:"John"}]);
    } catch ( error ) {
        console.log(error);
    }
    console.log("List of modules: ");

    for (const module of bm.listModules() ) {
        console.log("- "+ module);
    }

    const greeter = bm.getModule("greeter");
    const result = greeter.greet("John");
    assert( result === "Hello John");


});
