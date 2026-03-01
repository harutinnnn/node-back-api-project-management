import {AppContext} from "../types/app.context.type";
import {boardColumns, projects, tasks} from "../db/schema";
import {and, asc, eq, inArray, sql} from "drizzle-orm";
import {BoardDataType, ColumnInnerTaskIds, ColumnInnerTaskIdsQuery, ColumnType} from "../types/board.data.type";

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

                const columns: ColumnType[] = await this.context.db.select().from(boardColumns).where(eq(boardColumns.projectId, projectId));

                if (columns) {

                    const columnInnerTaskIds: ColumnInnerTaskIds[] = []

                    const columnIds = columns.map(column => column.id);

                    let tasksData: any[] = [];

                    if (columnIds.length) {
                        tasksData = await this.context.db.select().from(tasks).where(inArray(tasks.columnId, columnIds));

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
                .where(eq(boardColumns.projectId, projectId));


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


}