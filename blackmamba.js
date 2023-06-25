const ROOT = "root";
const SOURCES = "sources";
const PACKAGES = "packages";

const jsonLoader = buildJsonLoader();

export default class BlackMamba {

  #modules;
  #builders;
  #packages;
  #sources;
  #directories;
  #defaultApp;
  #defaultCmd;
  #defaultData;

  loadJson = jsonLoader;

  constructor ({    
    rootDirectory = "", 
    sourcesDirectory = "./sources", 
    packagesDirectory = "./packages", 
    defaultApp, defaultCmd, defaultData } = {} ) 
  {
    this.#modules = new Map();
    this.#builders = new Map();
    this.#packages = new Set();
    this.#sources = new Map();
    this.#directories = new Map();


    this.#defaultApp = defaultApp;
    this.#defaultCmd = defaultCmd;
    this.#defaultData = defaultData;

    this.#modules.set( "getRootDirectory", () => rootDirectory );
    this.#modules.set( "getSourcesDirectory", () => sourcesDirectory );
    this.#modules.set( "getPackagesDirectory", () => packagesDirectory );
    this.#modules.set( "execute", this.execute.bind( this ) );
    this.#modules.set( "register", this.register.bind( this ) );
    this.#modules.set( "hasNotModule", this.hasNotModule.bind( this ) );
    this.#modules.set( "getModule", this.getModule.bind( this ) );   

    if ( defaultApp ) {
      isString( "defaulApp", defaultApp );
      hasValue( "defaultApp", defaultApp );
      isString( "defaulCmd", defaultCmd );
      hasValue( "defaultCmd", defaultCmd );
      
      this.#modules.set( "executeWithFallback", this.executeWithFallback.bind( this ) ); 
    }

    this.#directories.set( ROOT, rootDirectory );
    this.#directories.set( SOURCES, sourcesDirectory );
    this.#directories.set( PACKAGES, packagesDirectory );
  }

