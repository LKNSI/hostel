# Hostel 🏨 
[Nomad](https://www.nomadproject.io/) Client for NodeJS. 

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
        },
        timeouts:{
          request: 20000 // Timeout in MS for requests made to the Nomad Cluster.
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
* As close to 1:1 binding with official REST API bindings.
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
    * Create // Standard JSON Object (Stringification not required).
    * Parse // Pass HCL/HCL2 stringified.
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

* Payload Body Properties retain the same Capitlization and spelling as displayed on the REST Documentation.
* URI Parameters now use a "camelCase" type setting. This means for example `node_id` becomes `nodeId`, `job_id` becomes `jobId`, `alloc_id` becomes `allocId`.
* Query String Parameters retain the same Capitlization and spelling as displayed on the REST Documentation.

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
## Adding Features

If you wish to add features I haven't gotten to yet, you can pretty easily do so like:

i) Fork the repo.

ii) Add the new feature chain to `schema.js`

iii) Add a new Function property to the API Chain within the Class.

iv) Merge back if you're feeling nice.
