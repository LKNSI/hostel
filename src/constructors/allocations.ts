import { AllocationListRequest, AllocationReadRequest, AllocationRestartRequest, AllocationSignalRequest, AllocationStopRequest } from "types/Allocations.types"
import { ClusterRequest } from "types/Hostel.types"

function list(Use: AllocationListRequest) {
    let Request: ClusterRequest = {
        path: `allocations.list`,
        query: Use?.query ?? {},
        body: {},
        params: {}
    }
    return Request
}


function read(Use: AllocationReadRequest) {
    let Request: ClusterRequest = {
        path: `allocations.read`,
        query: Use?.query ?? {},
        body: {},
        params: {"alloc_id":Use.alloc_id}
    }
    return Request
}

function stop(Use: AllocationReadRequest) {
    let Request: ClusterRequest = {
        path: `allocations.stop`,
        query: Use?.query ?? {},
        body: {},
        params: {"alloc_id":Use.alloc_id}
    }
    return Request
}

function signal(Use: AllocationSignalRequest) {
    let Request: ClusterRequest = {
        path: `allocations.signal`,
        query: Use?.query ?? {},
        body: {Signal: Use.signal, Task: Use.task},
        params: {"alloc_id":Use.alloc_id}
    }
    return Request
}

function restart(Use: AllocationRestartRequest) {
    let Request: ClusterRequest = {
        path: `allocations.restart`,
        query: Use?.query ?? {},
        body: {},
        params: {"alloc_id":Use.alloc_id}
    }
    return Request
}

const AllocationConstructor = {
    list,
    read,
    stop,
    signal,
    restart
}

export default AllocationConstructor