  get rootDirectory () { return this.#directories.get( ROOT ); }
  get packagesDirectory () { return this.#directories.get( PACKAGES ); }
  get sourcesDirectory () { return this.#directories.get( SOURCES ); }

  hasNotModule ( id ) { return !this.#modules.has( id ); }
  getModule ( id ) { return this.#modules.get( id ); }
  listModules () { return this.#modules.keys(); }

  async run ( packages = [] ) {
     for ( const { pkg, cmd, data } of packages ) {
       await this.execute( pkg, cmd, data );
    }     
  }


  async execute ( nextApp = "", cmd = "", data ) {
            
    isString( "nextApp", nextApp );
    hasValue( "nextApp", nextApp );
    isString( "cmd", cmd );
    hasValue( "cmd", cmd );

    if ( !this.#modules.has( nextApp ) )
        await this.register( nextApp )

    const app = this.#modules.get( nextApp );

    return app[cmd]( data );

  }

  async executeWithFallback ( nextApp = "", cmd = "", data ) {
                
      if ( !this.#modules.has( nextApp ) ) {
          try { 
          
              await this.register( nextApp );
          
          } catch ( _err ) {
            
              console.log(`App "${nextApp}" not found, using as fallback "${this.#defaultApp}" instead`);
              
              nextApp = this.#defaultApp;
              cmd = this.#defaultCmd;
              data = this.#defaultData;
          
          }
      }

      return this.execute( nextApp, cmd, data );
  
  }

  async loadPackage ( path = "" ) {
      
    const packagePath = path.startsWith("/") ?
        this.packagesDirectory + path + ".json"
        :
        this.packagesDirectory + "/" + path + ".json";
    
    try {
        
        console.log(`loading package ${packagePath}`);

        const pkg = await this.loadJson( packagePath );
        this.#packages.add( path );
        return pkg;

    } catch ( error ) {
        throw new Error(`package.load() Error: package path ${packagePath} does not exist or an error occured while loading.\nError: ${error}`);
    }

  }


  async import ( sourcePath ) {
    
    if ( this.#sources.has( sourcePath ) ) 
      return this.#sources.get( sourcePath );

    try {
        const source = await import( this.sourcesDirectory + sourcePath );
        this.#sources.set( sourcePath, source );
        return source;
    } catch ( error ) {
        throw new Error(`source ${sourcePath}\ncould not be found or an error occured while importing.\nERROR: ${error}`);
    }   

  } 


  async register ( id = "", build = true ) {

    // lets try first to get an already registered module or builder
    if ( this.#packages.has( id ) ) {
      const moduleOrBuilder = build ? this.#modules.get( id ) : this.#builders.get( id );

      if ( moduleOrBuilder )
        return moduleOrBuilder;
    }

    // then if it is not yet registered
    const pkg = await this.loadPackage( id );
    const { builder, source, factorySettings, dependencies } = pkg;

    if ( source ) {

      const deps = await this.#getDependencies( dependencies ) ;
      const { factory } = await this.import( source );
      const Builder = this.#registerBuilder( id, factory, deps );
        
      if ( build )
        return this.#createModuleFromBuilder( id, id, factorySettings );

      return Builder;
    
    } 

    if ( builder ) {
      return await this.#createModuleFromBuilder( id, builder, factorySettings );
    }

    throw new Error(`package ${id} has no source or builder`);
  }

  async #createModuleFromBuilder ( moduleID = "", builderId = "", factorySettings ) {

    if ( !this.#builders.has( builderId ) )
      await this.register( builderId, false );

    const Builder = this.#builders.get( builderId );
    const mod = Builder.applySettings( factorySettings ).build();

    this.#modules.set( moduleID, mod );

    return mod;

  }

  #registerBuilder ( id, factory, factoryDependencies ) {
      const Builder = BlackMamba.createBuilder( factory ).inject( factoryDependencies );
      this.#builders.set( id, Builder );
  
      return Builder;
  }

  async #getDependencies ({ packages = [], sources = [] } = {}) {

    const deps = {};

    if ( Array.isArray( packages ) && packages.length > 0 ) {
      for ( const pkg of packages ) {
         const { id, name, build } = this.#parseDependencies( pkg );
         
         if ( !this.#modules.has( id ) )
            await this.register( id, build);

          deps[name] = modules.get( id ); 
      }

    }

    // allow to work with none BlackMamba source modules
    if ( Array.isArray( sources ) && sources.length > 0 ) {
      for ( const source of sources ) {
        const { id, name, method } = this.#parseDependencies( source );
        const mod = await this.import( id );
        
        // if no name provided use method as the name
        // it means it is iso with the name of the method of the source module
        name = name || method;
        deps[name] =  method ? mod[method] : mod.default ? mod.default : s;  

      }
      
    }

    return deps;

  }

  #parseDependencies ( packageID, dependency ) {

    let id, name, method, build;

    if ( typeof dependency === "string" ) {
        id = dependency;
        name = dependency;
    } else {
        id = dependency.pkg || dependency.source;
        name = dependency.name;
        build = dependency.build || true;
        method = dependency.method;
    }

    if ( name === undefined ) 
        throw new Error(`Package error for ${packageID}\n"name" is not defined for dependency ${id}`);
   
    return { id, name, method, build };
  }


  static createBuilder ( factory ) {

    let dependencies, settings;
    
    return {
        
        inject ( factoryDependencies ) {
            dependencies = factoryDependencies;
            return this;
        },
        
        applySettings ( factorySettings ) {
            settings = factorySettings;
            return this;
        },
        
        build () {
            return factory( dependencies )( settings );
        },
        
    };
    
  } 

}


function buildJsonLoader () {
    
    try {
        if ( Deno !== undefined ) {
            console.log('using Deno.readTextFile to load json');
            return async ( path ) =>  {
                const json = await Deno.readTextFile( path );
                return JSON.parse( json );
            }
        }   
    } catch {}

    if ( window.__TAURI__ ) {
        console.log(`using "import" to load json`);

        return async ( path ) => {
            const json = await import( path, { assert : { type: "json" } } );
            return json;
        }
    }
    
    console.log('using "fetch" to load json');

    // use fetch as fallback
    return async ( path ) => {
        const response = await fetch( path );
        const json = await response.json();
        return json;
    }
    
} 


function isString ( property, value ) {
    if ( typeof value != "string" )
        throw new Error(`execute() Error: ${property} parameter must be a none empty string. Received: "${value}" of type ${typeof value} `);
}


function hasValue( property, value ) {
    if ( value.length === 0 )
        throw new Error(`execute() Error: ${property} parameter must be a none empty string.`);

}
