export type AllocationListRequest = {
    alloc_id?: string
    query?: Record<string, string>
}

export type AllocationReadRequest = {
    alloc_id: string
    query?: Record<string, string>
}

export type AllocationStopRequest = {
    alloc_id: string
    query?: Record<string, string>
}

export type AllocationSignalRequest = {
    alloc_id: string
    signal: string
    task: string
    query?: Record<string, string>
}

export type AllocationRestartRequest = {
    alloc_id: string
    query?: Record<string, string>
}