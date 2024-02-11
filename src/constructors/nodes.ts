import { ClusterRequest } from "types/Hostel.types"
import { NodesDrainRequest, NodesEligibilityRequest, NodesListRequest, NodesPurgeRequest, NodesReadRequest } from "types/Nodes.types"

function list(Use: NodesListRequest) {
    let Request: ClusterRequest = {
        path: `nodes.list`,
        query: Use?.query ?? {},
        body: {},
        params: {}
    }
    return Request
}

function read(Use: NodesReadRequest) {
    let Request: ClusterRequest = {
        path: `nodes.read`,
        query: Use?.query ?? {},
        body: {},
        params: {"node_id":Use.node_id}
    }
    return Request
}

function drain(Use: NodesDrainRequest) {
    let Request: ClusterRequest = {
        path: `nodes.drain`,
        query: Use?.query ?? {},
        body: {
            DrainSpec: Use.drain_spec
        },
        params: {"node_id":Use.node_id}
    }
    return Request
}

function purge(Use: NodesPurgeRequest) {
    let Request: ClusterRequest = {
        path: `nodes.purge`,
        query: Use?.query ?? {},
        body: {},
        params: {"node_id":Use.node_id}
    }
    return Request
}

function eligibility(Use: NodesEligibilityRequest) {
    let Request: ClusterRequest = {
        path: `nodes.eligibility`,
        query: Use?.query ?? {},
        body: {
            Eligibility: Use.eligibility
        },
        params: {"node_id":Use.node_id}
    }
    return Request
}

const NodesConstructor = {
    list,
    read,
    drain,
    purge,
    eligibility,
}

export default NodesConstructor