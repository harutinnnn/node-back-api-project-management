export type SkillType = {
    id: number,
    name: string,
    companyId: number
    memberId?: number
}

export type MemberSkillsType = {
    memberId: number,
    skillId: string,
}