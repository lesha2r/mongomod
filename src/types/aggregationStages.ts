interface StageAddFields {
    $addFields: {[key: string]: any}
}
interface StageBucket {
    $bucket: {
        groupBy: string,
        boundaries: number[],
        default?: any,
        output: {[key: string]: any}
    }
}

interface StageBucketAuto {
    $bucketAuto: {
        groupBy: string,
        buckets: number,
        granularity: string,
        output: {[key: string]: any}
    }   
}

interface StageChangeStream {
    $changeStream: {
        allChangesForCluster: boolean,
        fullDocument: string,
        fullDocumentBeforeChange: string,
        resumeAfter: any,
        showExpandedEvents: boolean,
        startAfter: any
        startAtOperationTime: Date
    }
}

interface StageChangeStreamSplitLargeEvent {
    $changeStreamSplitLargeEvent: any
}

interface StageCollStats {
    $collStats: {
        latencyStats: { histograms: boolean },
        storageStats: { scale: number },
        count: {},
        queryExecStats: {}
    }
}

interface StageCount {
    $count: string
}

interface StageCurrentOp {
    $currentOp: {
        allUsers: boolean,
        idleConnections: boolean,
        idleCursors: boolean,
        idleSessions: boolean,
        localOps: boolean
     }
}

interface StageDensify {
    $densify: {
      field: string,
      partitionByFields: string[],
      range: {
         step: number,
         unit: string,
         bounds: "full" | "partition" | [number, number]
      }
   }
}

interface StageDocuments {
    $documents: any[]
}

interface StageFacet {
    $facet: {[key: string]: any[]}
}

interface StageFill {
    $fill: {
      partitionBy: any,
      partitionByFields: string[],
      sortBy: {
         [key: string]: "asc" | "desc"
      },
      output: {
         [key: string]: { value: any } | { method: string }
      }
   }
}

interface StageGeoNear {
    $geoNear: {
        distanceField: string,
        distanceMultipler?: number,
        includeLocs?: string,
        key?: string,
        maxDistance?: number,
        minDistance?: number,
        query?: {[key: string]: any},
        spherical?: boolean,
    }
}

interface StageGraphLookup {
    $graphLookup: {
      from: string,
      startWith: string,
      connectFromField: string,
      connectToField: string,
      as: string,
      maxDepth: number,
      depthField: string,
      restrictSearchWithMatch: {[key: string]: any}
   } 
}

interface StageGroup {
    $group: {
        _id: any,
        [key: string]: any
    }
}

interface StageIndexStats {
    $indexStats: {}
}

interface StageLimit {
    $limit: number
}

interface StageListClusterCatalog {
    $listClusterCatalog: {
        shards: boolean,
        balancingConfiguration: boolean,
    }
}

interface StageListLocalSessions {
    $listLocalSessions: any
}

interface StageListSampledQueries {
    $listSampledQueries: any
}

interface StageListSearchIndexes {
    $listSearchIndexes: any
}

interface StageListSessions {
    $listSessions: any
}

interface StageLookupBase {
    from: string,
    localField: string,
    foreignField: string,
    as: string
}

interface StageLookupPipeline {
    from: string,
    let: {[key: string]: any}
    pipeline: any[],
    as: string
}

type StageLookup = StageLookupBase | StageLookupPipeline;

interface StageMatch {
    $match: {[key: string]: any}
}

interface StageMerge {
    $merge: {
        into: string,
        whenMatched?: 'replace' | 'keepExisting' | 'merge' | 'fail' | 'pipeline',
        whenNotMatched?: 'insert' | 'discard' | 'fail',
        on?: string[],
        let?: {[key: string]: any}
    }
}

interface StageOut {
    $out: any
}

interface StagePlanCacheStats {
    $planCacheStats: any
}

interface StageProject {
    $project: {[key: string]: any}
}

interface StageQuerySettings {
    $querySettings: any
}

interface StageQueryStats {
    $queryStats: any
}

interface StageRedact {
    $redact: any
}

interface StageReplaceRoot {
    $replaceRoot: {
        newRoot: any
    }
}

interface StageReplaceWith {
    $replaceWith: any
}

interface StageSample {
    $sample: {
        size: number
    }
}

interface StageSearch {
    $search: any
}

interface StageSearchMeta {
    $searchMeta: any
}

interface StageSet {
    $set: {[key: string]: any}
}

interface StageSetWindowFields {
    $setWindowFields: any
}

interface StageShardedDataDistribution {
    $shardedDataDistribution: any
}

interface StageSkip {
    $skip: number
}

interface StageSort {
    $sort: {[key: string]: number}
}

interface StageSortByCount {
    $sortByCount: any
}

interface StageUnionWith {
    $unionWith: any
}


interface StageUnset {
    $unset: string[]
}

interface StageUnwind {
    $unwind: any
}

interface StageVectorSearch {
    $vectorSearch: any
}

export type AggregationStage =
    StageMatch |
    StageGroup |
    StageSort |
    StageUnset |
    StageUnwind |
    StageVectorSearch |
    StageUnionWith |
    StageProject |
    StageLimit |
    StageSkip |
    StageLookup |
    StageAddFields |
    StageBucket |
    StageBucketAuto |
    StageChangeStream |
    StageChangeStreamSplitLargeEvent |
    StageCollStats |
    StageCount |
    StageCurrentOp |
    StageDensify |
    StageDocuments |
    StageFacet |
    StageFill |
    StageGeoNear |
    StageGraphLookup |
    StageIndexStats |
    StageListClusterCatalog |
    StageListLocalSessions |
    StageListSampledQueries |
    StageListSearchIndexes |
    StageListSessions |
    StageMerge |
    StageOut |
    StagePlanCacheStats |
    StageQuerySettings |
    StageQueryStats |
    StageRedact |
    StageReplaceRoot |
    StageReplaceWith |
    StageSample |
    StageSearch |
    StageSearchMeta |
    StageSet |
    StageSetWindowFields |
    StageShardedDataDistribution |
    StageSkip |
    StageSortByCount |
    StageVectorSearch;  