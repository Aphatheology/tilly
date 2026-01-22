import { Group, type co } from "jazz-tools"
import { IbaadahGroup } from "#shared/schema/group"

export { createIbaadahGroupInviteLink }

async function createIbaadahGroupInviteLink(
	group: co.loaded<typeof IbaadahGroup>,
): Promise<string> {
	let owner = group.$jazz.owner
	if (!(owner instanceof Group)) {
		throw new Error("Group owner not found")
	}

	let myRole = owner.myRole()
	if (myRole !== "admin") {
		throw new Error("Only admins can create invite links")
	}

	let inviteGroup = Group.create()
	owner.addMember(inviteGroup, "writer")
	let inviteSecret = inviteGroup.$jazz.createInvite("writer")

	let baseURL = `${window.location.origin}/app/invite`
	return `${baseURL}#/group/${group.$jazz.id}/invite/${inviteGroup.$jazz.id}/${inviteSecret}`
}
