import { ClusterRequest } from "types/Hostel.types"

function forceGC(){
    let Request: ClusterRequest = {
        path: `system.forceGC`,
        query: {},
        body: {},
        params: {}
    }
    return Request
}

const SystemConstructor = {
    forceGC
}

export default SystemConstructor