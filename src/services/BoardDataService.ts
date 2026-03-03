import {AppContext} from "../types/app.context.type";
import {boardColumns, projects, taskMembers, tasks} from "../db/schema";
import {and, asc, eq, inArray, sql} from "drizzle-orm";
import {BoardDataType, ColumnInnerTaskIds, ColumnInnerTaskIdsQuery, ColumnType} from "../types/board.data.type";
import {Statuses} from "../enums/Statuses";

export class BoardDataService {

    constructor(private context: AppContext) {
    }


    /**
     * @param companyId
     * @param projectId
     */
    getBoardData = async (companyId: number, projectId: number): Promise<BoardDataType> => {

        try {

            const boardDataType: BoardDataType = {
                columns: [],
                tasks: []
            }

            const project = await this.context.db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.companyId, companyId)));

            if (project) {

                const columns: ColumnType[] = await this.context.db.select().from(boardColumns).where(and(
                    eq(boardColumns.projectId, projectId),
                    eq(boardColumns.status, Statuses.ACTIVE)
                ));

                if (columns) {

                    const columnInnerTaskIds: ColumnInnerTaskIds[] = []

                    const columnIds = columns.map(column => column.id);

                    let tasksData: any[] = [];

                    if (columnIds.length) {
                        tasksData = await this.context.db
                            .select({
                                ...tasks,
                                assignee: sql<string>`GROUP_CONCAT
                                (
                                ${taskMembers.userId}
                                SEPARATOR
                                ','
                                )`
                            })
                            .from(tasks)
                            .leftJoin(taskMembers, eq(tasks.id, taskMembers.taskId))
                            .groupBy(tasks.id)
                            .where(inArray(tasks.columnId, columnIds))
                            .orderBy(asc(tasks.pos));

                        boardDataType.tasks = tasksData;

                        columns.map(column => {

                            const colTmpData: ColumnInnerTaskIds = {
                                id: column.id,
                                title: column.title,
                                taskIds: tasksData.filter(task => task.columnId === column.id).map(task => task.id),
                                pos: column.pos
                            }
                            columnInnerTaskIds.push(colTmpData);
                        })
                        boardDataType.columns = columnInnerTaskIds;


                        tasksData.map(task => {
                            console.log(task.assignee)
                            if (typeof task.assignee === "string") {
                                task.assignee = task.assignee.split(',').map((assignee: any) => Number(assignee));
                            } else {
                                task.assignee = [];
                            }
                        })
                    }

                    return {
                        columns: columnInnerTaskIds,
                        tasks: tasksData
                    }

                } else {
                    throw new Error("Failed to fetch board data")
                }

            } else {
                throw new Error("Failed to fetch board data")
            }

        } catch (err) {
            if (err instanceof Error) {
                throw new Error(err.message)
            } else {
                throw new Error("Unknown error")
            }
        }
    }


    sortBoardColumns = async (projectId: number, columns: number[]): Promise<ColumnInnerTaskIds[]> => {

        try {

            const colsSort = columns?.map(async (col, index) => {
                const pos = index + 1
                return await this.context.db.update(boardColumns).set({pos}).where(and(eq(boardColumns.projectId, Number(projectId)), eq(boardColumns.id, col)));
            })

            await Promise.all(colsSort)

            const columnsResult: ColumnInnerTaskIdsQuery[] = await this.context.db
                .select({
                    id: boardColumns.id,
                    title: boardColumns.title,
                    pos: boardColumns.pos,
                    taskIds: sql<string>`GROUP_CONCAT
                    (
                    ${tasks.id}
                    SEPARATOR
                    ','
                    )`
                })
                .from(boardColumns)
                .leftJoin(tasks, eq(boardColumns.id, tasks.columnId))
                .orderBy(asc(boardColumns.pos))
                .groupBy(boardColumns.id)
                .where(and(eq(boardColumns.projectId, projectId),eq(boardColumns.status, Statuses.ACTIVE)));

            console.log(columnsResult)


            const parsedColumns: ColumnInnerTaskIds[] = [];

            columnsResult.map(col => {

                parsedColumns.push({
                    id: col.id,
                    title: col.title,
                    pos: col.pos,
                    taskIds: col?.taskIds ? col?.taskIds.split(',').map(taskId => Number(taskId)) : []
                })

            })

            return parsedColumns;


        } catch (err) {

            if (err instanceof Error) {
                throw new Error(err.message)
            } else {
                throw new Error("Unknown error")
            }

        }


    }

    sortBoardColumnTasks = async (
        columns: {
            columnId: number,
            taskIds: number[],
        }[],
        draggedTaskId: number | undefined
    ): Promise<void> => {


        try {

            const colTasksSort = columns.map(async (column) => {

                column.taskIds.map(async (taskId, index) => {

                    const pos = index + 1;
                    return await this.context.db.update(tasks).set({
                        pos: pos,
                        columnId: Number(column.columnId)
                    }).where(eq(tasks.id, taskId));
                })
            })

            await Promise.all(colTasksSort)


            if (draggedTaskId) {
                //TODO set notification to connected users
            }

        } catch (err) {

            if (err instanceof Error) {
                throw new Error(err.message)
            } else {
                throw new Error("Unknown error")
            }

        }


    }


}