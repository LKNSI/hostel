enum Version {
    V1 = '/v1',
    V2 = '/v2'

}

export type HostelClient = {
    connectionUrl: string
    version: Version
    ssl?: {
        privateKey?: string
        ca?: string
        cert?: string
    }
    clusterAuth?: {
        options?: {
            ignoreSecretTLSWarning?: boolean
        }
    }
}

export type ClusterRequest = {
    path: string
    query: Record<string, string>
    body: Record<string, any>
    params: Record<string, string>
}

export type ClusterResponse = {
    status: number
    statusText: string
    success: boolean
    data: any
}

export interface RequestSchema {
    query: string[];
    params: string[];
    body: string[];
    type: string;
    action: boolean | string;
    path: string;
}

export interface FlattenedSchema {
    [key: string]: RequestSchema;
}