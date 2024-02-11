import { ClusterRequest } from "types/Hostel.types"
import {JobsCreateRequest, JobsListRequest, JobsParseRequest, JobsPlanRequest, JobsReadRequest, JobsRevertRequest, JobsStopRequest, JobsUpdateRequest} from "types/Jobs.types"

function list(Use: JobsListRequest) {
    let Request: ClusterRequest = {
        path: `jobs.list`,
        query: Use?.query ?? {},
        body: {},
        params: {}
    }
    return Request

}

function read(Use: JobsReadRequest) {
    let Request: ClusterRequest = {
        path: `jobs.read`,
        query: Use?.query ?? {},
        body: {},
        params: {"job_id":Use.job_id}
    }
    return Request
}

function create(Use: JobsCreateRequest) {
    let Request: ClusterRequest = {
        path: `jobs.create`,
        query: Use?.query ?? {},
        body: {
            Job: Use.job,
            EnforceIndex: Use.enforce_index,
            JobModifyIndex: Use.policy_override,
            PolicyOverride: Use.preserve_counts
        },
        params: {}
    }
    return Request
}

function parse(Use: JobsParseRequest) {
    let Request: ClusterRequest = {
        path: `jobs.parse`,
        query: Use?.query ?? {},
        body: {
            JobHCLjob_hcl: Use.job_hcl,
            Canonicalize: Use.canonicalize
        },
        params: {}
    }
    return Request
}

function update(Use: JobsUpdateRequest) {
    let Request: ClusterRequest = {
        path: `jobs.update`,
        query: Use?.query ?? {},
        body: {
            Job: Use.job,
            EnforceIndex: Use.enforce_index,
            JobModifyIndex: Use.policy_override,
            PolicyOverride: Use.preserve_counts
        },
        params: {"job_id":Use.job_id}
    }
    return Request

}

function stop(Use: JobsStopRequest) {

    let Query = Use?.query ?? {}

    if (Use.query?.purge) {
        Query.purge = Use.query.purge
    }

    let Request: ClusterRequest = {
        path: `jobs.stop`,
        query: Query,
        body: {},
        params: {"job_id":Use.job_id}
    }
    return Request
}

function revert(Use: JobsRevertRequest) {
    let Request: ClusterRequest = {
        path: `jobs.revert`,
        query: Use?.query ?? {},
        body: {
            JobID: Use.job_id,
            EnforcePriorVersion: Use.enforce_prior_version,
            JobVersion: Use.job_version,
            ConsulToken: Use.consul_token,
            VaultToken: Use.vault_token
        },
        params: {"job_id":Use.job_id}
    }
    return Request
}

function plan(Use: JobsPlanRequest) {
    let Request: ClusterRequest = {
        path: `jobs.plan`,
        query: Use?.query ?? {},
        body: {
            Job: Use.job,
            Diff: Use.diff,
            PolicyOverride: Use.policy_override
        },
        params: {"job_id":Use?.job_id ?? ""}
    }
    return Request
}

const JobsConstructor = {
    list,
    read,
    create,
    parse,
    update,
    stop,
    revert,
    plan
}

export default JobsConstructor  