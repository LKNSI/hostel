const { axios, http, lodash, https, querystring, Agent } = require('./includes.js')
const { schema } = require('./schema.js')
new Agent({
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000,
    freeSocketTimeout: 30000,
});
class Hostel {
    constructor(init){
        this.hostname = init.connection.hostname
        this.port = init.connection.port
        this.version = init.version ? init.version : "/v1" 
        this.ssl = {
            enabled: init.connection.sslEnabled,
            privateKey: init.connection.ssl ? init.connection.ssl.privateKey ? init.connection.ssl.privateKey : null : null,
            ca: init.connection.ssl ? init.connection.ssl.ca ? init.connection.ssl.ca : null : null,
            cert: init.connection.ssl ? init.connection.ssl.cert ? init.connection.ssl.cert : null : null
        }
        this.connection = {
            request: init.timeouts ? init.timeouts.request ? init.timeouts.request : 20000 : 20000
        }
        this.secretID = (() => {
            if(this.connection.ignoreSecretTLSWarning){
                return init.secretID ? [init.secretID,true] : ["00000",false]
            }else{
                if(this.connection.sslEnabled){
                    return init.secretID ? [init.secretID,true] : ["00000",false]
                }else{
                    return ["00000",false]
                }
            }
        })()
        this.includeSecretID = false
        this.lifecycle = {
            isReady: false,
            isAuthorized: false,
            authIsRejected: false,
            hasSentRequest: false,
            hasIgnoredSecretTLSWarning: this.connection.ignoreSecretTLSWarning,
            hasIgnoredTLSWarning: this.connection.ignoreTLSWarning
        }
        this.request = axios.create({
            baseURL: `${this.ssl.enabled ? "https" : "http"}://${this.hostname}:${this.port}`,
            timeout: this.connection.request,
            headers: {
                "X-Nomad-Token": this.includeSecretID ? this.secretID[0] : "00000"
            },
            httpAgent: new http.Agent({keepAlive: this.connection.keepAlive}),
            httpsAgent: new https.Agent({
                rejectUnauthorized: this.connection.ignoreTLSWarning ? false : true, 
                ca: this.ssl.ca,
                cert: this.ssl.cert,
                key: this.ssl.privateKey
            })
        })
    }

