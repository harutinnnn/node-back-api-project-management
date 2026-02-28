import {NextFunction, Request, Response} from "express";
import {memberSkills, skills, users} from "../db/schema";
import {and, eq, inArray} from "drizzle-orm";
import bcrypt from "bcrypt";
import {AppContext} from "../types/app.context.type";
import {MemberSchema} from "../schemas/members.schema";
import {UserRoles} from "../enums/UserRoles";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {mailService} from "../modules/mail/mail.service";
import {newMemberTemplate} from "../modules/mail/templates/newMember.template";
import {generatePassword} from "../helpers/password.helper";
import * as fs from "node:fs";
import path from "node:path";
import {UserType} from "../types/user.type";
import {SkillType} from "../types/skill.type";
import {Statuses} from "../enums/Statuses";

export class MembersController {


    constructor(private context: AppContext) {
    }


    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            if (req.user?.companyId) {

                const membersJoinSkills: { user: UserType, skills: SkillType[] }[] = []
                const members: UserType[] = await this.context.db
                    .select().from(users)
                    .where(eq(users.companyId, req.user?.companyId));

                const memberIds: number[] = members.map(member => member.id);
                if (memberIds.length > 0) {
                    const skillsResult: SkillType[] = await this.context.db
                        .select({id: skills.id, name: skills.name, memberId: memberSkills.memberId}).from(memberSkills)
                        .innerJoin(skills, eq(memberSkills.skillId, skills.id))
                        .where(inArray(memberSkills.memberId, memberIds));

                    members.forEach((member) => {
                        membersJoinSkills.push({
                            user: member,
                            skills: skillsResult.filter(skill => skill.memberId === member.id),
                        });
                    })
                }


                res.json(membersJoinSkills);
            } else {
                res.json([]);
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }

    }


    get = async (req: Request, res: Response, next: NextFunction) => {

        const {id} = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {

                const [member] =
                    await this.context.db
                        .select().from(users)
                        .where(and(eq(users.id, id), eq(users.companyId, req.user.companyId)));
                delete member.password;
                return res.json(member);

            } else {
                return res.status(400).json({error: "Email and password are required"});
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }

    }

    /**
     * @param req
     * @param res
     */
    create = async (req: Request, res: Response) => {

        const validatedData = MemberSchema.parse(req.body);


        try {

            const currentUser = req.user;

            if (currentUser?.role === UserRoles.ADMIN) {


                const [user] = await this.context.db.select().from(users).where(eq(users.email, validatedData.email));

                if (!user) {


                    const pass = generatePassword(8);
                    const hashedPassword = await bcrypt.hash(pass, 10);

                    const result = await this.context.db.insert(users).values({
                        name: validatedData.name,
                        email: validatedData.email,
                        phone: validatedData.phone,
                        gender: validatedData.gender,
                        companyId: req.user?.companyId,
                        professionId: validatedData.professionId,
                        role: UserRoles.USER,
                        password: hashedPassword,
                        status: Statuses.PUBLISHED

                    }).$returningId();


                    //Send mail
                    await mailService.sendMail({
                        to: validatedData.email,
                        subject: "Creation new member account",
                        html: newMemberTemplate(validatedData.name, pass),
                    });


                    res.json({
                        id: result[0].id,
                    });

                } else {

                    res.status(201).json({error: "Email already used!"});

                }
            } else {
                res.status(201).json({error: "You dont have a permission to create member!"});
            }

        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create member"});
        }
    }

    avatar = async (req: Request, res: Response) => {

        const avatarFolderPath = path.join(__dirname, '../../uploads/members');


        try {

            if (!fs.existsSync(avatarFolderPath)) {
                fs.mkdirSync(avatarFolderPath)
            }

            const name = req.file?.filename;
            const imagePath = req.file?.path as string;

            const [member] = await this.context.db.select().from(users).where(eq(users.id, Number(req.user?.id)));

            if (member) {

                const newPath = path.join(__dirname, `../../uploads/members/${name}`);
                fs.rename(imagePath, newPath, async (err) => {
                    if (!err) {

                        if (member.avatar && member.avatar.length) {

                            const oldAvatar = path.join(__dirname, '../../', member.avatar);


                            if (fs.existsSync(oldAvatar)) {
                                fs.unlinkSync(oldAvatar)
                            }
                        }
                        const imageUrl = `/uploads/members/${name}`
                        await this.context.db.update(users).set({avatar: imageUrl}).where(eq(users.id, Number(req.user?.id)));


                        res.json({avatar: imageUrl})
                    } else {
                        res.status(201).json({error: "Some thing went wrong"})
                    }
                })
            } else {
                res.status(201).json({error: "Some thing went wrong"})
            }
        } catch (err) {
            console.log(err)

        }

    }

    delete = async (req: Request, res: Response) => {

        const validatedData = IdParamSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                await this.context.db.delete(users).where(and(eq(users.id, validatedData.id), eq(users.companyId, req.user?.companyId)))

                res.json({});
            } else {
                res.status(500).json({error: "Failed to create project"});
            }

        } catch (error) {

            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}