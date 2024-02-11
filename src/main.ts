import { AsyncLocalStorage } from 'node:async_hooks'
import { ClusterRequest, ClusterResponse, HostelClient } from 'types/Hostel.types'
import axios, { type AxiosInstance } from 'axios'
import http from 'node:http'
import https from 'node:https'
import Schema from './schema'
import { AllocationListRequest, AllocationReadRequest, AllocationRestartRequest, AllocationSignalRequest, AllocationStopRequest } from 'types/Allocations.types'
import AllocationConstructor from './constructors/allocations'
import { JobsCreateRequest, JobsListRequest, JobsParseRequest, JobsPlanRequest, JobsReadRequest, JobsRevertRequest, JobsStopRequest, JobsUpdateRequest } from 'types/Jobs.types'
import JobsConstructor from './constructors/jobs'
import { NodesDrainRequest, NodesEligibilityRequest, NodesListRequest, NodesPurgeRequest, NodesReadRequest } from 'types/Nodes.types'
import NodesConstructor from './constructors/nodes'
import SystemConstructor from './constructors/system'

export default class Hostel {
    config: HostelClient
    request: AxiosInstance
    flags: {
        ready: boolean
    }
    constructor(Config: HostelClient){
        this.config = Config
        this.request = axios.create()
        this.flags = {
            ready: false
        }
        this.boot()
    }

    private boot() {
        let ConnectionURL: string
        
        ConnectionURL = this.config.connectionUrl

        this.request = axios.create({
            baseURL: ConnectionURL,
            httpAgent: new http.Agent({
                keepAlive: true
            }),
            headers: {
                'X-Nomad-Token': process.env.NOMAD_TOKEN
            },
            httpsAgent: this.config.ssl ? new https.Agent({
                keepAlive: true,
                key: this.config.ssl.privateKey,
                cert: this.config.ssl.cert,
                ca: this.config.ssl.ca
            }) : undefined
        })

        this.flags.ready = true
    }

    private async makeRequest(use: ClusterRequest): Promise<ClusterResponse> {
        if (!this.flags.ready) {
            throw new Error('Hostel client is not ready')
        }

        let Request: ClusterRequest
        let Response: any

        Request = use

        
        if (Request.query) {
            Request.path = `${Request.path}?${new URLSearchParams(Request.query)}`
        }

        if (Request.params) {
            Object.keys(Request.params).forEach((key) => {
                Request.path = Request.path.replace(`:${key}`, Request.params[key])
            })
        }

        let Method = Schema[use.path].type as 'get' | 'post' | 'delete' | 'put'

        if (Request.body) {
            Response = this.request[Method](Request.path, Request.body)
        } else {
            Response = await this.request.get(Request.path)
        }

        let Payload: ClusterResponse = {
            status: 0,
            statusText: Response.statusText,
            success: false,
            data: undefined
        }

        if (Response.status >= 200 && Response.status < 300) {
            Payload.success = true
            Payload.status = Response.status
            Payload.data = Response.data
        }else{
            Payload.success = false
            Payload.status = Response.status
        }
        
        return Payload
    }

    allocations = {
        list: async (Request: AllocationListRequest) => this.makeRequest(AllocationConstructor.list(Request)),
        read: async (Request: AllocationReadRequest) => this.makeRequest(AllocationConstructor.read(Request)),
        stop: async (Request: AllocationStopRequest) => this.makeRequest(AllocationConstructor.stop(Request)),
        signal: async (Request: AllocationSignalRequest) => this.makeRequest(AllocationConstructor.signal(Request)),
        restart: async (Request: AllocationRestartRequest) => this.makeRequest(AllocationConstructor.restart(Request)),
    }
    
    jobs = {
        list: async (Request: JobsListRequest) => this.makeRequest(JobsConstructor.list(Request)),
        read: async (Request: JobsReadRequest) => this.makeRequest(JobsConstructor.read(Request)),
        create: async (Request: JobsCreateRequest) => this.makeRequest(JobsConstructor.create(Request)),
        parse: async (Request: JobsParseRequest) => this.makeRequest(JobsConstructor.parse(Request))    ,
        update: async (Request: JobsUpdateRequest) => this.makeRequest(JobsConstructor.update(Request)),
        stop: async (Request: JobsStopRequest) => this.makeRequest(JobsConstructor.stop(Request)),
        revert: async (Request: JobsRevertRequest) => this.makeRequest(JobsConstructor.revert(Request)),
        plan: async (Request: JobsPlanRequest) => this.makeRequest(JobsConstructor.plan(Request)),
    }

    nodes = {
        list: async (Request: NodesListRequest) => this.makeRequest(NodesConstructor.list(Request)),
        read: async (Request: NodesReadRequest) => this.makeRequest(NodesConstructor.read(Request)),
        drain: async (Request: NodesDrainRequest) => this.makeRequest(NodesConstructor.drain(Request)),
        purge: async (Request: NodesPurgeRequest) => this.makeRequest(NodesConstructor.purge(Request)),
        eligibility: async (Request: NodesEligibilityRequest) => this.makeRequest(NodesConstructor.eligibility(Request)),
    }

    system = {
        forceGC: async () => this.makeRequest(SystemConstructor.forceGC())
    }

} 