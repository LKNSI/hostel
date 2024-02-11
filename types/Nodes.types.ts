export type NodesListRequest = {
    query?: Record<string, string>
}

export type NodesReadRequest = {
    node_id: string
    query?: Record<string, string>
}

export type NodesDrainRequest = {
    node_id: string
    drain_spec: Record<string, any> | any
    query?: Record<string, string>
}

export type NodesPurgeRequest = {
    node_id: string
    query?: Record<string, string>
}

export type NodesEligibilityRequest = {
    node_id: string
    eligibility: Record<string, any> | any
    query?: Record<string, string>
}
