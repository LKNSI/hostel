export type JobsListRequest = {
    query?: Record<string, string>
}

export type JobsReadRequest = {
    job_id: string
    query?: Record<string, string>
}

export type JobsCreateRequest = {
    job: Record<string, any> | any
    enforce_index?: boolean,
    policy_override?: boolean,
    preserve_counts?: boolean,
    query?: Record<string, string>
}

export type JobsParseRequest = {
    job_hcl: string
    canonicalize?: boolean,
    query?: Record<string, string>
}

export type JobsUpdateRequest = {
    job_id: string
    job: Record<string, any> | any
    enforce_index?: boolean,
    policy_override?: boolean,
    preserve_counts?: boolean,
    query?: Record<string, string>
}

export type JobsStopRequest = {
    job_id: string,
    purge?: boolean,
    query?: Record<string, string>
}

export type JobsRevertRequest = {
    job_id: string,
    enforce_prior_version?: boolean,
    job_version?: number,
    consul_token?: string,
    vault_token?: string,
    query?: Record<string, string>
}

export type JobsPlanRequest = {
    job: Record<string, any> | any
    job_id?: string,
    diff?: boolean,
    policy_override?: boolean,
    query?: Record<string, string>
}