    async lifecycleCheck(action){
        switch(action){
            case "alloc":{
                if(this.lifecycle.isReady && this.lifecycle.isAuthorized && !this.lifecycle.authIsRejected){
                    return [true]
                }else{
                    return [false,[this.lifecycle.isReady ? null : "isReady",this.lifecycle.isAuthorized ? null : "isAuthorized",this.lifecycle.authIsRejected ? null : "authIsRejected"]]
                }
            }
            case "jobs":{
                if(this.lifecycle.isReady && this.lifecycle.isAuthorized && !this.lifecycle.authIsRejected){
                    return [true]
                }else{
                    return [false,[this.lifecycle.isReady ? null : "isReady",this.lifecycle.isAuthorized ? null : "isAuthorized",this.lifecycle.authIsRejected ? null : "authIsRejected"]]
                }
            }
            case "nodes":{
                if(this.lifecycle.isReady && this.lifecycle.isAuthorized && !this.lifecycle.authIsRejected){
                    return [true]
                }else{
                    return [false,[this.lifecycle.isReady ? null : "isReady",this.lifecycle.isAuthorized ? null : "isAuthorized",this.lifecycle.authIsRejected ? null : "authIsRejected"]]
                }
            }
        }
    }
    async initialize(){
        var queryCredentials = async () => {
            return await this.request[schema.ACLTokens.readSelf.type](`${this.version}${schema.ACLTokens.readSelf.path}`)
                .then(k => {
                    if(k.data){
                        if(k.data.AccessorID){
                            return true
                        }else{
                            return false
                        }
                    }
                })
                .catch(k => {
                    return false
                })
        }
        var queryEndpoint = await this.request.options('/').then(k => {return [k,true]}).catch(k => {return [k,false];})
        if(queryEndpoint[1] === true){
            if(queryEndpoint[0].status === 200){
                this.includeSecretID = true
                this.isReady = true
                if(this.secretID[1]){
                    await queryCredentials().then(k => {
                        if(k === true){
                            this.lifecycle.isReady = true
                            this.lifecycle.isAuthorized = true
                        }else{
                            this.lifecycle.authIsRejected = true
                        }
                    })
                }else{
                    this.lifecycle.isReady = true
                    this.lifecycle.isAuthorized = true
                }
            }else{
                this.lifecycle.authIsRejected = true
            }
            return (this.lifecycle.isAuthorized && !this.lifecycle.authIsRejected) ? true : false
        }else{
            console.log(["Failed to reach Nomad Cluster",queryEndpoint[0].response])
            return 
        }
    }
    async makeRequest({path,query,params,body}){
        var invalidRequest = [false,[]]
        var schemaObject = (lodash.get(schema,path))
        if(schemaObject){
            var uri = schemaObject.path ? schemaObject.path : false
            var queryUse = (schemaObject.query.length > 0) ? schemaObject.query : false
            var bodyUse = (schemaObject.query.length > 0) ? schemaObject.body : false
            var paramsUse = ((Object.keys(schemaObject.params)).length > 0) ? schemaObject.params : false
            var includeQuery = (query && queryUse)
            var includeBody = (body && bodyUse)
            var includeParams = (params && paramsUse)
            var renderedParams;
            var renderedAction = schemaObject.action ? schemaObject.action : false
            if(includeQuery){
                var inputQuery = Object.keys(query)
                var queryTest = (queryvalue) => paramsUse.includes(queryvalue)
                var testQuery = await inputQuery.every(queryTest)
                if(!testQuery){
                    invalidRequest[0] = true;
                    invalidRequest.push("QueryString")
                }
            }
            if(includeBody){
                var inputBody = Object.keys(body)
                var bodyTest = (bodyvalue) => bodyUse.includes(bodyvalue)
                var testBody = await inputBody.every(bodyTest)
                if(!testBody){
                    invalidRequest[0] = true;
                    invalidRequest.push("Body")
                }
            }
            if(includeParams){
                var inputParams = Object.keys(params)
                var paramTest = (paramvalue) => paramsUse.includes(paramvalue)
                var testParam = await inputParams.every(paramTest)
                var stringParam = ""
                if(!testParam){
                    invalidRequest[0] = true;
                    invalidRequest.push("Params")
                }else{
                    for(const el of inputParams){
                        stringParam += `/${params[el]}`
                    }
                    renderedParams = stringParam;
                }
            }
            if(!invalidRequest[0] && uri){
                var renderQuery = includeQuery ? querystring.stringify(query) : false
                var renderBody = includeBody ? true : false
                var request;
                if(["put","delete","patch","get","options"].includes(schemaObject.type)){
                    request = await this.request[schemaObject.type](`${this.version}${schemaObject.path}${renderedParams ? renderedParams : ""}${renderedAction ? `/${renderedAction}` : ""}${renderQuery ? `/${renderQuery}` : ""}`,{
                        data: body ? body : null
                    }).catch(k => {console.log(k);return false;})
                }else{
                    request = await this.request[schemaObject.type](`${this.version}${schemaObject.path}${renderedParams ? renderedParams : ""}${renderedAction ? `/${renderedAction}` : ""}${renderQuery ? `/${renderQuery}` : ""}`,body ? body : {}).catch(k => {console.log(k);return false;})
                }
                if(request){
                    if(request.status >= 200 && request.status < 300){
                        return [true,request.data ? request.data : null]
                    }
                }else{
                    return [false,request.data ? request.data : null];
                }
            }else{
                return [false,invalidRequest];
            }
        }else{
            return [false,null]
        }
    }

