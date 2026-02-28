import {z} from "zod";

export enum Statuses {
    PENDING = 'pending',
    PUBLISHED = 'published',
    DOING = 'doing',
    FOR_CHECK = 'for_check',
    FINISHED = 'finished',
    CANCELED = 'canceled',
    NOT_ACTIVATED = 'not_activated',
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    BLOCKED = 'blocked',
    COMPLETED = 'completed',
    COMPLETED_SUCCESS = 'completed_success',
    COMPLETED_FAILED = 'completed_failed',
    COMPLETED_ERROR = 'completed_error',
}

export enum ProjectStatuses {
    PENDING = Statuses.PENDING,
    ACTIVE = Statuses.ACTIVE,
    COMPLETED = Statuses.COMPLETED,
    CANCELED = Statuses.CANCELED
}

export enum BoardColumnStatuses {
    ACTIVE = Statuses.ACTIVE,
    ARCHIVED = Statuses.ARCHIVED
}
