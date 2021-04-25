# Hostel 🏨 
Nomad Client for NodeJS. 

Includes built-in paramater, querystring and body checking - helps in preventing fires.

## Setup

1) Install
```shell
npm install LKNSI/hostel
```

2) Construct
```javascript
const Hostel = require('LKNSI/hostel')
const fs = require('fs')
const main = async () => {
    var nomadAPI = new Hostel({
        connection:{
          hostname: "...", //Don't include the protocol (i.e. https://) here.
          port: "4646",
          sslEnabled: true, //Use HTTPS
          ssl:{
             privateKey: fs.readFileSync('/secrets/...'),
             cert: fs.readFileSync('/secrets/...'),
             ca: fs.readFileSync('/secrets/...'),
          },
          ignoreSecretTLSWarning: false, // Prevent Client from sending SecretID if HTTP is accidently selected. Set to true to ignore.
          ignoreTLSWarning: false // Ignore HTTPS Unauthorized warning by setting to true.
        }
    })
}
main()
```
3) Go!
```javascript
...(async function)

await nomadAPI.jobs.list().then(k => {console.log(k)})

...
```


## Features
* As close to 1:1 binding with offical REST API bindings.
* Currently supporting: 
  * Allocations
    * List
    * Read
    * Stop
    * Signal
    * Restart
  * Jobs
    * List
    * Read
    * Create
    * Parse
    * Update
    * Stop
    * Revert
    * Plan
  * Nodes
    * List
    * Read
    * Drain
    * Purge
    * Eligibility

## API Documentation

All commands follow a chainable hierarchy to their root node. Every function returns an async promise.

```javascript
  Hostel.prototype.<api>.<function>()
  ...
  nomadAPI.jobs.list()
  ...
  nomadAPI.allocations.read()
  ...
  nomadAPI.nodes.drain()

```

URI Parameters, Body Properties, and Query String Parameters are flattened with this API. To ensure this isn't a problem, `schema.js` that is included in this library ensures each variable is placed in the right location to make the request to your Nomad Cluster.

* Payload Body Properties retain the same Capitlization and spelling as displayed on the REST Documentation
* URI Parameters now use a "camelCase" type setting. This means for example `node_id` becomes `nodeId`, `job_id` becomes `jobId`, `allocation_id` becomes `allocationId`.
* Query String Parameters retain the same Capitlization and spelling as displayed on the REST Documentation

```javascript
... //Example

    nomadAPI.nodes.eligibility({
        nodeId: "00000-0000-0000-00000",
        Eligibility: "eligible",
    })
    
...

```

All functions (except .hostel chain functions (i.e. `nomadAPI.hostel.supportedActions()`) return an array with two elements. A boolean success indicator, and the response from the Nomad Cluster as a preparsed Array containing Object(s).

```javascript
... //Fetching Jobs from the Nomad Cluster
    
    await nomadAPI.jobs.list().then(k => {console.log(k)})

... //Example Response
    
    [
        true, 
        [
            {
              ID: 'ice-cream-machine-magic',
              ParentID: '',
              Name: 'ice-cream-machine-magic',
              Namespace: '',
              Datacenters: [...],
              Multiregion: null,
              Type: 'service',
              Priority: 100,
              Periodic: false,
              ParameterizedJob: false,
              Stop: false,
              Status: 'running',
              StatusDescription: '',
              JobSummary: {...},
              CreateIndex: 57,
              ModifyIndex: 65306,
              JobModifyIndex: 65287,
              SubmitTime: 1619192045653244200
            },
            ...
        ]
    ]
...

```