    allocations = {
        list: async (options) => {
            var cl = await this.lifecycleCheck("alloc")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'allocations.list',
                    query: options ? options.query ? options.query : null : null,
                    body: options ? options.body ? options.body : null : null,
                    params: null
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        read: async (options) => {
            var cl = await this.lifecycleCheck("alloc")
            if(cl[0] === true && (options ? options.allocationId ? true : false : false)){
                var request = await this.makeRequest({
                    path: 'allocations.read',
                    query: false,
                    body: false,
                    params: {alloc_id: options.allocationId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        stop: async (options) => {
            var cl = await this.lifecycleCheck("alloc")
            if(cl[0] === true && (options ? options.allocationId ? true : false : false)){
                var request = await this.makeRequest({
                    path: 'allocations.stop',
                    query: false,
                    body: false,
                    params: {alloc_id: options.allocationId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        signal: async (options) => {
            var cl = await this.lifecycleCheck("alloc")
            if(cl[0] === true && (options ? options.allocationId ? true : false : false)){
                var request = await this.makeRequest({
                    path: 'allocations.stop',
                    query: false,
                    body: {Signal: options.signal, Task: options.task},
                    params: {alloc_id: options.allocationId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        restart: async (options) => {
            var cl = await this.lifecycleCheck("alloc")
            if(cl[0] === true && (options ? options.allocationId ? true : false : false)){
                var request = await this.makeRequest({
                    path: 'allocations.restart',
                    query: false,
                    body: false,
                    params: {alloc_id: options.allocationId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        exec: async () => {
            console.log("Currently unsupported.")
            return [false,null]
        },
    }

    hostel = {
        supportedActions: async () => {
            var actions = {}
            var tlActions = Object.keys(schema)
            for(const el of tlActions){
                actions[el] = []
                actions[el] = Object.keys(schema[el])
            }
            return actions
        }
    }

    jobs = {
        list: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.list',
                    query: options ? options.query ? options.query : null : null,
                    body: null,
                    params: null
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        read: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.read',
                    query: null,
                    body: null,
                    params: {job_id: options.jobId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        create: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.create',
                    query: null,
                    body: {
                        Job: options.job, 
                        EnforceIndex: options.enforceIndex ? options.EnforceIndex : null,
                        JobModifyIndex: options.JobModifyIndex ? options.JobModifyIndex : null,
                        PolicyOverride: options.PolicyOverride ? options.PolicyOverride : null,
                        PreserveCounts: options.PreserveCounts ? options.PreserveCounts : null
                    },
                    params: null
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        parse: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.create',
                    query: null,
                    body: {
                        JobHCL: options.JobHCL ? options.JobHCL : false,
                        Canonicalize: options.Canonicalize ? options.Canonicalize : false
                    },
                    params: null
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        update: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.update',
                    query: null,
                    body: {
                        Job: options.job, 
                        EnforceIndex: options.enforceIndex ? options.EnforceIndex : null,
                        JobModifyIndex: options.JobModifyIndex ? options.JobModifyIndex : null,
                        PolicyOverride: options.PolicyOverride ? options.PolicyOverride : null,
                        PreserveCounts: options.PreserveCounts ? options.PreserveCounts : null
                    },
                    params: {job_id: options.jobId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        stop: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.stop',
                    query: options.purge ? options.purge : null,
                    body: null,
                    params: {job_id: options.jobId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        revert: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.revert',
                    query: null,
                    body: {
                        JobID: options.JobID, 
                        EnforcePriorVersion: options.EnforcePriorVersion ? options.EnforcePriorVersion : null,
                        JobVersion: options.JobVersion ? options.JobVersion : null,
                        ConsulToken: options.ConsulToken ? options.ConsulToken : null,
                        VaultToken: options.VaultToken ? options.VaultToken : null
                    },
                    params: {job_id: options.jobId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        plan: async (options) => {
            var cl = await this.lifecycleCheck("jobs")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'jobs.plan',
                    query: null,
                    body: {
                        Job: options.Job,
                        Diff: options.Diff ? options.Job : null,
                        PolicyOverride: options.PolicyOverride ? options.PolicyOverride : false
                    },
                    params: {job_id: options.jobId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
    }

    nodes = {
        list: async (options) => {
            var cl = await this.lifecycleCheck("nodes")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'nodes.list',
                    query: options ? options.query ? options.query : null : null,
                    body: null,
                    params: null
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        read: async (options) => {
            var cl = await this.lifecycleCheck("nodes")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'nodes.read',
                    query: null,
                    body: null,
                    params: {node_id: options.nodeId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        drain: async (options) => {
            var cl = await this.lifecycleCheck("nodes")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'nodes.drain',
                    query: null,
                    body: {DrainSpec: options.DrainSpec},
                    params: {node_id: options.nodeId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        purge: async (options) => {
            var cl = await this.lifecycleCheck("nodes")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'nodes.purge',
                    query: null,
                    body: null,
                    params: {node_id: options.nodeId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        },
        eligibility: async (options) => {
            var cl = await this.lifecycleCheck("nodes")
            if(cl[0] === true){
                var request = await this.makeRequest({
                    path: 'nodes.eligibility',
                    query: null,
                    body: {Eligibility: options.Eligibility},
                    params: {node_id: options.nodeId}
                }).catch(k => {return [false,null];})
                return request
            }else{
                console.log(`Rejected action, lifecycle issues: ${cl[1]}`)
                return [false,null];
            }
        }
    }
}
module.exports = Hostel