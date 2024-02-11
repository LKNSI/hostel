import { FlattenedSchema } from "types/Hostel.types";

const BaseSchema = {
    ACLTokens:{
        readSelf:{
            query: [],
            params: [],
            body: [],
            type: "get",
            action: false,
            path: "/acl/token/self"
        }
    },
    allocations:{
        list:{
            query: [
                "prefix",
                "namespace",
                "resources",
                "task_states"
            ],
            params:[],
            body: [],
            type: "get",
            action: false,
            path: "/allocations",
        },
        read:{
            query: [],
            params:["alloc_id"],
            body: [],
            type: "get",
            action: false,
            path: "/allocation",
        },
        stop:{
            query: [],
            params:["alloc_id"],
            body: [],
            type: "post",
            action: "stop",
            path: "/allocation",
        },
        signal:{
            query: [],
            params:["alloc_id"],
            body: ["Signal","Task"],
            type: "post",
            action: "signal",
            path: "/allocation",
        },
        restart:{
            query: [],
            params:["alloc_id"],
            body: [],
            type: "post",
            action: "restart",
            path: "/allocation",
        }
    },
    jobs:{
        list:{
            query: ["prefix","namespace"],
            params:[],
            body: [],
            type: "get",
            action: false,
            path: "/jobs",
        },
        read:{
            query: [],
            params:["job_id"],
            body: [],
            type: "get",
            action: false,
            path: "/job",  
        },
        create:{
            query: [],
            params:[],
            body: ["Job","EnforceIndex","JobModifyIndex","PolicyOverride","PreserveCounts"],
            type: "post",
            action: false,
            path: "/jobs",
        },
        parse:{
            query: [],
            params:[],
            body: ["JobHCL","Canonicalize"],
            type: "post",
            action: false,
            path: "/jobs/parse",
        },
        update:{
            query: [],
            params:["job_id"],
            body: ["Job","EnforceIndex","JobModifyIndex","PolicyOverride","PreserveCounts"],
            type: "post",
            action: false,
            path: "/job",
        },
        stop:{
            query: ["purge"],
            params:["job_id"],
            body: [],
            type: "delete",
            action: false,
            path: "/job",
        },
        revert:{
            query: [],
            params:["job_id"],
            body: ["JobID","EnforcePriorVersion","JobVersion","ConsulToken","VaultToken"],
            type: "delete",
            action: false,
            path: "/job",
        },
        plan:{
            query: [],
            params:["job_id"],
            body: ["Job","Diff","PolicyOverride"],
            type: "delete",
            action: false,
            path: "/job",
        }
    },
    nodes:{
        list:{
            query: ["prefix","resources"],
            params:[],
            body: [],
            type: "get",
            action: false,
            path: "/nodes",
        },
        read:{
            query: [],
            params:["node_id"],
            body: [],
            type: "get",
            action: false,
            path: "/node",
        },
        drain:{
            query: [],
            params:["node_id"],
            body: ["DrainSpec"],
            type: "post",
            action: "drain",
            path: "/node",
        },
        purge:{
            query: [],
            params:["node_id"],
            body: [],
            type: "post",
            action: "purge",
            path: "/node",
        },
        eligibility:{
            query: [],
            params:["node_id"],
            body: ["Eligibility"],
            type: "post",
            action: "eligibility",
            path: "/node",
        },
    },
    system:{
        forceGC:{
            query: [],
            params:[],
            body: [],
            type: "put",
            action: false,
            path: "/system/gc", 
        }
    }

}

const Schema: FlattenedSchema = {
    'ACLTokens.readSelf': BaseSchema.ACLTokens.readSelf,
    'allocations.list': BaseSchema.allocations.list,
    'allocations.read': BaseSchema.allocations.read,
    'allocations.stop': BaseSchema.allocations.stop,
    'allocations.signal': BaseSchema.allocations.signal,
    'allocations.restart': BaseSchema.allocations.restart,
    'jobs.list': BaseSchema.jobs.list,
    'jobs.read': BaseSchema.jobs.read,
    'jobs.create': BaseSchema.jobs.create,
    'jobs.parse': BaseSchema.jobs.parse,
    'jobs.update': BaseSchema.jobs.update,
    'jobs.stop': BaseSchema.jobs.stop,
    'jobs.revert': BaseSchema.jobs.revert,
    'jobs.plan': BaseSchema.jobs.plan,
    'nodes.list': BaseSchema.nodes.list,
    'nodes.read': BaseSchema.nodes.read,
    'nodes.drain': BaseSchema.nodes.drain,
    'nodes.purge': BaseSchema.nodes.purge,
    'nodes.eligibility': BaseSchema.nodes.eligibility,
    'system.forceGC': BaseSchema.system.forceGC
};


export default Schema